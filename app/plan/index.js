// M14 plan: what was assigned, what was done and what was observed afterwards are three separate things.
// Marking a task never creates or implies a result; an unmarked task stays pending; nothing here scores, streaks or rewards.
// Tasks come from the scenario or a person (this module generates none); a task is read only on its own day.
const MAX_TEXT = 500;
const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
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

// A task is changed by one caller at a time: the read, the checks and the write share one turn of its chain.
const chains = new Map();
function serial(key, work) {
  const run = (chains.get(key) ?? Promise.resolve()).then(work, work);
  const tail = run.catch(() => {});
  chains.set(key, tail); tail.then(() => { if (chains.get(key) === tail) chains.delete(key); });
  return run;
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

/** tasksFor(store, { subject, day }) → Result<Task[]>. Only stored tasks of that subject and day; none is invented. */
export async function tasksFor(store, query) {
  const read = readQuery(query); if (!read.ok) return read;
  if (!storeHas(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  const listed = await store.list('tasks', {subject: read.value.subject, day: read.value.day});
  if (!listed.ok) return listed;
  for (const task of listed.value) if (!shapeOk(task, read.value.subject, read.value.day)) return fail('corrupt_task', 'tasks', `Task ${isPlain(task) && typeof task.id === 'string' ? task.id.slice(0, 60) : '(no id)'} is not readable`);
  return ok([...listed.value].sort((a, b) => (a.id < b.id ? -1 : 1)));
}

/** progress(store, { subject, day }) → counts of done, not done and pending. No streak, no points, nothing that depends on a result. */
export async function progress(store, query) {
  const tasks = await tasksFor(store, query); if (!tasks.ok) return tasks;
  const count = completion => tasks.value.filter(task => task.completion === completion).length;
  return ok({total: tasks.value.length, done: count('done'), not_done: count('not_done'), pending: count('pending')});
}

/** mark(store, taskId, { completion: "done" | "not_done", execution_id?, note? }). A pending task is marked once; `note` ({ reason }) belongs to not_done. */
export function mark(store, taskId, input) {
  return serial(`tasks/${taskId}`, async () => {
    if (!isPlain(input)) return fail('invalid_input', 'input', 'An input { completion } is required');
    const {completion, execution_id: executionId, note} = input;
    if (completion !== 'done' && completion !== 'not_done') return fail('invalid_completion', 'completion', 'completion must be done or not_done');
    if (note !== undefined && (completion !== 'not_done' || !isPlain(note) || !isText(note.reason))) return fail('invalid_note', 'note', 'Only a not_done task takes a note, and it is { reason: text }');
    if (executionId !== undefined && !isText(executionId)) return fail('invalid_execution', 'execution_id', 'execution_id must be an execution id');
    const loaded = await loadTask(store, taskId); if (!loaded.ok) return loaded;
    const task = loaded.value;
    if (task.completion !== 'pending') return fail('already_marked', 'completion', `The task is already ${task.completion}`);
    const changes = {completion};
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
    return store.updateState('tasks', taskId, changes);
  });
}

/** linkResult(store, taskId, recordId): links a Record observed afterwards. It never changes `completion`. */
export function linkResult(store, taskId, recordId) {
  return serial(`tasks/${taskId}`, async () => {
    if (!isText(recordId)) return fail('invalid_record', 'recordId', 'A record id is required');
    const loaded = await loadTask(store, taskId); if (!loaded.ok) return loaded;
    const task = loaded.value;
    if (!storeHas(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
    const found = await store.get('records', recordId);
    if (!found.ok) return fail('unknown_record', 'recordId', 'No record has this id');
    if (found.value.subject !== task.subject) return fail('other_subject', 'recordId', 'The record belongs to another subject');
    if (found.value.state !== 'recorded') return fail('not_a_result', 'recordId', 'Only a recorded value can be a result; a not-recorded or nothing-new entry observed nothing');
    if (task.result_ids.includes(recordId)) return ok(task);
    return store.updateState('tasks', taskId, {result_ids: [...task.result_ids, recordId]});
  });
}
