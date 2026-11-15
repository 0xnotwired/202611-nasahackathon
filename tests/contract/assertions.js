import assert from 'node:assert/strict';
export function success(result) {
  assert.equal(result?.ok,true, 'valid operation must succeed, not return not_implemented');
  assert.ok(Object.hasOwn(result,'value'));
  return result.value;
}
export function failure(result) {
  assert.equal(result?.ok,false);
  assert.equal(typeof result.error.code,'string');
  assert.notEqual(result.error.code,'not_implemented','invalid-input handling must be implemented');
  assert.equal(typeof result.error.message,'string');
  assert.ok(result.error.message.length>0);
}
