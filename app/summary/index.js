// M18 summary: plain text for the ground, generated from an episode. It sends and shares nothing (sharing goes through privacy.logShared).
// Origins are separated, the three record states keep their own words, and free-text notes are never included.
import {situation as episodeSituation} from '../episode/index.js';

const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const isText = value => typeof value === 'string' && value.length > 0;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value));
const ORIGIN = Object.freeze({synthetic: 'fictional data', ground_analog: 'ground analog data, not an astronaut', terrestrial: 'terrestrial data, not an astronaut', flight: 'flight data', cell_culture: 'cell culture, not a person'});

function valueWords(r) {
  if (r.state === 'not_recorded') return 'not recorded';
  if (r.state === 'confirmed_none') return 'confirmed nothing new';
  if (typeof r.value !== 'number') return 'recorded (no numeric value)';
  return isText(r.unit) && r.unit !== 'not_applicable' ? `${r.value} ${r.unit}` : `${r.value} (unit unknown)`;
}
const line = r => `- ${r.variable ?? 'value'}: ${valueWords(r)} · method ${r.method ?? 'not stated'} · ${r.time ?? 'time not established'}`;

/** generate(store, episodeId, config, { clock }) → Result<{ id, text, origins, pending_send }>. Reads only; nothing is sent. */
export async function generate(store, episodeId, config, context) {
  if (!isPlain(store) || typeof store.get !== 'function') return fail('invalid_store', 'store', 'A store with get() is required');
  if (!isPlain(config) || !isText(config.communication)) return fail('invalid_config', 'config', 'The mission configuration must state its communication');
  if (!isPlain(context) || typeof context.clock !== 'function') return fail('invalid_context', 'clock', 'A clock is required');
  let now; try { now = context.clock(); } catch { now = undefined; }
  if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  const found = await episodeSituation(store, episodeId, config, context);
  if (found.ok === false) return found;
  const episode = (await store.get('episodes', episodeId)).value;
  const entries = [...found.you_recorded, ...found.we_know];
  const origins = [...new Set(entries.map(r => r.origin).filter(Boolean))].sort();
  const first = found.you_recorded.find(r => r.id === episode.observation_id);

  const out = [`Episode summary ${episodeId}`, `Subject ${episode.subject}. Opened ${episode.opened}${episode.closed && episode.closed !== true ? `, closed ${episode.closed}` : episode.closed ? ', closed' : ''}. Link: ${config.communication.replace('_', ' ')}.`, ''];
  out.push('1. What happened');
  out.push(first ? `Observation ${first.variable}: ${first.state === 'recorded' ? 'recorded by the person' : valueWords(first)}${first.time ? ` at ${first.time}` : ''}.` : 'The starting observation is not readable.');
  for (const h of found.happened) out.push(`Procedure ${h.procedure_id} version ${h.procedure_version}: ${{completed: 'completed', interrupted: `interrupted after ${h.current_step} of ${h.step_count} steps`, could_not: `could not be completed${h.difficulties.length ? ` (difficulty: ${h.difficulties.join('; ')})` : ''}`, in_progress: `in progress, ${h.current_step} of ${h.step_count} steps done`, blocked: 'blocked, equipment missing'}[h.state] ?? h.state}.`);
  if (!found.happened.length) out.push('No procedure was run for this episode.');
  out.push('', '2. What was measured and how');
  for (const origin of origins) {
    out.push(`Origin: ${origin} (${ORIGIN[origin] ?? 'origin not described'})`);
    for (const r of entries.filter(item => item.origin === origin).sort((a, b) => ((a.time ?? '') < (b.time ?? '') ? -1 : (a.time ?? '') > (b.time ?? '') ? 1 : a.id < b.id ? -1 : 1))) out.push(line(r));
  }
  if (!origins.length) out.push('No value was recorded.');
  out.push('', '3. What is missing');
  for (const g of found.missing) out.push(g.kind === 'not_recorded' ? `- ${g.variable}: not recorded` : g.kind === 'equipment' ? `- equipment ${g.item} is not in the mission configuration (needed by ${g.needed_by.join(', ')})` : `- ${g.count} record(s) have no established time and could not be placed`);
  if (!found.missing.length) out.push(`Nothing was found missing among what was looked at: ${entries.length} record(s) of this episode and the procedures published here.`);
  out.push('', '4. What is being asked');
  for (const t of found.next) out.push(`- Pending: ${t.description}`);
  if (!found.next.length) out.push('No request is attached to this episode. Say what you need from the ground before sending.');
  return {ok: true, value: {id: `${episodeId}:${now}`, text: out.join('\n'), origins, pending_send: config.communication !== 'real_time'}};
}
