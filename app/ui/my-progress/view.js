// DOM only. Draws the my-progress view model. The one control is a native select for the charted variable.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;

  function draw() {
    const chart = current.sections.find(section => section.id === 'chart');
    const select = doc.createElement('select'); select.id = 'progress-variable';
    for (const option of (chart && chart.options) ?? []) { const item = doc.createElement('option'); item.value = option.id; item.textContent = option.label; select.append(item); }
    if (current.chart_variable) select.value = current.chart_variable;
    select.addEventListener('change', async () => {
      const next = await current.interactions.chooseVariable(select.value);
      if (next && next.state === 'ready') { current = next; draw(); const back = doc.getElementById('progress-variable'); if (back) back.focus(); }
    });
    const label = doc.createElement('label'); label.setAttribute('for', 'progress-variable'); label.textContent = 'Variable to chart';
    const field = doc.createElement('div'); field.className = 'field'; field.append(label, select);
    element.replaceChildren(field, ...current.sections.map(section => renderSection(doc, section)));
  }
  draw();
}
