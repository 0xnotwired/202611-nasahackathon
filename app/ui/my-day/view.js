// DOM only. Draws the my-day view model (alerts, tasks, known and not recorded today, links) with the shared section renderer.
import {renderSection} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  element.replaceChildren(...viewModel.sections.map(section => renderSection(doc, section)));
}
