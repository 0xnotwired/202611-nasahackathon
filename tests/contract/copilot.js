import assert from 'node:assert/strict';
import {config} from './samples.js';
export async function checkCopilot(m) {
  const input={you_recorded:[],we_know:[],missing:['demo gap'],you_can:[],happened:[],next:[]};
  const before=structuredClone(input);
  const output=m.card(input,config,[]);
  assert.equal(output.suggestion,null); assert.equal(output.no_guidance,true); assert.equal(output.alert,null);
  assert.deepEqual(output.gaps,['demo gap']);
  assert.ok(Object.hasOwn(output,'data')); assert.ok(Object.hasOwn(output,'not_assessed'));
  assert.deepEqual(input,before);
}
