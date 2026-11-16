// DOM only. Draws On board: each procedure with its equipment check, preparation and steps, and each execution with its controls.
// Native buttons only. One text field per execution carries the reason (to interrupt) or the difficulty (to say it could not be completed); it survives a failed save.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const typed = new Map();
  let editorOpen = false;
  const draft = {based_on: '', title: '', purpose: '', equipment: '', preparation: '', steps: '', alternative: ''};
  const confirmedPrep = new Map(); const retiring = new Map(); const recorded = new Map();
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
    const checks = p.preparation.map((text, index) => { const box = el('input', {type: 'checkbox', id: `board-prep-${p.id}-${index}`}); box.checked = (confirmedPrep.get(p.id) ?? new Set()).has(index); box.addEventListener('change', () => { const set = confirmedPrep.get(p.id) ?? new Set(); if (box.checked) set.add(index); else set.delete(index); confirmedPrep.set(p.id, set); }); return {box, row: el('li', {}, box, ' ', el('label', {for: box.id}, text))}; });
    if (button) { if (!start.enabled) button.setAttribute('disabled', 'disabled'); button.addEventListener('click', () => { const ok = checks.every(c => c.box.checked); apply(current.interactions.start(p.id, {confirmed: ok}).then(next => { if (next.message && next.message.kind === 'info') confirmedPrep.delete(p.id); return next; }), `board-start-${p.id}`); }); }
    const retire = p.actions.find(a => a.id === 'retire'); const why = el('input', {id: `board-retire-why-${p.id}`, type: 'text', maxlength: '500', autocomplete: 'off'}); why.value = retiring.get(p.id) ?? ''; why.addEventListener('input', () => retiring.set(p.id, why.value));
    const retireButton = retire ? el('button', {type: 'button', id: `board-retire-${p.id}`}, retire.label) : null;
    if (retireButton) { if (!retire.enabled) retireButton.setAttribute('disabled', 'disabled'); retireButton.addEventListener('click', () => apply(current.interactions.retire(p.id, why.value).then(next => { if (next.message && next.message.kind === 'info') retiring.delete(p.id); return next; }), `board-retire-${p.id}`)); }
    return el('li', {class: 'entry'}, el('strong', {class: 'entry-label'}, p.title), el('div', {class: 'legend'}, `Version ${p.version} · source ${p.source} · ${p.review_text}`), el('p', {}, p.purpose),
      el('p', {class: p.availability.available ? 'legend' : 'notice notice-warning'}, p.availability.text),
      el('h4', {}, p.needs_preparation ? 'Preparation: confirm each check before starting' : 'Preparation, before starting'), el('ul', {class: 'checks'}, ...checks.map(c => c.row)),
      p.documented_alternative ? el('p', {class: 'legend'}, `Documented alternative: ${p.documented_alternative}`) : null,
      el('details', {class: 'table-toggle'}, el('summary', {}, 'Steps'), el('ol', {}, ...p.steps.map((text, i) => el('li', {}, p.step_variables && p.step_variables[i] ? `${text} (records ${p.step_variables[i]})` : text)))),
      button, button && !start.enabled ? el('p', {class: 'notice notice-info'}, start.reason) : null,
      retire ? el('div', {class: 'field'}, el('label', {for: why.id}, 'Why retire this version (needed)'), why, retireButton) : null);
  }

  function executionCard(e) {
    const text = el('input', {id: `board-text-${e.id}`, type: 'text', maxlength: '500', autocomplete: 'off'}); text.value = typed.get(e.id) ?? '';
    text.addEventListener('input', () => typed.set(e.id, text.value));
    const needsText = e.actions.some(a => a.needs === 'reason' || a.needs === 'difficulty' || a.needs === 'text' || (a.needs && a.needs !== 'record'));
    const rf = e.record_form; const value = rf ? el('input', {id: `board-value-${e.id}`, type: 'text', inputmode: 'decimal', autocomplete: 'off'}) : null; if (value) { value.value = recorded.get(e.id)?.value ?? ''; value.addEventListener('input', () => recorded.set(e.id, {...recorded.get(e.id), value: value.value})); }
    const method = rf ? el('input', {id: `board-method-${e.id}`, type: 'text', maxlength: '100', autocomplete: 'off'}) : null; if (method) { method.value = recorded.get(e.id)?.method ?? ''; method.addEventListener('input', () => recorded.set(e.id, {...recorded.get(e.id), method: method.value})); }
    const unit = rf && rf.needs_unit ? el('input', {id: `board-unit-${e.id}`, type: 'text', maxlength: '40', autocomplete: 'off'}) : null; if (unit) { unit.value = recorded.get(e.id)?.unit ?? ''; unit.addEventListener('input', () => recorded.set(e.id, {...recorded.get(e.id), unit: unit.value})); }
    const buttons = e.actions.map(a => {
      const b = el('button', {type: 'button', id: `board-${e.id}-${a.id}`}, a.label); if (!a.enabled) b.setAttribute('disabled', 'disabled');
      b.addEventListener('click', () => {
        const i = current.interactions;
        const number = value && value.value.trim() !== '' ? Number(value.value) : undefined;
        const work = a.id === 'advance' ? i.advance(e.id, rf ? {value: number === undefined ? undefined : number, method: method ? method.value : undefined, ...(unit ? {unit: unit.value} : {})} : undefined) : a.id === 'advance_no_record' ? i.advance(e.id, {no_record: true}) : a.id === 'interrupt' ? i.interrupt(e.id, text.value) : a.id === 'resume' ? i.resume(e.id) : a.id === 'finish_completed' ? i.finish(e.id, 'completed') : i.finish(e.id, 'could_not', text.value);
        apply(work.then(next => { if (next.message && next.message.kind === 'info') { typed.delete(e.id); recorded.delete(e.id); } return next; }), b.id);
      });
      return b;
    });
    return el('li', {class: 'entry', 'data-state': e.state}, el('strong', {class: 'entry-label'}, e.title), el('div', {class: 'legend'}, `Version ${e.procedure_version} · ${e.state_text}`), el('div', {}, e.progress_text),
      e.step_text ? el('p', {}, e.step_text) : null, e.difficulties.length ? el('p', {class: 'legend'}, `Difficulty: ${e.difficulties.join('; ')}`) : null,
      e.interruptions.length ? el('p', {class: 'legend'}, `Interrupted: ${e.interruptions.map(i => `${i.reason} (after ${i.step} steps)`).join('; ')}`) : null,
      rf ? el('div', {class: 'field'}, el('label', {for: value.id}, `Record ${rf.label ?? rf.variable} (${rf.unit ?? 'unit needed'}) for this step`), value, el('label', {for: method.id}, 'How it was measured (method, needed)'), method, unit ? el('label', {for: unit.id}, 'Unit') : null, unit) : null,
      needsText ? el('div', {class: 'field'}, el('label', {for: `board-text-${e.id}`}, 'Reason or difficulty (needed to interrupt, or to say you could not complete it)'), text) : null, ...buttons);
  }

  function editorCard(section) {
    const procedures = current.sections.find(item => item.id === 'procedures').entries;
    const choose = el('select', {id: 'editor-based-on'}, el('option', {value: ''}, 'A new procedure'), ...section.existing.map(item => el('option', {value: item.id}, `Change: ${item.title} (version ${item.version})`)));
    choose.value = draft.based_on;
    const input = (id, label, tag, rows) => { const control = tag === 'textarea' ? el('textarea', {id, rows, maxlength: '4000'}) : el('input', {id, type: 'text', maxlength: '500', autocomplete: 'off'}); return {control, field: el('div', {class: 'field'}, el('label', {for: id}, label), control)}; };
    const title = input('editor-title', 'Title', 'input'), purpose = input('editor-purpose', 'Purpose', 'input'), equipment = input('editor-equipment', 'Equipment needed (separated by commas)', 'input');
    const preparation = input('editor-preparation', 'Preparation (one check per line)', 'textarea', 3), steps = input('editor-steps', `Steps (${section.step_syntax})`, 'textarea', 5), alternative = input('editor-alternative', 'Documented alternative (optional, id of another procedure)', 'input');
    const fields = {title, purpose, equipment, preparation, steps, alternative};
    for (const [name, item] of Object.entries(fields)) { item.control.value = draft[name]; item.control.addEventListener('input', () => { draft[name] = item.control.value; }); }
    choose.addEventListener('change', () => {
      draft.based_on = choose.value;
      const found = procedures.find(item => item.id === choose.value);
      if (found) Object.assign(draft, {title: found.title, purpose: found.purpose, equipment: found.required_equipment.join(', '), preparation: found.preparation.join('\n'), steps: found.steps.map((t, i) => found.step_variables && found.step_variables[i] ? `${t} | records=${found.step_variables[i]}` : t).join('\n'), alternative: found.documented_alternative ?? ''});
      for (const [name, item] of Object.entries(fields)) item.control.value = draft[name];
    });
    const save = el('button', {type: 'submit', id: 'editor-publish'}, 'Publish as a draft'); if (!section.actions.publish.enabled) save.setAttribute('disabled', 'disabled');
    const form = el('form', {id: 'editor-form'}, el('div', {class: 'field'}, el('label', {for: 'editor-based-on'}, 'What to write'), choose), title.field, purpose.field, equipment.field, preparation.field, steps.field, alternative.field, save);
    form.addEventListener('submit', event => {
      event.preventDefault();
      apply(current.interactions.publish({...draft}).then(next => { if (next.message && next.message.kind === 'info') Object.assign(draft, {based_on: '', title: '', purpose: '', equipment: '', preparation: '', steps: '', alternative: ''}); return next; }), 'editor-publish');
    });
    return el('section', {class: 'card', 'aria-labelledby': 'sec-editor'}, el('h3', {id: 'sec-editor'}, section.title), el('p', {class: 'legend'}, section.note),
      (() => { const box = el('details', {class: 'table-toggle', id: 'editor-details'}, el('summary', {}, 'Write or change a procedure'), form); if (editorOpen) box.setAttribute('open', ''); box.addEventListener('toggle', () => { editorOpen = box.open; }); return box; })(), section.actions.publish.enabled ? null : el('p', {class: 'notice notice-info'}, section.actions.publish.reason));
  }

  function draw() {
    const parts = [];
    if (current.message) parts.push(el('p', {id: 'board-message', class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    for (const section of current.sections) {
      if (section.id === 'procedures' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-procedures'}, el('h3', {id: 'sec-procedures'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(procedureCard))));
      else if (section.id === 'executions' && section.state === 'ready') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-executions'}, el('h3', {id: 'sec-executions'}, section.title), el('p', {class: 'legend'}, section.note), el('ul', {class: 'entries'}, ...section.entries.map(executionCard))));
      else if (section.id === 'editor') parts.push(editorCard(section));
      else parts.push(renderSection(doc, section));
    }
    element.replaceChildren(...parts);
  }
  draw();
}
