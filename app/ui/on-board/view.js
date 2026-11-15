// DOM only. Draws On board: each procedure with its equipment check, preparation and steps, and each execution with its controls.
// Native buttons only. One text field per execution carries the reason (to interrupt) or the difficulty (to say it could not be completed); it survives a failed save.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const typed = new Map();
  const el = (tag, attrs = {}, ...children) => {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    for (const child of children) if (child !== null && child !== undefined) node.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
    return node;
  };

  async function apply(work, focusId) {
    current = await work;
    draw();
    const back = doc.getElementById(focusId) ?? doc.getElementById('board-message');
    if (back) { if (back.tagName === 'P' && !back.hasAttribute('tabindex')) back.setAttribute('tabindex', '-1'); back.focus(); }
  }

  function procedureCard(p) {
    const start = p.actions.find(a => a.id === 'start');
    const button = start ? el('button', {type: 'button', id: `board-start-${p.id}`}, start.label) : null;
    if (button) { if (!start.enabled) button.setAttribute('disabled', 'disabled'); button.addEventListener('click', () => apply(current.interactions.start(p.id), `board-start-${p.id}`)); }
    return el('li', {class: 'entry'}, el('strong', {class: 'entry-label'}, p.title), el('div', {class: 'legend'}, `Version ${p.version} · source ${p.source} · ${p.review_text}`), el('p', {}, p.purpose),
      el('p', {class: p.availability.available ? 'legend' : 'notice notice-warning'}, p.availability.text),
      el('h4', {}, 'Preparation, before starting'), el('ul', {}, ...p.preparation.map(text => el('li', {}, text))),
      el('details', {class: 'table-toggle'}, el('summary', {}, 'Steps'), el('ol', {}, ...p.steps.map(text => el('li', {}, text)))),
      button, button && !start.enabled ? el('p', {class: 'notice notice-info'}, start.reason) : null);
  }

  function executionCard(e) {
    const text = el('input', {id: `board-text-${e.id}`, type: 'text', maxlength: '500', autocomplete: 'off'}); text.value = typed.get(e.id) ?? '';
    text.addEventListener('input', () => typed.set(e.id, text.value));
    const needsText = e.actions.some(a => a.needs);
    const buttons = e.actions.map(a => {
      const b = el('button', {type: 'button', id: `board-${e.id}-${a.id}`}, a.label); if (!a.enabled) b.setAttribute('disabled', 'disabled');
      b.addEventListener('click', () => {
        const i = current.interactions;
        const work = a.id === 'advance' ? i.advance(e.id) : a.id === 'interrupt' ? i.interrupt(e.id, text.value) : a.id === 'resume' ? i.resume(e.id) : a.id === 'finish_completed' ? i.finish(e.id, 'completed') : i.finish(e.id, 'could_not', text.value);
        apply(work.then(next => { if (next.message && next.message.kind === 'info') typed.delete(e.id); return next; }), b.id);
      });
      return b;
    });
    return el('li', {class: 'entry', 'data-state': e.state}, el('strong', {class: 'entry-label'}, e.title), el('div', {class: 'legend'}, `Version ${e.procedure_version} · ${e.state_text}`), el('div', {}, e.progress_text),
      e.step_text ? el('p', {}, e.step_text) : null, e.difficulties.length ? el('p', {class: 'legend'}, `Difficulty: ${e.difficulties.join('; ')}`) : null,
      e.interruptions.length ? el('p', {class: 'legend'}, `Interrupted: ${e.interruptions.map(i => `${i.reason} (after ${i.step} steps)`).join('; ')}`) : null,
      needsText ? el('div', {class: 'field'}, el('label', {for: `board-text-${e.id}`}, 'Reason or difficulty (needed to interrupt, or to say you could not complete it)'), text) : null, ...buttons);
  }

  function draw() {
    const parts = [];
    if (current.message) parts.push(el('p', {id: 'board-message', class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    for (const section of current.sections) {
      if (section.id === 'procedures' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-procedures'}, el('h3', {id: 'sec-procedures'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(procedureCard))));
      else if (section.id === 'executions' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-executions'}, el('h3', {id: 'sec-executions'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(executionCard))));
      else parts.push(renderSection(doc, section));
    }
    element.replaceChildren(...parts);
  }
  draw();
}
