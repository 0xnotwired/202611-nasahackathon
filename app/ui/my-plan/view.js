// DOM only. Draws My plan: progress, then each task with assigned, done and result on separate lines.
// Native controls: a button marks a task done; a text field and a button mark it not done with its reason. Typed reasons survive a failed save.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const reasons = new Map();
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
    done.addEventListener('click', () => apply(current.interactions.markDone(task.id), `plan-done-${task.id}`));
    notDone.addEventListener('click', () => apply(current.interactions.markNotDone(task.id, reason.value).then(next => { if (next.message && next.message.kind === 'info') reasons.delete(task.id); return next; }), `plan-notdone-${task.id}`));
    const controls = task.completion === 'pending'
      ? [done, el('div', {class: 'field'}, el('label', {for: `plan-reason-${task.id}`}, 'Reason, if not done'), reason), notDone, task.actions.done.enabled ? null : el('p', {class: 'notice notice-info'}, task.actions.done.reason)]
      : [];
    return el('li', {class: 'entry', 'data-state': task.completion}, el('strong', {class: 'entry-label'}, task.description),
      el('div', {class: 'entry-meta legend'}, task.assigned_text), el('div', {}, `Done: ${task.done_text}`), el('div', {}, `Result: ${task.result_text}`),
      task.note_text ? el('div', {class: 'legend'}, task.note_text) : null, task.procedure ? el('div', {class: 'legend'}, `${task.procedure.title}: ${task.procedure.availability_text}`) : null,
      task.execution ? el('div', {class: 'legend'}, `A completed execution (${task.execution.id}) exists for this procedure.`) : null, ...controls);
  }

  function draw() {
    const parts = [];
    if (current.message) parts.push(el('p', {id: 'plan-message', class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    for (const section of current.sections) {
      if (section.id === 'progress' && section.state === 'ready') parts.push(progress(section));
      else if (section.id === 'tasks' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-tasks'}, el('h3', {id: 'sec-tasks'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(taskCard))));
      else parts.push(renderSection(doc, section));
    }
    element.replaceChildren(...parts);
  }
  draw();
}
