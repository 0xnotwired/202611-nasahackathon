import assert from 'node:assert/strict';
import {failure} from './assertions.js';
export async function checkImporters(m,fixtures) {
  for(const [fn,args] of [['importCRF',[]],['importAdaptation',[{study:'MR079G'}]],['importGlucose',[{subject:'terrestrial-subject'}]]]) {
    for(const input of [null,{},[],7]) failure(m[fn](input,...args));
  }
  // File formats must come from verified source fixtures, never invented CSV headers.
  assert.ok(fixtures?.length>0,'supply verified importer fixture files and expected records');
  for(const {method,text,options,expected} of fixtures) assert.deepEqual(m[method](text,options),expected);
}
