import test from 'node:test';
import assert from 'node:assert/strict';
import {recordsToCsv, csvCell, safeFileName, COLUMNS} from './index.js';
import {makeRecord, SUBJECT} from '../../tests/walkthrough/fixtures.js';

const parse = text => {
  const rows = []; let row = []; let cell = ''; let quoted = false; const body = text.replace(/^﻿/, '');
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (quoted) { if (c === '"' && body[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\r' && body[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i += 1; } else cell += c;
  }
  return rows;
};
const col = name => COLUMNS.indexOf(name);

test('M25-P1: a recorded value is written as its number with its unit, origin and method; the header is the fixed list of columns', () => {
  const out = recordsToCsv([makeRecord({id: 'a', value: 64, unit: 'bpm', method: 'manual cuff'})]); assert.equal(out.ok, true);
  assert.ok(out.value.startsWith('﻿')); const rows = parse(out.value); assert.deepEqual(rows[0], [...COLUMNS]);
  assert.deepEqual([rows[1][col('value')], rows[1][col('unit')], rows[1][col('origin')], rows[1][col('method')], rows[1][col('subject')]], ['64', 'bpm', 'synthetic', 'manual cuff', SUBJECT]);
});

test('M25-P2: an absent state has no value and no unit: it is never written as 0, and the three states keep their names', () => {
  const rows = parse(recordsToCsv([makeRecord({id: 'n', state: 'not_recorded'}), makeRecord({id: 'c', state: 'confirmed_none', type: 'observation', variable: 'other'}), makeRecord({id: 'r', value: 0})]).value);
  assert.deepEqual([rows[1][col('state')], rows[1][col('value')], rows[1][col('unit')]], ['not_recorded', '', '']);
  assert.deepEqual([rows[2][col('state')], rows[2][col('value')]], ['confirmed_none', '']);
  assert.deepEqual([rows[3][col('state')], rows[3][col('value')]], ['recorded', '0'], 'a real zero stays a zero');
});

test('M25-P3: the source clock and an unknown unit travel with the row; nothing is converted to UTC', () => {
  const imported = makeRecord({id: 's', time: null, source_time: {raw: '7/6/2007 9:40', value: '2007-07-06T09:40', precision: 'minute', scope: 'CRF:Campaign3:8615', calendar: 'unknown', timezone: null}, unit: null, unit_status: 'unknown', origin: 'ground_analog', value: 70});
  const row = parse(recordsToCsv([imported]).value)[1];
  assert.deepEqual([row[col('time_utc')], row[col('source_time_raw')], row[col('source_time_calendar')], row[col('source_time_scope')], row[col('unit')], row[col('unit_status')], row[col('origin')]], ['', '7/6/2007 9:40', 'unknown', 'CRF:Campaign3:8615', '', 'unknown', 'ground_analog']);
});

test('M25-P4: text that a spreadsheet reads as a formula is neutralised, numbers are not, and quotes, commas and line breaks survive', () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"'); assert.equal(csvCell('+1'), "'+1"); assert.equal(csvCell('-2'), "'-2"); assert.equal(csvCell('@a'), "'@a");
  assert.equal(csvCell(-5, {numeric: true}), '-5'); assert.equal(csvCell('a,b'), '"a,b"'); assert.equal(csvCell('x\ny'), '"x\ny"'); assert.equal(csvCell(null), ''); assert.equal(csvCell(NaN, {numeric: true}), '');
  const note = makeRecord({id: 'q', note: '=cmd|\' /C calc\'!A0, "quoted"'}); const row = parse(recordsToCsv([note]).value)[1];
  assert.match(row[col('note')], /^'=cmd/); assert.match(row[col('note')], /"quoted"/);
});

test('M25-P5: nothing is dropped or reordered, and bad input is refused', () => {
  const list = [makeRecord({id: 'b'}), makeRecord({id: 'a'}), makeRecord({id: 'c'})]; assert.deepEqual(parse(recordsToCsv(list).value).slice(1).map(r => r[0]), ['b', 'a', 'c']);
  assert.equal(parse(recordsToCsv([]).value).length, 1, 'an empty list is the header alone');
  for (const bad of [null, 'x', {}, [null], [{}], [{id: 5}]]) assert.equal(recordsToCsv(bad).ok, false, JSON.stringify(bad));
  assert.equal(recordsToCsv(new Array(100001).fill(makeRecord({id: 'z'}))).ok, false);
});

test('M25-P6: a file name made from a person\'s text cannot leave the folder or change the extension', () => {
  for (const [input, expected] of [[['../../etc/passwd'], 'etc-passwd.csv'], [['a b', 'c.exe'], 'a-b-c-exe.csv'], [[''], 'orbita.csv'], [[null, 7], 'orbita.csv'], [['x'.repeat(200)], `${'x'.repeat(80)}.csv`]])
    assert.equal(safeFileName(...input), expected);
  assert.equal(/[\\/]/.test(safeFileName('a/b\\c')), false);
});

test('M25-P14: a leading space, a line break or a fullwidth look-alike before a formula is neutralised too; a known unit says "known"', () => {
  for (const text of [' =1+1', '\n=1+1', '＝1+1', '＋1', '＠SUM(A1)']) assert.match(csvCell(text), /^"?'/, JSON.stringify(text));
  assert.equal(csvCell('plain text'), 'plain text');
  const rows = parse(recordsToCsv([makeRecord({id: 'k', unit: 'bpm'}), makeRecord({id: 'u', unit: null, unit_status: 'unknown', value: 3}), makeRecord({id: 'n', state: 'not_recorded'})]).value);
  assert.deepEqual([rows[1][col('unit_status')], rows[2][col('unit_status')], rows[3][col('unit_status')]], ['known', 'unknown', '']);
});
