// DOM only. Draws the ground panel (simulated sync): the link, a share form, what was sent and what the ground panel has received.
// Native controls only: checkboxes choose records, one more checkbox confirms the share, buttons act. Choices survive a failed share.
import {renderSection, renderEntry} from '../base/index.js';

export function mount(element, viewModel) {
  const doc = element.ownerDocument;
  let current = viewModel;
  const chosen = new Set();
  const state = {confirmed: false, delay: ''};
  const el = (tag, attrs = {}, ...children) => {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    for (const child of children) if (child !== null && child !== undefined) node.append(typeof child === 'object' ? child : doc.createTextNode(String(child)));
    return node;
  };
  const sectionOf = id => current.sections.find(section => section.id === id);

  async function apply(work, focusId) {
    current = await work;
    draw();
    const back = doc.getElementById(focusId) ?? doc.getElementById('ground-message');
    if (back) { if (back.tagName === 'P' && !back.hasAttribute('tabindex')) back.setAttribute('tabindex', '-1'); back.focus(); }
  }

  function linkCard(section) {
    if (section.state !== 'ready') return renderSection(doc, section);
    const delay = el('input', {id: 'ground-delay', type: 'text', inputmode: 'numeric', autocomplete: 'off'}); delay.value = state.delay || (section.delay_minutes ?? '');
    delay.addEventListener('input', () => { state.delay = delay.value; });
    const set = el('button', {type: 'button', id: 'ground-set-delay'}, 'Set delay');
    set.addEventListener('click', () => apply(current.interactions.setDelay(delay.value.trim() === '' ? NaN : Number(delay.value.replace(',', '.'))).then(next => { if (next.message && next.message.kind === 'info') state.delay = ''; return next; }), 'ground-set-delay'));
    const showDelay = section.configured === 'delayed';
    return el('section', {class: 'card', 'aria-labelledby': 'sec-link'}, el('h3', {id: 'sec-link'}, section.title), el('p', {class: 'legend'}, section.note), el('p', {id: 'ground-mode'}, `Link: ${section.mode_text}`),
      showDelay ? el('div', {class: 'field'}, el('label', {for: 'ground-delay'}, 'Delay, in minutes'), delay) : null, showDelay ? set : null);
  }

  function shareCard(section) {
    const advance = el('button', {type: 'button', id: 'ground-advance'}, 'Deliver what is due'); if (!section.actions.advance.enabled) advance.setAttribute('disabled', 'disabled');
    advance.addEventListener('click', () => apply(current.interactions.advance(), 'ground-advance'));
    if (section.state !== 'ready') return renderSection(doc, section);
    const boxes = section.choices.map((choice, index) => {
      const box = el('input', {type: 'checkbox', id: `share-choice-${index}`, value: choice.id}); box.checked = chosen.has(choice.id);
      box.addEventListener('change', () => { if (box.checked) chosen.add(choice.id); else chosen.delete(choice.id); });
      return el('div', {class: 'field'}, box, ' ', el('label', {for: `share-choice-${index}`}, choice.label));
    });
    const confirm = el('input', {type: 'checkbox', id: 'share-confirm'}); confirm.checked = state.confirmed;
    confirm.addEventListener('change', () => { state.confirmed = confirm.checked; });
    const send = el('button', {type: 'submit', id: 'share-send'}, 'Share'); if (!section.actions.share.enabled) send.setAttribute('disabled', 'disabled');
    const form = el('form', {id: 'share-form'}, el('fieldset', {}, el('legend', {}, 'Choose what to share'), ...boxes), el('div', {class: 'field'}, confirm, ' ', el('label', {for: 'share-confirm'}, 'I confirm I want to send the chosen records to the ground panel (simulated).')), send);
    form.addEventListener('submit', event => {
      event.preventDefault();
      apply(current.interactions.share({ids: [...chosen], confirmed: state.confirmed}).then(next => { if (next.message && next.message.kind === 'info') { chosen.clear(); state.confirmed = false; } return next; }), 'share-send');
    });
    return el('section', {class: 'card', 'aria-labelledby': 'sec-share'}, el('h3', {id: 'sec-share'}, section.title), el('p', {class: 'legend'}, section.note), form,
      section.actions.share.enabled ? null : el('p', {class: 'notice notice-info'}, section.actions.share.reason), advance);
  }

  function deliveryCard(d) {
    return el('li', {class: 'entry', 'data-state': d.state}, el('strong', {class: 'entry-label'}, `Delivery of ${d.what_text}`), el('div', {class: 'legend'}, d.state_text),
      el('div', {class: 'legend'}, `Created ${d.created_text} · sent ${d.sent_text} · received ${d.received_text}`), el('div', {class: 'legend'}, d.age_text),
      el('ul', {class: 'entries'}, ...d.items.map(item => renderEntry(doc, item))));
  }
  const listCard = section => (section.state === 'ready' ? el('section', {class: 'card', 'aria-labelledby': `sec-${section.id}`}, el('h3', {id: `sec-${section.id}`}, section.title), section.note ? el('p', {class: 'legend'}, section.note) : null, el('ul', {class: 'entries'}, ...section.entries.map(deliveryCard))) : renderSection(doc, section));

  function draw() {
    const parts = [];
    if (current.message) parts.push(el('p', {id: 'ground-message', class: `notice notice-${current.message.kind === 'error' ? 'error' : 'info'}`, role: current.message.kind === 'error' ? 'alert' : 'status'}, current.message.text));
    parts.push(renderSection(doc, sectionOf('source')), linkCard(sectionOf('link')), shareCard(sectionOf('share')), listCard(sectionOf('sent')), listCard(sectionOf('ground')));
    element.replaceChildren(...parts);
  }
  draw();
}
