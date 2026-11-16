import test from 'node:test';
import assert from 'node:assert/strict';
import {generateScenario} from './index.js';
import {validateRecord} from '../core/index.js';
import {variables} from '../catalogs/index.js';

test('complete case covers catalog measurements, exams and habitat without replacing missing values',()=>{
 const full=generateScenario({seed:2}),basic=generateScenario({seed:1});
 assert.ok(full.records.length>=200,'complete case needs a chart history');
 for(const v of variables().filter(v=>['measurement','exam','environment'].includes(v.type))) {
  assert.ok(full.records.some(r=>r.variable===v.id&&r.state==='recorded'),v.id);
 }
 for(const r of full.records) { assert.equal(validateRecord(r).ok,true,JSON.stringify(r));assert.equal(r.origin,'synthetic');assert.match(r.note,/fictional/i); }
 const ids=new Set(basic.records.map(r=>r.id));assert.ok(full.records.every(r=>!ids.has(r.id)));
 assert.ok(full.records.some(r=>r.variable==='pulse'&&r.state==='not_recorded'&&!Object.hasOwn(r,'value')));
 assert.deepEqual(full,generateScenario({seed:2}));
 assert.equal(basic.records.length,16,'existing demo remains unchanged');
});
