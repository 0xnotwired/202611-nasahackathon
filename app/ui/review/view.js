// DOM only. Draws "Review and export": the choice of variable, period, method and reference; the values; the change; the review text prepared on this device; downloads.
// Native controls. A download is made in the page from text already built (a Blob link); nothing is sent anywhere.
import {renderSection, renderEntry} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  let status = null;
  const el = (tag, attrs = {}, ...children) => {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    for (const child of children) if (child !== null && child !== undefined) node.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
    return node;
  };

  async function apply(work, focusId) {
    current = await work; status = null; draw();
    const back = doc.getElementById(focusId); if (back) back.focus();
  }
  function download(result, focusId) {
    if (!result.ok) { status = {kind: 'error', text: `Not downloaded: ${result.error.message}`}; draw(); return; }
    const url = URL.createObjectURL(new Blob([result.value.text], {type: 'text/csv;charset=utf-8'}));
    const link = doc.createElement('a'); link.href = url; link.download = result.value.filename; doc.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status = {kind: 'info', text: `Prepared ${result.value.filename} with ${result.value.records} record(s). It was made on this device and nothing was sent.`}; draw();
    const back = doc.getElementById(focusId); if (back) back.focus();
  }
  const select = (id, label, options, value, onChange) => {
    const control = el('select', {id}, ...options.map(option => { const node = el('option', {value: option.value}, option.label); if (String(option.value) === String(value)) node.setAttribute('selected', 'selected'); return node; }));
    control.value = String(value ?? ''); control.addEventListener('change', () => onChange(control.value));
    return el('div', {class: 'field'}, el('label', {for: id}, label), control);
  };

  function selectCard(section) {
    const chosen = section.chosen; const i = current.interactions;
    return el('section', {class: 'card', 'aria-labelledby': 'sec-select'}, el('h3', {id: 'sec-select'}, section.title), el('p', {class: 'legend'}, section.note),
      select('review-variable', 'Variable', section.variables.map(v => ({value: v.id, label: v.label})), chosen.variable, value => apply(i.select({variable: value}), 'review-variable')),
      select('review-period', 'Period', section.periods.map(p => ({value: p.months, label: p.label})), chosen.months, value => apply(i.select({months: Number(value)}), 'review-period')),
      section.methods.length ? select('review-method', 'Method', section.methods.map(m => ({value: m.id, label: m.label})), chosen.method, value => apply(i.select({method: value}), 'review-method')) : null,
      section.references.length ? select('review-reference', 'Reference value', section.references.map(r => ({value: r.id, label: r.label})), chosen.reference, value => apply(i.select({reference: value}), 'review-reference')) : null);
  }
  function valuesCard(section) {
    const parts = [el('h3', {id: 'sec-values'}, section.title)];
    if (section.note) parts.push(el('p', {class: 'legend'}, section.note));
    if (section.state === 'empty') parts.push(el('p', {class: 'notice notice-info'}, section.text));
    else parts.push(el('ul', {class: 'entries'}, ...section.entries.map(entry => renderEntry(doc, entry))));
    const outside = section.outside;
    if (outside.other_methods || outside.before_period || outside.no_time) parts.push(el('p', {class: 'legend'}, `Not in this selection: ${[outside.other_methods ? `${outside.other_methods} of other methods` : null, outside.before_period ? `${outside.before_period} before the period` : null, outside.no_time ? `${outside.no_time} with no established time` : null].filter(Boolean).join('; ')}.`));
    if (section.untimed.length) parts.push(el('h4', {}, 'Values with no established time'), el('ul', {class: 'entries'}, ...section.untimed.map(entry => renderEntry(doc, entry))));
    return el('section', {class: 'card', 'aria-labelledby': 'sec-values'}, ...parts);
  }
  function reviewCard() {
    const review = current.review; if (!review) return null; const i = current.interactions;
    const series = el('button', {type: 'button', id: 'review-download-series'}, 'Download these values (CSV with provenance)'); if (!current.exports.series.enabled) series.setAttribute('disabled', 'disabled');
    series.addEventListener('click', async () => download(await i.exportSeries(), 'review-download-series'));
    const copy = el('button', {type: 'button', id: 'review-copy'}, 'Copy the review text');
    copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(review.text); status = {kind: 'info', text: 'The review text was copied. Nothing was sent.'}; } catch { status = {kind: 'error', text: 'The text could not be copied; select it and copy it by hand.'}; } draw(); const back = doc.getElementById('review-copy'); if (back) back.focus(); });
    return el('section', {class: 'card', 'aria-labelledby': 'sec-prepared'}, el('h3', {id: 'sec-prepared'}, 'Review prepared on this device'),
      el('p', {class: 'legend'}, 'Prepared here and not sent. To share something with the ground, use the Ground panel.'),
      el('pre', {id: 'review-text', class: 'summary-text', tabindex: '0', 'aria-label': 'Review text, scrollable'}, review.text), el('div', {class: 'actions'}, copy, series));
  }
  function exportCard() {
    const all = el('button', {type: 'button', id: 'review-download-all'}, 'Download all my records (CSV with provenance)'); if (!current.exports.all.enabled) all.setAttribute('disabled', 'disabled');
    all.addEventListener('click', async () => download(await current.interactions.exportAll(), 'review-download-all'));
    return el('section', {class: 'card', 'aria-labelledby': 'sec-export'}, el('h3', {id: 'sec-export'}, 'Export'),
      el('p', {class: 'legend'}, 'The file has one row per record, with its state, unit, method, origin and source clock. A value that was not recorded has no number. The file is not encrypted: it contains what you recorded, including notes.'),
      all, current.exports.all.enabled ? null : el('p', {class: 'notice notice-info'}, current.exports.all.reason));
  }

  function draw() {
    const parts = []; const note = status ?? current.message;
    if (note) parts.push(el('p', {id: 'review-message', class: `notice notice-${note.kind === 'error' ? 'error' : 'info'}`, role: note.kind === 'error' ? 'alert' : 'status'}, note.text));
    for (const section of current.sections) {
      if (section.id === 'select') parts.push(selectCard(section));
      else if (section.id === 'values') parts.push(valuesCard(section));
      else if (section.id === 'change') parts.push(el('section', {class: 'card', 'aria-labelledby': 'sec-change'}, el('h3', {id: 'sec-change'}, section.title), el('p', {id: 'review-change'}, section.text)));
      else parts.push(renderSection(doc, section));
    }
    const prepared = reviewCard(); if (prepared) parts.push(prepared);
    parts.push(exportCard());
    element.replaceChildren(...parts);
  }
  draw();
}
