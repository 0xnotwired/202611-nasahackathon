import assert from 'node:assert/strict';
import {config,time} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkMission(m) {
  assert.deepEqual(success(m.validateConfig(config)),config);
  for(const data of [null,[],{}, {...config,communication:'unknown'}, {...config,environment:'unknown'}, {...config,available_equipment:'device'}]) failure(m.validateConfig(data));
  assert.equal(m.hasEquipment(config,'demo-device'),true);
  assert.equal(m.hasEquipment(config,'missing'),false);
  assert.equal(m.phaseAt(config,time),'demo');
  assert.equal(m.phaseAt(config,'2020-01-01T00:00:00.000Z'),null);
}
