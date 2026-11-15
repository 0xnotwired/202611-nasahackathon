// Technical input bounds only. They are not medical ranges or thresholds.
const MAX_NODES = 128;
const MAX_DEPTH = 4;
const MAX_TEXT = 16384;
export const own = (object, key) => Object.hasOwn(object, key);
export const text = (value, maximum = 512) => typeof value === 'string'
  && value.trim().length > 0 && value.length <= maximum && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
export const error = (field, detail = 'Invalid or missing') => ({ok:false,error:{code:'invalid_field',field,message:`${detail} field ${field}`}});

/** Copy only bounded ordinary JSON data; reject accessors without invoking them. */
export function snapshot(input) {
  let visited = 0;
  const seen = new Set();
  function visit(value, field, depth) {
    if (++visited > MAX_NODES || depth > MAX_DEPTH) throw field;
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'string') {if (value.length > MAX_TEXT) throw field; return value;}
    if (typeof value === 'number') {if (!Number.isFinite(value)) throw field; return value;}
    if (typeof value !== 'object' || seen.has(value)) throw field;
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw field;
    const keys = Reflect.ownKeys(value);
    if (keys.length > 32) throw field;
    seen.add(value);
    const output = {};
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 64 || ['__proto__','constructor','prototype'].includes(key)) throw field;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !own(descriptor,'value')) throw key;
      Object.defineProperty(output,key,{value:visit(descriptor.value,key,depth+1),writable:true,enumerable:true,configurable:true});
    }
    seen.delete(value);
    return output;
  }
  try {return {ok:true,value:visit(input,'record',0)};}
  catch (field) {return error(typeof field === 'string' ? field : 'record');}
}

/** UTC extended calendar timestamp, seconds precision with optional 1–3 decimals. */
export function utc(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match) return false;
  const [,year,month,day,hour,minute,second,fraction=''] = match;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return false;
  const canonical = `${year}-${month}-${day}T${hour}:${minute}:${second}.${fraction.padEnd(3,'0')}Z`;
  return new Date(time).toISOString() === canonical;
}
