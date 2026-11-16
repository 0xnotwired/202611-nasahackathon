// G5-W2 at the importer level, on the real files when they are on this machine (data/originals is outside git): every cell of every file is compared with
// what the importer produced, using a separate, naive reader. A present cell is a recorded value equal to the text parsed as a number; an empty or NA cell is
// "not recorded" with no value. A file that is not on this machine skips its test: it never passes by default, and the skip says so.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {importCRF, importAdaptation, importGlucose} from '../../app/importers/index.js';

const ROOT = new URL('../../data/originals/', import.meta.url);
// The reader's own, narrower rule: only an empty cell or the literal NA is missing in these files (checked by reading them). The importer also accepts N/A and NAN; a wrong extra token cannot hide behind this reader.
const missing = value => ['', 'NA'].includes((value ?? '').trim());
function readRows(text, delimiter) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(line => line.length);
  assert.equal(lines.some(line => line.includes('"')), false, 'the naive reader needs files without quoted cells');
  const header = lines[0].split(delimiter);
  return lines.slice(1).map(line => Object.fromEntries(line.split(delimiter).map((cell, index) => [header[index], cell])));
}
function compare(output, rows, columns) {
  assert.equal(output.ok, true, JSON.stringify(output.error)); const {records, rejected} = output.value;
  assert.equal(rejected.length, 0, 'no row was rejected'); assert.equal(records.length, rows.length * columns.length, 'one record per source cell');
  const bad = [];
  rows.forEach((row, r) => columns.forEach((column, c) => {
    const record = records[r * columns.length + c]; const absent = missing(row[column]);
    const same = absent ? record.state === 'not_recorded' && !Object.hasOwn(record, 'value') : record.state === 'recorded' && record.value === Number(row[column]);
    if (!same) bad.push({r, column, source: row[column], record: record && {state: record.state, value: record.value}});
  }));
  assert.deepEqual(bad, [], 'every cell equals its source cell'); return records;
}
const CASES = [
  ['CRF', 'CRF-daily-vitals.csv', ',', text => importCRF(text), ['Pulse', 'SysBP', 'DiaBP', 'Resp Rate', 'Weight', 'Body Temp', 'Height']],
  ['MR079G', 'MR079G-muscle-function.csv', ',', text => importAdaptation(text, {study: 'MR079G'}), ['Value']],
  ['MR035G', 'additional/MR035G-sample-1.csv', ',', text => importAdaptation(text, {study: 'MR035G'}), ['NET_AVG_BMD']],
  ['MR080G', 'additional/MR080G-sample-1.csv', ',', text => importAdaptation(text, {study: 'MR080G'}), ['HR', 'VO2', 'VCO2', 'RER', 'VO2 (ml/kg/min)', 'VE', 'FEO2', 'FECO2']],
  ['BUT_CGM', 'but-cgm-1.0.0/101001_CGM.csv', ';', text => importGlucose(text, {subject: '101001'}), ['Glycemia']]
];
for (const [name, file, delimiter, run, columns] of CASES) {
  const path = new URL(file, ROOT);
  test(`G5-R1 ${name}: every cell of the real file equals what the importer produced`, {skip: existsSync(path) ? false : `${file} is not on this machine (data/originals is outside git)`}, () => {
    const text = readFileSync(path, 'utf8'); const records = compare(run(text), readRows(text, delimiter), columns);
    assert.equal(records.filter(r => r.state === 'not_recorded' && r.value === 0).length, 0, 'an empty cell is never a zero');
  });
}
const crfPath = new URL('CRF-daily-vitals.csv', ROOT);
test('G5-R3 CRF: the free-text count is the number of cells with real text, not the token NA (independent count)', {skip: existsSync(crfPath) ? false : 'CRF-daily-vitals.csv is not on this machine'}, () => {
  const text = readFileSync(crfPath, 'utf8'); const rows = readRows(text, ',');
  const real = rows.flatMap(row => ['Comment', 'Bowel Movement Description'].map(column => row[column])).filter(value => !missing(value)).length;
  assert.ok(real > 0, 'the file has some real free text, so this test can fail'); assert.equal(importCRF(text).value.skipped.length, real);
});

test('G5-R4 CRF and MR079G: the source clock of every record is the file\'s own date read as month/day/year (independent parse)', {skip: existsSync(crfPath) ? false : 'CRF-daily-vitals.csv is not on this machine'}, () => {
  const text = readFileSync(crfPath, 'utf8'); const rows = readRows(text, ','); const out = importCRF(text).value.records; const per = 7;
  rows.forEach((row, r) => { const [m, d, y] = row.Date.split('/').map(Number); const [h, min] = row['Vitals Time'].split(':').map(Number);
    const expected = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    for (let c = 0; c < per; c += 1) assert.equal(out[r * per + c].source_time.value, expected, `row ${r + 2}`); });
});

test('G5-R2: the comparison itself fails on a file whose cell the importer would change (negative control)', () => {
  const text = 'Timestamp;Glycemia\n2139-03-02 12:22:17;3.7\n2139-03-02 12:27:17;\n';
  const records = compare(importGlucose(text, {subject: 's'}), readRows(text, ';'), ['Glycemia']); assert.equal(records[1].state, 'not_recorded');
  assert.throws(() => compare(importGlucose(text, {subject: 's'}), readRows(text.replace('3.7', '3.8'), ';'), ['Glycemia']), {code: 'ERR_ASSERTION'});
});
