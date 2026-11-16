// DOM only. Draws the my-health view model and its two forms: "nothing new" and a measurement.
// Typed input is kept when a save fails, so the person does not lose what they wrote. Native controls only.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const draft = {variable: '', value: '', unit: '', method: ''};

  const el = (tag, attrs = {}, ...children) => {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    for (const child of children) if (child !== null && child !== undefined) node.append(child);
    return node;
  };
  const field = (id, text, control) => el('div', {class: 'field'}, el('label', {for: id}, text), control);

  async function run(work, keepDraft) {
    const focusId = doc.activeElement && doc.activeElement.id;
    const next = await work;
    if (next && next.state === 'ready') {
      current = next;
      if (!(next.message && next.message.kind === 'error') && !keepDraft) Object.assign(draft, {variable: '', value: '', unit: '', method: ''});
    }
    draw();
    const back = focusId && doc.getElementById(focusId);
    if (back) back.focus();
  }

  function forms() {
    const actions = current.actions;
    const pieces = [];
    if (current.message) pieces.push(el('p', {class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status', id: 'health-message'}, current.message.text));
    const nothing = el('button', {type: 'button', id: 'health-nothing-new'}, 'Record: nothing new');
    if (!actions.nothing_new.enabled) { nothing.setAttribute('disabled', 'disabled'); }
    nothing.addEventListener('click', () => run(current.interactions.recordNothingNew(), true));
    pieces.push(nothing);
    if (!actions.nothing_new.enabled) pieces.push(el('p', {class: 'notice notice-info', id: 'health-blocked'}, actions.nothing_new.reason));

    const variable = el('select', {id: 'health-variable'}, el('option', {value: ''}, 'Choose a variable'),
      ...actions.measurement.variables.map(item => el('option', {value: item.id}, `${item.label} (${item.unit === 'as_recorded' ? 'unit as you recorded it' : item.unit})`)));
    variable.value = draft.variable;
    const value = el('input', {id: 'health-value', type: 'text', inputmode: 'decimal', autocomplete: 'off'}); value.value = draft.value;
    const unit = el('input', {id: 'health-unit', type: 'text', autocomplete: 'off'}); unit.value = draft.unit;
    const method = el('input', {id: 'health-method', type: 'text', autocomplete: 'off'}); method.value = draft.method;
    const submit = el('button', {type: 'submit', id: 'health-save'}, 'Save measurement');
    if (!actions.measurement.enabled) submit.setAttribute('disabled', 'disabled');
    const form = el('form', {id: 'health-form'}, field('health-variable', 'Variable', variable), field('health-value', 'Value (a number)', value),
      field('health-unit', 'Unit (only when the variable has no fixed unit)', unit), field('health-method', 'Method (optional; self-report if empty)', method), submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      Object.assign(draft, {variable: variable.value, value: value.value, unit: unit.value, method: method.value});
      const number = draft.value.trim() === '' ? NaN : Number(draft.value.replace(',', '.'));
      const input = {variable: draft.variable, value: number};
      if (draft.unit.trim()) input.unit = draft.unit.trim();
      if (draft.method.trim()) input.method = draft.method.trim();
      run(current.interactions.recordMeasurement(input), false);
    });
    pieces.push(el('section', {class: 'card', 'aria-labelledby': 'health-record-title'}, el('h3', {id: 'health-record-title'}, 'Record something'), form));
    return pieces;
  }

  function draw() { element.replaceChildren(...current.sections.map(section => renderSection(doc, section)), ...forms()); }
  draw();
}
