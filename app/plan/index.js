// M14 plan: what was assigned, what was done and what was observed afterwards are three separate things.
// Marking a task never creates or implies a result; an unmarked task stays pending; nothing here scores, streaks or rewards.
// A person can create a task or schedule a periodic exam on days they choose; a mark can be undone and the history keeps every step.
// Writers are safe against each other, also across browser tabs: every change is a conditional update on the revision that was read.
const MAX_TEXT = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const RETRIES = 12; // contention in one process or across tabs: read again after a short, growing pause
const pause = attempt => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 4 * (attempt + 1))));
const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value.slice(0, 10);
const COMPLETION = Object.freeze(['pending', 'done', 'not_done']);
const storeHas = (store, names) => isPlain(store) && names.every(name => typeof store[name] === 'function');

function validDay(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(day)) return false;
  const parsed = new Date(`${day}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}
function readQuery(query) {
  if (!isPlain(query)) return fail('invalid_query', 'query', 'A query { subject, day } is required');
  if (!isText(query.subject)) return fail('invalid_query', 'subject', 'A subject is required; none is assumed');
  if (!validDay(query.day)) return fail('invalid_query', 'day', 'day must be a real date as YYYY-MM-DD');
  return ok({subject: query.subject, day: query.day});
}
const shapeOk = (task, subject, day) => isPlain(task) && isText(task.id) && task.subject === subject && task.day === day && COMPLETION.includes(task.completion) && Array.isArray(task.result_ids);

function stamp(options) {
  if (!isPlain(options) || options.clock === undefined) return ok(null);
  let now; try { now = typeof options.clock === 'function' ? options.clock() : undefined; } catch { now = undefined; }
  return isInstant(now) ? ok(now) : fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
}

async function loadTask(store, id) {
  if (!storeHas(store, ['get', 'updateState'])) return fail('invalid_store', 'store', 'A store with get() and updateState() is required');
  if (!isText(id)) return fail('invalid_id', 'taskId', 'A task id is required');
  const found = await store.get('tasks', id);
  if (!found.ok) return found.error && found.error.code === 'not_found' ? fail('not_found', 'taskId', 'No task has this id') : found;
  const task = found.value;
  if (!isPlain(task) || !isText(task.subject) || !COMPLETION.includes(task.completion) || !Array.isArray(task.result_ids)) return fail('corrupt_task', 'taskId', `Task ${id.slice(0, 60)} is not readable`);
  return ok(task);
}

// Read, decide, write conditionally on the revision that was read (a task from the scenario has none yet, and counts as absent);
// if another writer got there first, read again.
async function change(store, taskId, decide) {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const loaded = await loadTask(store, taskId); if (!loaded.ok) return loaded;
    const task = loaded.value;
    const decided = await decide(task); if (!decided.ok) return decided;
    const written = await store.updateState('tasks', taskId, {...decided.value.changes, rev: (Number.isInteger(task.rev) ? task.rev : 0) + 1},
      {expect: {rev: Number.isInteger(task.rev) ? task.rev : null}});
    if (written.ok || !written.error || written.error.code !== 'conflict') return written;
    await pause(attempt);
  }
  return fail('conflict', 'taskId', 'The task kept changing under another writer; try again');
}

/** tasksFor(store, { subject, day }) → Result<Task[]>. Only stored tasks of that subject and day; none is invented. */
export async function tasksFor(store, query) {
  const read = readQuery(query); if (!read.ok) return read;
  if (!storeHas(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  const listed = await store.list('tasks', {subject: read.value.subject, day: read.value.day});
  if (!listed.ok) return listed;
  for (const task of listed.value) if (!shapeOk(task, read.value.subject, read.value.day)) return fail('corrupt_task', 'tasks', `Task ${isPlain(task) && typeof task.id === 'string' ? task.id.slice(0, 60) : '(no id)'} is not readable`);
  return ok([...listed.value].sort((a, b) => ((a.scheduled_at ?? '') < (b.scheduled_at ?? '') ? -1 : (a.scheduled_at ?? '') > (b.scheduled_at ?? '') ? 1 : a.id < b.id ? -1 : 1)));
}

/** progress(store, { subject, day }) → counts of done, not done and pending. No streak, no points, nothing that depends on a result. */
export async function progress(store, query) {
  const tasks = await tasksFor(store, query); if (!tasks.ok) return tasks;
  const count = completion => tasks.value.filter(task => task.completion === completion).length;
  return ok({total: tasks.value.length, done: count('done'), not_done: count('not_done'), pending: count('pending')});
}

function readTaskInput(input) {
  if (!isPlain(input)) return fail('invalid_input', 'input', 'A task { subject, description, scheduled_at, planned_minutes } is required');
  if (!isText(input.subject)) return fail('invalid_input', 'subject', 'A subject is required; none is assumed');
  if (!isText(input.description)) return fail('invalid_input', 'description', 'A description is required');
  if (!Number.isInteger(input.planned_minutes) || input.planned_minutes <= 0 || input.planned_minutes > 1440) return fail('invalid_input', 'planned_minutes', 'planned_minutes must be a whole number of minutes from 1 to 1440');
  if (input.procedure_id !== undefined && !isText(input.procedure_id)) return fail('invalid_input', 'procedure_id', 'procedure_id must be a procedure id');
  if (input.assigned_by !== undefined && !isText(input.assigned_by)) return fail('invalid_input', 'assigned_by', 'assigned_by must say who assigned the task');
  return ok(input);
}
function readContext(context) {
  if (!isPlain(context) || typeof context.newId !== 'function') return fail('invalid_context', 'context', 'An id generator is required');
  return ok(context);
}
const taskOf = (input, id, scheduledAt, extra = {}) => ({id, schema_version: 2, subject: input.subject, day: scheduledAt.slice(0, 10), description: input.description, assigned_by: input.assigned_by ?? 'self',
  completion: 'pending', result_ids: [], scheduled_at: scheduledAt, planned_minutes: input.planned_minutes, rev: 0, ...(input.procedure_id !== undefined ? {procedure_id: input.procedure_id} : {}), ...extra});

/** createTask(store, { subject, description, scheduled_at, planned_minutes, procedure_id?, assigned_by? }, { newId }) → Result<Task>. `assigned_by` defaults to "self". */
export async function createTask(store, input, context) {
  if (!storeHas(store, ['save'])) return fail('invalid_store', 'store', 'A store with save() is required');
  const read = readTaskInput(input); if (!read.ok) return read;
  if (!isInstant(read.value.scheduled_at)) return fail('invalid_input', 'scheduled_at', 'scheduled_at must be an ISO8601 UTC instant');
  const ctx = readContext(context); if (!ctx.ok) return ctx;
  let id; try { id = ctx.value.newId(); } catch { return fail('invalid_context', 'newId', 'The id generator failed'); }
  if (!isText(id)) return fail('invalid_id', 'newId', 'The id generator did not return text');
  return store.save('tasks', taskOf(read.value, id, read.value.scheduled_at));
}

/**
 * scheduleSeries(store, { ...task fields, first_scheduled_at, every_days, count }, { newId }) → Result<Task[]>.
 * A periodic exam falls only on the days the person chose: every_days apart, `count` times, created all or none.
 */
export async function scheduleSeries(store, input, context) {
  if (!storeHas(store, ['saveBatch'])) return fail('invalid_store', 'store', 'A store with saveBatch() is required');
  const read = readTaskInput(input); if (!read.ok) return read;
  const {first_scheduled_at: first, every_days: every, count} = read.value;
  if (!isInstant(first)) return fail('invalid_input', 'first_scheduled_at', 'first_scheduled_at must be an ISO8601 UTC instant');
  if (!Number.isInteger(every) || every < 1 || every > 365) return fail('invalid_input', 'every_days', 'every_days must be a whole number of days from 1 to 365; it is never assumed');
  if (!Number.isInteger(count) || count < 2 || count > 52) return fail('invalid_input', 'count', 'count must be a whole number from 2 to 52');
  const ctx = readContext(context); if (!ctx.ok) return ctx;
  let seriesId; const tasks = [];
  try {
    seriesId = ctx.value.newId(); if (!isText(seriesId)) throw new Error('id');
    for (let k = 0; k < count; k += 1) { const id = ctx.value.newId(); if (!isText(id)) throw new Error('id'); tasks.push(taskOf(read.value, id, new Date(Date.parse(first) + k * every * DAY_MS).toISOString(), {series_id: seriesId})); }
  } catch { return fail('invalid_id', 'newId', 'The id generator did not return text'); }
  const saved = await store.saveBatch('tasks', tasks);
  return saved.ok ? ok(tasks) : saved;
}

/** mark(store, taskId, { completion: "done" | "not_done", execution_id?, note?, clock? }). A pending task is marked; `note` ({ reason }) belongs to not_done. */
export async function mark(store, taskId, input) {
  if (!isPlain(input)) return fail('invalid_input', 'input', 'An input { completion } is required');
  const {completion, execution_id: executionId, note} = input;
  if (completion !== 'done' && completion !== 'not_done') return fail('invalid_completion', 'completion', 'completion must be done or not_done');
  if (note !== undefined && (completion !== 'not_done' || !isPlain(note) || !isText(note.reason))) return fail('invalid_note', 'note', 'Only a not_done task takes a note, and it is { reason: text }');
  if (executionId !== undefined && !isText(executionId)) return fail('invalid_execution', 'execution_id', 'execution_id must be an execution id');
  const time = stamp(input); if (!time.ok) return time;
  return change(store, taskId, async task => {
    if (task.completion !== 'pending') return fail('already_marked', 'completion', `The task is already ${task.completion}; undo the mark first to change it`);
    const changes = {completion, history: [...(Array.isArray(task.history) ? task.history : []), {completion, at: time.value, ...(note !== undefined ? {note: {reason: note.reason}} : {}), ...(executionId !== undefined ? {execution_id: executionId} : {})}]};
    if (executionId !== undefined) {
      if (!storeHas(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
      const found = await store.get('executions', executionId);
      if (!found.ok) return fail('unknown_execution', 'execution_id', 'No execution has this id');
      const execution = found.value;
      if (execution.subject !== task.subject) return fail('other_subject', 'execution_id', 'The execution belongs to another subject');
      if (isText(task.procedure_id) && execution.procedure_id !== task.procedure_id) return fail('procedure_mismatch', 'execution_id', 'The execution is of another procedure');
      if (completion === 'done' && execution.state !== 'completed') return fail('execution_not_completed', 'execution_id', 'A task is done only with a completed execution');
      changes.execution_id = executionId;
    }
    if (note !== undefined) changes.not_done_note = {reason: note.reason};
    return ok({changes});
  });
}

/** reopenTask(store, taskId, { reason, clock? }): undoes a mark. The history keeps the earlier mark and the reason; linked results stay (they were observed). */
export async function reopenTask(store, taskId, input) {
  if (!isPlain(input) || !isText(input.reason)) return fail('invalid_reason', 'reason', 'Say why the mark is being undone');
  const time = stamp(input); if (!time.ok) return time;
  return change(store, taskId, async task => {
    if (task.completion === 'pending') return fail('not_marked', 'completion', 'The task is not marked, so there is nothing to undo');
    return ok({changes: {completion: 'pending', execution_id: null, not_done_note: null, history: [...(Array.isArray(task.history) ? task.history : []), {completion: 'pending', at: time.value, reason: input.reason}]}});
  });
}

/** linkResult(store, taskId, recordId): links a Record observed afterwards. It never changes `completion`. */
export async function linkResult(store, taskId, recordId) {
  if (!isText(recordId)) return fail('invalid_record', 'recordId', 'A record id is required');
  return change(store, taskId, async task => {
    if (!storeHas(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
    const found = await store.get('records', recordId);
    if (!found.ok) return fail('unknown_record', 'recordId', 'No record has this id');
    if (found.value.subject !== task.subject) return fail('other_subject', 'recordId', 'The record belongs to another subject');
    if (found.value.state !== 'recorded') return fail('not_a_result', 'recordId', 'Only a recorded value can be a result; a not-recorded or nothing-new entry observed nothing');
    if (task.result_ids.includes(recordId)) return ok({changes: {}});
    // "Observed afterwards": the value needs an established time that is not before the task's start (its scheduled instant, or the start of its day).
    const from = typeof task.scheduled_at === 'string' ? task.scheduled_at : `${task.day}T00:00:00.000Z`;
    if (typeof found.value.time !== 'string' || Number.isNaN(Date.parse(found.value.time))) return fail('time_not_established', 'recordId', 'The value has no established time, so it cannot be placed after the task');
    if (Date.parse(found.value.time) < Date.parse(from)) return fail('observed_before', 'recordId', 'The value was observed before the task started, so it is not a result of it');
    return ok({changes: {result_ids: [...task.result_ids, recordId]}});
  });
}
