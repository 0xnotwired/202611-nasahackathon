// DOM only. Everything is built with createElement, textContent and setAttribute: record text is never parsed as markup.
// Native elements first: links navigate, a select selects, a table is a table. No click handler on a div.
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'title', 'desc', 'line', 'path', 'circle', 'text', 'g']);

function setAttributes(element, attrs) {
  for (const [name, value] of Object.entries(attrs ?? {})) {
    if (/^on/i.test(name)) continue; // attributes that run code are never copied from a model
    element.setAttribute(name, String(value));
  }
}

export function create(doc, tag, attrs, ...children) {
  const element = doc.createElement(tag);
  setAttributes(element, attrs);
  for (const child of children) if (child !== null && child !== undefined && child !== false) element.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
  return element;
}

/** Render a { tag, attrs, text, children } tree as SVG. Unknown tags are refused, not drawn. */
export function renderSvg(doc, vnode) {
  if (!vnode || !SVG_TAGS.has(vnode.tag)) throw new Error(`Refusing to draw unknown tag ${String(vnode && vnode.tag)}`);
  const element = doc.createElementNS(SVG_NS, vnode.tag);
  setAttributes(element, vnode.attrs);
  if (vnode.text !== undefined) element.textContent = String(vnode.text);
  for (const child of vnode.children ?? []) element.append(renderSvg(doc, child));
  return element;
}

export function renderTable(doc, model) {
  const head = create(doc, 'tr', {}, ...model.columns.map(column => create(doc, 'th', {scope: 'col'}, column.label)));
  const body = model.rows.map(row => create(doc, 'tr', {}, ...model.columns.map((column, index) =>
    create(doc, index === 0 ? 'th' : 'td', index === 0 ? {scope: 'row'} : {}, row[column.key]))));
  const table = create(doc, 'table', {class: 'data-table'}, create(doc, 'caption', {}, model.caption), create(doc, 'thead', {}, head), create(doc, 'tbody', {}, ...body));
  // A wide table scrolls inside its own named, keyboard-reachable region instead of widening the page (reflow, WCAG 1.4.10).
  return create(doc, 'div', {class: 'table-scroll', role: 'region', tabindex: '0', 'aria-label': model.caption}, table);
}

export function renderBadge(doc, badge) {
  return create(doc, 'span', {class: `badge tone-${badge.tone}`, 'data-kind': badge.kind},
    create(doc, 'span', {class: 'badge-symbol', 'aria-hidden': 'true'}, badge.symbol), create(doc, 'span', {class: 'badge-text'}, badge.text));
}

/** The drawing and its equivalent table together; gaps stay visible in both. */
export function renderChart(doc, model) {
  const parts = [create(doc, 'figure', {class: 'chart-figure'}, model.empty ? create(doc, 'p', {class: 'notice notice-info'}, model.empty_text) : renderSvg(doc, model.svg),
    create(doc, 'figcaption', {}, model.summary))];
  if (model.gaps.length) parts.push(create(doc, 'p', {class: 'legend'}, model.resolution === 'time'
    ? 'Dashed vertical mark: no reading for longer than one and a half sampling intervals. The table gives the length.'
    : 'Dashed vertical mark: a day without a value. The table says why.'));
  if (model.not_drawn.text) parts.push(create(doc, 'p', {class: 'notice notice-warning'}, model.not_drawn.text));
  parts.push(create(doc, 'details', {class: 'table-toggle'}, create(doc, 'summary', {}, 'Show the same values as a table'), renderTable(doc, model.table)));
  return create(doc, 'div', {class: 'chart-block'}, ...parts);
}

/** One record as a list item. Every view draws entries through this, so the same record always looks the same. */
export function renderEntry(doc, entry) {
  if (entry.kind === 'comparison') return renderComparison(doc, entry);
  const where = [entry.place ? `place ${entry.place}` : null, entry.sensor ? `sensor ${entry.sensor}` : null].filter(Boolean);
  const when = entry.time ?? (entry.source_time_raw ? `date as written in the source: ${entry.source_time_raw} (time zone not established)` : 'time not established');
  const meta = entry.has_record ? [`method ${entry.method}`, when, entry.origin_text, ...where].join(' · ') : 'no record';
  return create(doc, 'li', {class: 'entry', 'data-state': entry.state}, create(doc, 'strong', {class: 'entry-label'}, entry.label ?? entry.variable ?? 'Value'), ': ',
    create(doc, 'span', {class: 'entry-value'}, entry.value_text), ' ', renderBadge(doc, entry.badge), entry.attention ? renderBadge(doc, entry.attention) : null,
    create(doc, 'div', {class: 'entry-meta legend'}, meta), ...extraLines(doc, entry));
}

// Optional lines a view model may attach to an entry. Each is plain text from the model; none is computed here.
function extraLines(doc, entry) {
  const lines = [entry.assessment_label ? `Shown as: ${entry.assessment_label}` : null, entry.repeat && entry.repeat.text ? `Repeat: ${entry.repeat.text}` : null,
    entry.coverage_text, entry.phase_text, entry.correction_text].filter(line => typeof line === 'string' && line.length > 0);
  return lines.map(line => create(doc, 'div', {class: 'entry-extra legend'}, line));
}

/** A variable's latest value beside what its earlier values show, or the reason there is no comparison. */
function renderComparison(doc, entry) {
  return create(doc, 'li', {class: 'entry', 'data-state': entry.latest ? entry.latest.state : 'not_recorded'}, create(doc, 'strong', {class: 'entry-label'}, entry.label ?? entry.variable ?? 'Value'), ': ',
    create(doc, 'span', {class: 'entry-value'}, entry.latest && entry.latest.has_record ? entry.latest.text : 'not recorded'), ' ', entry.latest && entry.latest.badge ? renderBadge(doc, entry.latest.badge) : null,
    create(doc, 'div', {class: 'entry-meta legend'}, entry.comparison ? entry.comparison.text : entry.reason ?? 'No comparison.'));
}

/**
 * One section of a view: { id, title, state?, text?, note?, entries?, charts?, tables? }. A section that is not
 * available, empty or in error says so in words; it never shows a blank or a zero in place of the reason.
 */
export function renderSection(doc, section) {
  const parts = [create(doc, 'h3', {id: `sec-${section.id}`}, section.title)];
  if (section.note) parts.push(create(doc, 'p', {class: 'legend'}, section.note));
  if (section.state && section.state !== 'ready') parts.push(create(doc, 'p', {class: `notice notice-${section.state === 'error' ? 'error' : 'info'}`, role: section.state === 'error' ? 'alert' : 'status'}, section.text ?? ''));
  if (section.entries && section.entries.length) parts.push(create(doc, 'ul', {class: 'entries'}, ...section.entries.map(entry => renderEntry(doc, entry))));
  if (section.items && section.items.length) parts.push(create(doc, 'ul', {class: 'items'}, ...section.items.map(item => create(doc, 'li', {}, item.text,
    item.items && item.items.length ? create(doc, 'ul', {}, ...item.items.map(inner => create(doc, 'li', {}, inner.text))) : null))));
  if (section.links && section.links.length) parts.push(create(doc, 'ul', {class: 'links'}, ...section.links.map(link => create(doc, 'li', {}, create(doc, 'a', {href: link.href}, link.label)))));
  for (const chart of section.charts ?? []) parts.push(renderChart(doc, chart));
  for (const table of section.tables ?? []) parts.push(renderTable(doc, table));
  return create(doc, 'section', {class: 'card', 'aria-labelledby': `sec-${section.id}`}, ...parts);
}

function renderBody(doc, body, current, actions) {
  body.replaceChildren();
  if (current.state === 'ready' && typeof current.mount === 'function') {
    try { current.mount(body, current.viewModel, actions ?? {}); return; } catch { body.replaceChildren(create(doc, 'p', {class: 'notice notice-error', role: 'alert'}, 'This view could not be drawn.')); return; }
  }
  if (current.state === 'loading') body.append(create(doc, 'p', {role: 'status'}, current.text));
  else if (current.state === 'error') body.append(create(doc, 'p', {class: 'notice notice-error', role: 'alert'}, current.text));
  else body.append(create(doc, 'p', {class: 'notice notice-info'}, current.text));
}

/**
 * Draw the shell into `root`. `handlers.onConfig(id)` is called when the configuration changes.
 * Returns { main, announce } so the caller can move focus and speak after a change.
 */
export function renderShell(doc, root, shell, handlers = {}) {
  root.replaceChildren();
  const select = create(doc, 'select', {id: 'config-select'});
  if (shell.config.selected_id === null) select.append(create(doc, 'option', {value: '', selected: 'selected'}, shell.config.prompt ?? 'No mission configuration selected'));
  for (const option of shell.config.options) {
    const element = create(doc, 'option', {value: option.id}, `${option.label} — ${option.detail}`);
    if (option.id === shell.config.selected_id) element.setAttribute('selected', 'selected');
    select.append(element);
  }
  select.addEventListener('change', () => { if (select.value && handlers.onConfig) handlers.onConfig(select.value); });

  const nav = create(doc, 'nav', {'aria-label': 'Views'}, create(doc, 'ul', {}, ...shell.nav.map(item =>
    create(doc, 'li', {}, create(doc, 'a', item.current ? {href: item.href, 'aria-current': 'page'} : {href: item.href}, item.label)))));
  const title = shell.nav.find(item => item.current)?.label ?? 'Órbita';
  const body = create(doc, 'div', {id: 'view-body'});
  const main = create(doc, 'main', {id: 'view', tabindex: '-1', 'aria-labelledby': 'view-title'}, create(doc, 'h2', {id: 'view-title'}, title), body);
  const announce = create(doc, 'div', {id: 'announce', class: 'visually-hidden', role: 'status', 'aria-live': 'polite'});

  const sourceSelect = create(doc, 'select', {id: 'source-select'});
  if (shell.source.selected_id === null) sourceSelect.append(create(doc, 'option', {value: '', selected: 'selected'}, 'No data source selected'));
  for (const option of shell.source.options) {
    const element = create(doc, 'option', {value: option.id}, `${option.label} — ${option.detail}`);
    if (option.id === shell.source.selected_id) element.setAttribute('selected', 'selected');
    sourceSelect.append(element);
  }
  sourceSelect.addEventListener('change', () => { if (sourceSelect.value && handlers.onSource) handlers.onSource(sourceSelect.value); });

  root.append(
    create(doc, 'a', {class: 'skip', href: '#view'}, 'Skip to content'),
    create(doc, 'header', {class: 'topbar'}, create(doc, 'h1', {}, 'Órbita'),
      create(doc, 'div', {class: 'config'}, create(doc, 'label', {for: 'source-select'}, 'Data source'), sourceSelect),
      create(doc, 'div', {class: 'config'}, create(doc, 'label', {for: 'config-select'}, 'Mission configuration'), select)),
    create(doc, 'p', {class: `notice notice-${shell.storage.kind}`, id: 'storage-notice'}, shell.storage.text),
    nav, main, announce);
  renderBody(doc, body, shell.current, handlers.actions);
  return {main, announce};
}
