// DOM only. Draws the view model and calls its interactions; it holds no data rules of its own.
// Text always goes in through textContent. Native controls only: a select selects, a checkbox toggles, a form submits.
import {accessibleTable, renderChart, renderTable} from '../base/index.js';

function h(doc, tag, attrs = {}, ...children) {
  const element = doc.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) if (!/^on/i.test(name)) element.setAttribute(name, String(value));
  for (const child of children) if (child !== null && child !== undefined && child !== false) element.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
  return element;
}
const field = (doc, id, label, control) => h(doc, 'div', {class: 'field'}, h(doc, 'label', {for: id}, label), control);

export function mount(element, viewModel, actions) {
  const doc = element.ownerDocument;
  let current = viewModel;

  async function apply(work) {
    const focusId = doc.activeElement && doc.activeElement.id;
    current = await work;
    draw();
    const back = focusId && doc.getElementById(focusId);
    if (back) back.focus();
  }

  function loader() {
    const sources = current.loader.sources;
    const select = h(doc, 'select', {id: 'nc-source'}, ...sources.map(source => h(doc, 'option', source.supported ? {value: source.id} : {value: source.id, disabled: 'disabled'}, source.supported ? source.label : `${source.label} (not offered)`)));
    const accepts = h(doc, 'p', {id: 'nc-accepts', class: 'legend'});
    const subjectInput = h(doc, 'input', {id: 'nc-subject-id', type: 'text', maxlength: '512', autocomplete: 'off'});
    const subjectField = field(doc, 'nc-subject-id', 'Subject identifier (this source’s file does not carry one)', subjectInput);
    const fileInput = h(doc, 'input', {id: 'nc-file', type: 'file', accept: '.csv,text/csv,text/plain'});
    const sync = () => {
      const source = sources.find(candidate => candidate.id === select.value) ?? sources[0];
      accepts.textContent = `Accepts ${source.accepts}.`;
      subjectField.hidden = !source.needs_subject;
    };
    select.addEventListener('change', sync); sync();
    const form = h(doc, 'form', {id: 'nc-form'}, field(doc, 'nc-source', 'Source', select), accepts, subjectField, field(doc, 'nc-file', 'File', fileInput), h(doc, 'button', {type: 'submit', id: 'nc-load'}, 'Load file'));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const file = fileInput.files && fileInput.files[0];
      if (!file) { current = {...current, message: {kind: 'error', text: 'Choose a file first.'}}; draw(); return; }
      // Bound first, read second: a file over the limit is never pulled into memory.
      if (file.size > current.limits.max_file_bytes) { current = {...current, message: {kind: 'error', text: `${file.name} is larger than ${current.limits.max_file_bytes / (1024 * 1024)} MiB, so it was not read.`}}; draw(); return; }
      let text;
      try { text = await file.text(); } catch { current = {...current, message: {kind: 'error', text: 'The file could not be read.'}}; draw(); return; }
      await apply(current.interactions.loadFile({source_id: select.value, name: file.name, text, subject: subjectInput.value.trim()}));
    });
    const notOffered = sources.filter(source => !source.supported).map(source => h(doc, 'p', {class: 'notice notice-warning'}, `${source.label}: ${source.reason}`));
    return h(doc, 'section', {'aria-labelledby': 'nc-load-title'}, h(doc, 'h3', {id: 'nc-load-title'}, 'Load a file'), form, ...notOffered);
  }

  function fileCard(file, index) {
    const rows = [['Study', file.study], ['Origin of these records', file.origin_text], ['Subjects', file.subjects.join(', ') || 'none'], ['Records loaded', String(file.records)],
      ['DOI', file.doi ?? 'not given'], ['Licence', file.license]];
    const parts = [h(doc, 'h4', {id: `nc-file-${index}`}, file.name), h(doc, 'dl', {}, ...rows.flatMap(([term, value]) => [h(doc, 'dt', {}, term), h(doc, 'dd', {}, value)]))];
    parts.push(h(doc, 'p', {class: 'legend'}, 'Citation:'), ...file.citation.map(text => h(doc, 'p', {class: 'citation'}, text)));
    if (file.error_text) parts.push(h(doc, 'p', {class: 'notice notice-error', role: 'alert'}, `Refused as a whole: ${file.error_text}`));
    if (file.rejected.length) {
      const table = accessibleTable({caption: `${file.rejected.length} rejected rows in ${file.name} (row numbers count the header as row 1; the cell text is not shown)`,
        columns: [{key: 'row', label: 'Row'}, {key: 'code', label: 'Reason'}, {key: 'field', label: 'Field'}], rows: file.rejected});
      parts.push(renderTable(doc, table));
    }
    if (file.skipped) parts.push(h(doc, 'p', {class: 'legend'}, `${file.skipped} cells were left out on purpose (free text is never imported).`));
    return h(doc, 'section', {class: 'card', 'aria-labelledby': `nc-file-${index}`}, ...parts);
  }

  function chooser() {
    if (!current.subjects.length) return null;
    const boxes = current.subjects.map((entry, index) => {
      const box = h(doc, 'input', {type: 'checkbox', id: `nc-pick-${index}`, value: entry.subject});
      if (current.selection.subjects.includes(entry.subject)) box.setAttribute('checked', 'checked');
      box.addEventListener('change', () => {
        const picked = [...doc.querySelectorAll('#nc-pick input, input[id^="nc-pick-"]')].filter(input => input.checked).map(input => input.value);
        apply(current.interactions.select({subjects: picked}));
      });
      return h(doc, 'div', {class: 'field'}, box, h(doc, 'label', {for: `nc-pick-${index}`}, `Subject ${entry.subject} — ${entry.study} — ${entry.origin_text}`));
    });
    return h(doc, 'fieldset', {}, h(doc, 'legend', {}, 'Subjects to show (up to 4; each one is drawn on its own, never over another)'), ...boxes);
  }

  function panel(entry, index) {
    const parts = [h(doc, 'h3', {id: `nc-panel-${index}`}, `Subject ${entry.subject}`),
      h(doc, 'p', {}, `Study: ${entry.study}. Origin: ${entry.origin_text}.`), h(doc, 'p', {class: 'legend'}, entry.clock_text)];
    if (entry.variables.length > 1) {
      const select = h(doc, 'select', {id: `nc-var-${index}`}, ...entry.variables.map(v => h(doc, 'option', v.variable === entry.variable ? {value: v.variable, selected: 'selected'} : {value: v.variable}, `${v.variable} (${v.n} records)`)));
      select.addEventListener('change', () => apply(current.interactions.select({variables: {[entry.subject]: select.value}})));
      parts.push(field(doc, `nc-var-${index}`, 'Variable', select));
    }
    if (entry.phases.length) parts.push(h(doc, 'p', {class: 'legend'}, `Phases in the source: ${entry.phases.map(p => `${p.phase} (${p.n})`).join(', ')}.`));
    if (entry.chart && entry.chart.days && entry.chart.days.length > 1) {
      const select = h(doc, 'select', {id: `nc-day-${index}`}, ...entry.chart.days.map(day => h(doc, 'option', day === entry.chart.day ? {value: day, selected: 'selected'} : {value: day}, day)));
      select.addEventListener('change', () => apply(current.interactions.select({day: select.value})));
      parts.push(field(doc, `nc-day-${index}`, 'Source day', select));
    }
    if (entry.chart) parts.push(renderChart(doc, entry.chart));
    if (entry.chart_error) parts.push(h(doc, 'p', {class: 'notice notice-error', role: 'alert'}, entry.chart_error));
    for (const note of entry.notes) parts.push(h(doc, 'p', {class: 'notice notice-warning'}, note));
    for (const list of entry.unordered) parts.push(h(doc, 'p', {class: 'notice notice-warning'}, `${list.n} records are listed without an order: ${list.order_note}.`), renderTable(doc, list.table));
    return h(doc, 'section', {class: 'card', 'aria-labelledby': `nc-panel-${index}`}, ...parts);
  }

  function draw() {
    const parts = [h(doc, 'p', {class: 'notice notice-info'}, current.notice)];
    if (current.message) parts.push(h(doc, 'p', {class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    parts.push(loader());
    if (current.files.length) parts.push(h(doc, 'section', {'aria-labelledby': 'nc-files-title'}, h(doc, 'h3', {id: 'nc-files-title'}, 'Study cards'), ...current.files.map(fileCard)));
    const pick = chooser(); if (pick) parts.push(pick);
    if (current.panels.length) parts.push(...current.panels.map(panel)); else parts.push(h(doc, 'p', {class: 'notice notice-info'}, current.empty_reason));
    element.replaceChildren(...parts);
  }
  draw();
}
