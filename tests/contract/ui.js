import assert from 'node:assert/strict';
import {record,context} from './samples.js';
export async function checkBaseUI(m) {
  for(const name of ['stateLabel','originLabel','valueWithContext','accessibleTable','lineChart','dataStateBadge','attentionBadge']) assert.equal(typeof m[name],'function',`missing ${name}`);
  for(const [state,text] of [['recorded','recorded'],['confirmed_none','confirmed nothing new'],['not_recorded','not recorded']]) assert.equal(m.stateLabel({...record,state}),text);
  const origins=['synthetic','ground_analog','terrestrial','flight','cell_culture'];
  const labels=origins.map(o=>m.originLabel(o));
  assert.equal(new Set(labels).size,5);
  for(const label of labels) assert.equal(typeof label,'string');
  assert.match(m.originLabel('unknown'),/unknown/i);
  // Component output shapes remain M07's responsibility; semantic text must survive.
  const attention=JSON.stringify(m.attentionBadge({status:'no_criterion'}));
  assert.match(attention,/no attention criterion/i); assert.doesNotMatch(attention,/"normal"|"OK"/);
  const badge=JSON.stringify(m.dataStateBadge({...record,state:'not_recorded',value:undefined},context));
  assert.match(badge,/not recorded|not_recorded/); assert.doesNotMatch(badge,/normal/i);
}
export async function checkView(m,{services={},params={},element,actions={}}={}) {
  const vm=await m.model(services,params);
  assert.ok(['loading','empty','error','ready'].includes(vm.state),'view must return a ViewModel');
  if(vm.state==='empty') assert.equal(typeof vm.reason,'string');
  assert.equal(typeof m.mount,'function');
  assert.ok(element,'caller must supply a browser DOM element to test mount');
  m.mount(element,vm,actions);
}
