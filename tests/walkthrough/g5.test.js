// G5 walkthrough, model level (RUN). Predictions, written before this file:
//  W1 importing NASA files changes no view of the synthetic subject (deep-equal before and after, and nothing lands in the main store);
//  W2 the viewer shows what the original file says, row by row, and an empty or NaN cell is never a number;
//  W3 free-text comment cells of a source never become a record or a note, and never reach a screen.
// The browser version of W1 and W2 is tests/walkthrough/g5-browser.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as importers from '../../app/importers/index.js';
import * as readings from '../../app/readings/index.js';
import {openStore} from '../../app/store/index.js';
import {model as nasa} from '../../app/ui/nasa-cases/model.js';
import {model as health} from '../../app/ui/my-health/model.js';
import {model as adaptation} from '../../app/ui/adaptation/model.js';
import {model as habitat} from '../../app/ui/habitat/model.js';
import {model as progress} from '../../app/ui/my-progress/model.js';
import {model as day} from '../../app/ui/my-day/model.js';
import {model as plan} from '../../app/ui/my-plan/model.js';
import {model as board} from '../../app/ui/on-board/model.js';
import {model as feel} from '../../app/ui/i-feel-different/model.js';
import {model as ground} from '../../app/ui/ground/model.js';
import {makeServices, countRecords, NOW} from './fixtures.js';

const VIEWS = {health, adaptation, habitat, progress, day, plan, board, feel, ground};
const snapshot = async services => JSON.stringify(await Promise.all(Object.entries(VIEWS).map(async ([name, build]) => [name, await build(services, {})])));
let n = 0;
const nasaServices = services => ({store: services.store, importers, readings, openMemoryStore: () => openStore({kind: 'memory', name: `g5-private-${++n}`}), clock: () => NOW});
const cgm = (...rows) => `Timestamp;Glycemia\n${rows.join('\n')}\n`;
const MR079G = 'ID,Campaign,Subject,Date,Test_Phase,BR_Day,Test,Position,Value,Units\n1,C3G,9314,3/12/2009,PRE_TEST,11,Knee Concentric Strength,Extension at 60°/sec,94.1,ft-lb\n2,C3G,9314,3/12/2009,PRE_TEST,11,Knee Concentric Strength,Flexion at 60°/sec,,ft-lb\n';

test('G5-W1: importing real-shaped files changes no view of the synthetic subject, and nothing lands in the main store', async () => {
  const services = await makeServices(); const before = await snapshot(services); const records = await countRecords(services.store);
  const vm = await nasa(nasaServices(services), {}); assert.equal(vm.state, 'ready');
  let out = await vm.interactions.loadFile({source_id: 'BUT_CGM', name: '101001_CGM.csv', text: cgm('2100-01-01 08:00:00;5.5', '2100-01-01 08:05:00;', '2100-01-01 08:10:00;5.7'), subject: '101001'});
  assert.equal(out.files.length, 1, JSON.stringify(out.message));
  out = await vm.interactions.loadFile({source_id: 'MR079G', name: 'mr079g.csv', text: MR079G, subject: ''}); assert.equal(out.files.length, 2, JSON.stringify(out.message));
  assert.equal(await snapshot(services), before, 'a view of the synthetic subject changed after an import');
  assert.equal(await countRecords(services.store), records); const all = (await services.store.list('records', {})).value;
  assert.ok(all.every(r => r.origin === 'synthetic'), 'a non-synthetic record is in the main store'); assert.deepEqual(all.filter(r => ['101001', '9314'].includes(r.subject)), []);
  const same = await vm.interactions.loadFile({source_id: 'BUT_CGM', name: 'x.csv', text: cgm('2100-01-01 08:00:00;5.5'), subject: services.subject});
  assert.equal(same.message.kind, 'info', 'M22 allows the same identifier text: isolation is by store, not by name'); assert.equal(await snapshot(services), before, 'even under the synthetic subject\'s own id text, no synthetic view changed');
  assert.deepEqual((await services.store.list('records', {subject: services.subject})).value.filter(r => r.origin !== 'synthetic'), []);
});

const tableOf = out => out.panels[0].chart.table.rows;
const valueRows = rows => rows.filter(r => /^[\d.]+ mmol\/L$/.test(r.value)).map(r => Number(r.value.split(' ')[0]));

test('G5-W2: the viewer shows the file row by row, and an empty or NaN cell is never a number', async () => {
  const text = cgm('2100-01-01 08:00:00;5.5', '2100-01-01 08:05:00;', '2100-01-01 08:10:00;NaN', '2100-01-01 08:15:00;5.8', '2100-01-01 08:20:00;6.25');
  const imported = importers.importGlucose(text, {subject: '101001'}); assert.equal(imported.ok, true);
  assert.deepEqual(imported.value.records.map(r => r.state), ['recorded', 'not_recorded', 'not_recorded', 'recorded', 'recorded']);
  for (const r of imported.value.records.filter(x => x.state === 'not_recorded')) { assert.equal(Object.hasOwn(r, 'value'), false); assert.equal(r.value, undefined); }
  const services = await makeServices(); const vm = await nasa(nasaServices(services), {});
  const rows = tableOf(await vm.interactions.loadFile({source_id: 'BUT_CGM', name: 'a.csv', text, subject: '101001'}));
  assert.deepEqual(valueRows(rows), [5.5, 5.8, 6.25]); assert.ok(rows.some(r => r.value === 'no reading'), 'the empty cells read as no reading'); assert.equal(rows.some(r => /^0(\.0+)?\b/.test(r.value)), false, 'an empty cell became a number');
});

const REAL = new URL('../../data/originals/but-cgm-1.0.0/101001_CGM.csv', import.meta.url);
test('G5-W2 (real file): the first day of the real BUT CGM file, parsed independently, equals the viewer\'s table', {skip: !existsSync(REAL) && 'the original file is not on this machine (see docs/LOCAL_DATA_RESTORE.md)'}, async () => {
  const lines = readFileSync(REAL, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1).map(l => l.split(';'));
  const services = await makeServices(); const vm = await nasa(nasaServices(services), {});
  const out = await vm.interactions.loadFile({source_id: 'BUT_CGM', name: '101001_CGM.csv', text: readFileSync(REAL, 'utf8'), subject: '101001'}); assert.equal(out.files.length, 1, JSON.stringify(out.message));
  const panel = out.panels[0]; const dayText = panel.chart.day; const expected = lines.filter(([t]) => t.slice(0, 10) === dayText).map(([, v]) => v).filter(v => /^\d+(\.\d+)?$/.test(v)).map(Number);
  assert.ok(expected.length > 20, 'the first day has readings'); assert.deepEqual(valueRows(panel.chart.table.rows), expected);
  assert.equal(out.files[0].records, lines.length, 'every row of the file became a record');
});

test('G5-W3: free-text comment cells never become a record, a note or screen text', async () => {
  const MARK = 'SECRET-COMMENT-TEXT-9';
  const crf = importers.importCRF(`Subject,Date,Test_Phase,BR_Day,Vitals Time,Pulse,SysBP,DiaBP,Resp Rate,Weight,Body Temp,Height,Comment,Bowel Movement Description\n8615,7/6/2007,PRE_TEST,13,9:40,95,111,82,22,65.93,36.5,159.2,${MARK},${MARK}-bowel\n`);
  assert.equal(crf.ok, true, JSON.stringify(crf.error)); assert.ok(crf.value.records.length >= 7, 'the numeric columns were imported');
  assert.equal(crf.value.skipped.length, 2, 'both free-text cells were counted as excluded'); assert.doesNotMatch(JSON.stringify(crf.value), new RegExp(MARK));
  const withComment = MR079G.replace('Value,Units', 'Value,Units,Comment').split('\n').map((l, i) => (i === 0 || !l ? l : `${l},${MARK}`)).join('\n');
  const services = await makeServices(); const vm = await nasa(nasaServices(services), {});
  const out = await vm.interactions.loadFile({source_id: 'MR079G', name: 'with-comment.csv', text: withComment, subject: ''});
  assert.doesNotMatch(JSON.stringify(out), new RegExp(MARK), 'a comment reached the screen model');
  const direct = importers.importAdaptation(withComment, {study: 'MR079G'}); if (direct.ok) assert.doesNotMatch(JSON.stringify(direct.value), new RegExp(MARK));
});
