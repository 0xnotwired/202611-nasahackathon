// DOM only. Draws My plan: progress, then each task with assigned, done and result on separate lines.
// Native controls: a button marks a task done; a text field and a button mark it not done with its reason. Typed reasons survive a failed save.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const reasons = new Map(); const undo = new Map(); const draft = {description: '', scheduled_at: '', planned_minutes: '', procedure_id: '', every_days: '', count: ''};
  const el = (tag, attrs = {}, ...children) => {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    for (const child of children) if (child !== null && child !== undefined) node.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
    return node;
  };

  async function apply(work, focusId) {
    current = await work;
    draw();
    const back = doc.getElementById(focusId) ?? doc.getElementById('plan-message');
    if (back) { if (!back.hasAttribute('tabindex') && back.tagName === 'P') back.setAttribute('tabindex', '-1'); back.focus(); }
  }

  function progress(section) {
    const parts = [el('h3', {id: 'sec-progress'}, section.title), el('p', {id: 'plan-progress'}, section.text)];
    for (const [label, list] of [['Not done', section.not_done], ['Pending', section.pending]]) {
      if (list && list.length) parts.push(el('p', {class: 'legend'}, `${label}: ${list.map(item => item.description).join('; ')}`));
    }
    return el('section', {class: 'card', 'aria-labelledby': 'sec-progress'}, ...parts);
  }

  function taskCard(task) {
    const reason = el('input', {id: `plan-reason-${task.id}`, type: 'text', maxlength: '500', autocomplete: 'off'}); reason.value = reasons.get(task.id) ?? '';
    reason.addEventListener('input', () => reasons.set(task.id, reason.value));
    const done = el('button', {type: 'button', id: `plan-done-${task.id}`}, 'Mark done'); if (!task.actions.done.enabled) done.setAttribute('disabled', 'disabled');
    const notDone = el('button', {type: 'button', id: `plan-notdone-${task.id}`}, 'Mark not done'); if (!task.actions.not_done.enabled) notDone.setAttribute('disabled', 'disabled');
    const pick = task.execution_choices.length > 1 ? el('select', {id: `plan-exec-${task.id}`}, ...task.execution_choices.map(c => el('option', {value: c.id}, c.text))) : null; if (pick) pick.value = task.execution_choices[task.execution_choices.length - 1].id;
    done.addEventListener('click', () => apply(current.interactions.markDone(task.id, pick ? pick.value : undefined), `plan-done-${task.id}`));
    notDone.addEventListener('click', () => apply(current.interactions.markNotDone(task.id, reason.value).then(next => { if (next.message && next.message.kind === 'info') reasons.delete(task.id); return next; }), `plan-notdone-${task.id}`));
    const controls = task.completion === 'pending'
      ? [pick ? el('div', {class: 'field'}, el('label', {for: pick.id}, 'Which execution counts'), pick) : null, done, el('div', {class: 'field'}, el('label', {for: `plan-reason-${task.id}`}, 'Reason, if not done'), reason), notDone, task.actions.done.enabled ? null : el('p', {class: 'notice notice-info'}, task.actions.done.reason)]
      : [(() => { const why = el('input', {id: `plan-undo-why-${task.id}`, type: 'text', maxlength: '500', autocomplete: 'off'}); why.value = undo.get(task.id) ?? ''; why.addEventListener('input', () => undo.set(task.id, why.value));
        const b = el('button', {type: 'button', id: `plan-undo-${task.id}`}, 'Undo this mark'); if (!task.actions.reopen.enabled) b.setAttribute('disabled', 'disabled');
        b.addEventListener('click', () => apply(current.interactions.reopen(task.id, why.value).then(next => { if (next.message && next.message.kind === 'info') undo.delete(task.id); return next; }), b.id));
        return el('div', {class: 'field'}, el('label', {for: why.id}, 'Why undo the mark (needed)'), why, b); })()];
    const link = (() => { const sel = el('select', {id: `plan-link-${task.id}`}, el('option', {value: ''}, 'Choose a recorded value'), ...task.link_choices.map(c => el('option', {value: c.id}, c.text)));
      const b = el('button', {type: 'button', id: `plan-link-btn-${task.id}`}, 'Link this result'); if (!task.actions.link.enabled) b.setAttribute('disabled', 'disabled');
      b.addEventListener('click', () => apply(current.interactions.linkResult(task.id, sel.value), b.id)); return el('div', {class: 'field'}, el('label', {for: sel.id}, 'Link a result you observed'), sel, b); })();
    return el('li', {class: 'entry', 'data-state': task.completion}, el('strong', {class: 'entry-label'}, task.description),
      el('div', {class: 'entry-meta legend'}, task.assigned_text), el('div', {}, `Done: ${task.done_text}`), el('div', {}, `Result: ${task.result_text}`),
      task.note_text ? el('div', {class: 'legend'}, task.note_text) : null, task.procedure ? el('div', {class: 'legend'}, `${task.procedure.title}: ${task.procedure.availability_text}`) : null,
      task.execution ? el('div', {class: 'legend'}, `A completed execution (${task.execution.id}) exists for this procedure.`) : null, task.scheduled_text ? el('div', {class: 'legend'}, task.scheduled_text) : null, task.history.length ? el('div', {class: 'legend'}, `History: ${task.history.join(' → ')}`) : null, ...controls, link);
  }

  function createCard(section) {
    const f = (id, label, attrs = {}) => { const c = el('input', {id: `plan-new-${id}`, type: 'text', autocomplete: 'off', ...attrs}); c.value = draft[id]; c.addEventListener('input', () => { draft[id] = c.value; }); return el('div', {class: 'field'}, el('label', {for: c.id}, label), c); };
    const proc = el('select', {id: 'plan-new-procedure_id'}, el('option', {value: ''}, 'No procedure'), ...section.procedures.map(p => el('option', {value: p.id}, p.title))); proc.value = draft.procedure_id; proc.addEventListener('change', () => { draft.procedure_id = proc.value; });
    const b = el('button', {type: 'submit', id: 'plan-new-save'}, 'Add task'); if (!section.actions.create.enabled) b.setAttribute('disabled', 'disabled');
    const form = el('form', {id: 'plan-new-form'}, f('description', 'What to do', {maxlength: '500'}), f('scheduled_at', 'When (date and time, UTC, e.g. 2026-11-15T10:00:00Z)'), f('planned_minutes', 'Planned minutes (required)', {inputmode: 'numeric'}), el('div', {class: 'field'}, el('label', {for: proc.id}, 'Procedure (optional)'), proc),
      f('every_days', 'Repeat every N days (optional; leave empty for one task)', {inputmode: 'numeric'}), f('count', 'How many times, if it repeats', {inputmode: 'numeric'}), b);
    form.addEventListener('submit', ev => { ev.preventDefault(); apply(current.interactions.createTask({...draft}).then(next => { if (next.message && next.message.kind === 'info') Object.keys(draft).forEach(k => { draft[k] = ''; }); return next; }), 'plan-new-save'); });
    return el('section', {class: 'card', 'aria-labelledby': 'sec-create'}, el('h3', {id: 'sec-create'}, section.title), el('p', {class: 'legend'}, section.note), form, section.actions.create.enabled ? null : el('p', {class: 'notice notice-info'}, section.actions.create.reason));
  }

  function draw() {
    const parts = [];
    if (current.message) parts.push(el('p', {id: 'plan-message', class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    for (const section of current.sections) {
      if (section.id === 'progress' && section.state === 'ready') parts.push(progress(section));
      else if (section.id === 'tasks' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-tasks'}, el('h3', {id: 'sec-tasks'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(taskCard))));
      else if (section.id === 'create') parts.push(createCard(section));
      else parts.push(renderSection(doc, section));
    }
    element.replaceChildren(...parts);
  }
  draw();
}
