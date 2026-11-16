// DOM only. Draws the habitat view model. The one control is a native select for the place; nothing is attributed to the person until it is chosen.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;

  function draw() {
    const select = doc.createElement('select'); select.id = 'habitat-place';
    const none = doc.createElement('option'); none.value = ''; none.textContent = 'No place chosen'; select.append(none);
    for (const place of current.places ?? []) { const option = doc.createElement('option'); option.value = place; option.textContent = place; select.append(option); }
    select.value = current.chosen_place ?? '';
    select.addEventListener('change', async () => {
      const next = await current.interactions.choosePlace(select.value === '' ? null : select.value);
      if (next && next.state === 'ready') { current = next; draw(); const back = doc.getElementById('habitat-place'); if (back) back.focus(); }
    });
    const label = doc.createElement('label'); label.setAttribute('for', 'habitat-place'); label.textContent = 'My place';
    const field = doc.createElement('div'); field.className = 'field'; field.append(label, select);
    element.replaceChildren(field, ...current.sections.map(section => renderSection(doc, section)));
  }
  draw();
}
