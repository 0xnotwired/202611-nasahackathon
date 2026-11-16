// DOM only. Draws the adaptation view model with the shared section renderer; the view holds no data rules.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  element.replaceChildren(...viewModel.sections.map(section => renderSection(doc, section)));
}
