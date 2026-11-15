/** Mission configuration boundary. No equipment inference or clinical rules. */
const MODES = ['real_time', 'delayed', 'no_link'];
const ENVIRONMENTS = ['station', 'spacecraft', 'rover', 'surface_base'];
// Resource bounds protect the parser; they are not medical thresholds.
const MAX_ITEMS = 1000;
const MAX_TEXT = 4096;
const MAX_ID = 256;
const fields = ['id', 'name', 'schema_version', 'available_equipment', 'communication',
  'phases', 'environment', 'gravity_note', 'attention_criteria'];
const has = (object, key) => Object.hasOwn(object, key);
const fail = field => ({ok:false, error:{code:'invalid_config', field, message:`Invalid or missing field ${field}`}});
const text = (value, max = MAX_TEXT) => typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value);

function plain(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function shapeError(value, allowed, path) {
  if (!plain(value)) return path;
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') return path;
    const full = path === 'config' ? key : `${path}.${key}`;
    if (!allowed.includes(key)) return full;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!has(descriptor, 'value') || !descriptor.enumerable) return full;
  }
  return null;
}
function timestamp(value) {
  if (typeof value !== 'string') return NaN;
  const match = /^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match) return NaN;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return NaN;
  const canonical = `${match[1]}.${(match[2] ?? '').padEnd(3, '0')}Z`;
  return new Date(ms).toISOString() === canonical ? ms : NaN;
}
function list(value) {
  if (!Array.isArray(value) || value.length > MAX_ITEMS || Object.getPrototypeOf(value) !== Array.prototype) return false;
  // Dense data arrays only; reject accessors and extra/symbol properties before reads.
  for (const key of Reflect.ownKeys(value)) {
    if (key === 'length') continue;
    if (typeof key !== 'string' || !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!has(descriptor, 'value') || !descriptor.enumerable) return false;
  }
  for (let i = 0; i < value.length; i++) if (!has(value, i)) return false;
  return true;
}

/** Validate into a detached plain-data configuration. schema_version may be
 * absent before persistence; when supplied, known legacy1 and current2 versions are read unchanged. */
export function validateConfig(data) {
  const error = shapeError(data, fields, 'config');
  if (error) return fail(error);
  for (const field of ['id', 'name', 'available_equipment', 'communication', 'phases', 'environment', 'attention_criteria']) {
    if (!has(data, field)) return fail(field);
  }
  if (!text(data.id, MAX_ID)) return fail('id');
  if (!text(data.name)) return fail('name');
  if (has(data, 'schema_version') && ![1,2].includes(data.schema_version)) return fail('schema_version');
  if (!MODES.includes(data.communication)) return fail('communication');
  if (!ENVIRONMENTS.includes(data.environment)) return fail('environment');
  if (has(data, 'gravity_note') && !text(data.gravity_note)) return fail('gravity_note');
  if (!list(data.available_equipment) || data.available_equipment.some(id => !text(id, MAX_ID)) || new Set(data.available_equipment).size !== data.available_equipment.length) return fail('available_equipment');
  if (!list(data.phases)) return fail('phases');
  const intervals = [];
  for (let i = 0; i < data.phases.length; i++) {
    const phase = data.phases[i], path = `phases[${i}]`;
    const error = shapeError(phase, ['name', 'from', 'to'], path);
    if (error) return fail(error);
    if (!text(phase.name, MAX_ID)) return fail(`${path}.name`);
    const from = timestamp(phase.from), to = timestamp(phase.to);
    if (!Number.isFinite(from)) return fail(`${path}.from`);
    if (!Number.isFinite(to)) return fail(`${path}.to`);
    if (from >= to) return fail(path);
    intervals.push({from, to});
  }
  intervals.sort((a, b) => a.from - b.from);
  if (intervals.some((phase, i) => i > 0 && phase.from < intervals[i - 1].to)) return fail('phases');
  if (!list(data.attention_criteria)) return fail('attention_criteria');
  const ids = new Set();
  for (let i = 0; i < data.attention_criteria.length; i++) {
    const criterion = data.attention_criteria[i], path = `attention_criteria[${i}]`;
    const error = shapeError(criterion, ['id', 'variable', 'unit', 'low', 'high', 'defined_by', 'source', 'review_status'], path);
    if (error) return fail(error);
    for (const field of ['id', 'variable', 'unit', 'defined_by', 'source', 'review_status']) {
      if (!text(criterion[field], ['id', 'variable', 'unit'].includes(field) ? MAX_ID : MAX_TEXT)) return fail(`${path}.${field}`);
    }
    if (!['demo', 'reviewed'].includes(criterion.review_status)) return fail(`${path}.review_status`);
    if (!has(criterion, 'low') && !has(criterion, 'high')) return fail(path);
    for (const bound of ['low', 'high']) if (has(criterion, bound) && (typeof criterion[bound] !== 'number' || !Number.isFinite(criterion[bound]))) return fail(`${path}.${bound}`);
    if (has(criterion, 'low') && has(criterion, 'high') && criterion.low > criterion.high) return fail(path);
    if (ids.has(criterion.id)) return fail('attention_criteria');
    ids.add(criterion.id);
  }
  // All reachable values have passed bounded plain-data checks; no accessors execute.
  return {ok:true, value:structuredClone(data)};
}

export function hasEquipment(config, equipmentId) {
  if (!text(equipmentId, MAX_ID)) return false;
  const checked = validateConfig(config);
  return checked.ok && checked.value.available_equipment.includes(equipmentId);
}

export function phaseAt(config, time) {
  const ms = timestamp(time);
  if (!Number.isFinite(ms)) return null;
  const checked = validateConfig(config);
  if (!checked.ok) return null;
  const phase = checked.value.phases.find(phase => timestamp(phase.from) <= ms && ms < timestamp(phase.to));
  return phase?.name ?? null;
}
