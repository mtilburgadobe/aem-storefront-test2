import { getShopOrigin } from '../../scripts/shopify/storefront.js';

/*
 * shop-contact: page heading + native Shopify contact form. DOM contract: the comment at the top
 * of shop-contact.css. Authored: row 1 = heading / intro (moved as is); key/value rows name, email,
 * phone, comment, submit (the label text nodes are moved into the labels / submit button).
 * The form posts natively to Shopify's /contact (form_type=contact); no script submits it.
 * After Shopify's redirect (?contact_posted=true) the theme's success message is shown.
 */

const FIELDS = [
  {
    key: 'name', id: 'ContactForm-name', type: 'text', name: 'contact[name]', autocomplete: 'name',
  },
  {
    key: 'email',
    id: 'ContactForm-email',
    type: 'email',
    name: 'contact[email]',
    autocomplete: 'email',
    spellcheck: 'false',
    autocapitalize: 'off',
    'aria-required': 'true',
  },
  {
    key: 'phone', id: 'ContactForm-phone', type: 'tel', name: 'contact[phone]', autocomplete: 'tel', pattern: '[0-9\\-]*',
  },
  {
    key: 'comment', id: 'ContactForm-body', tag: 'textarea', name: 'contact[body]', rows: '10',
  },
];

const DEFAULTS = {
  name: 'Name',
  email: 'E-Mail-Adresse',
  phone: 'Telefonnummer',
  comment: 'Kommentar',
  submit: 'Submit',
};

/* theme locale string (contact.form.post_success), shown after Shopify's redirect */
const SUCCESS = 'Danke, dass du uns kontaktiert hast. Wir werden uns so schnell wie möglich bei dir melden.';
const CHECKMARK = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="shop-contact__success-icon"><path d="M4.75439 10.7485L7.68601 14.5888C7.79288 14.7288 7.84632 14.7988 7.91174 14.8242C7.96907 14.8466 8.03262 14.8469 8.09022 14.8253C8.15596 14.8007 8.21026 14.7314 8.31886 14.5927L15.2475 5.74658" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  });
  node.append(...children.filter(Boolean));
  return node;
}

/** Moves a value cell's authored nodes into a fragment (unwrapping a single paragraph). */
function take(cell) {
  const fragment = document.createDocumentFragment();
  if (!cell) return fragment;
  const source = cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    ? cell.firstElementChild : cell;
  fragment.append(...source.childNodes);
  return fragment;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const header = el('div', { class: 'shop-contact__header' });
  const config = {};
  rows.forEach((row) => {
    const [first, second] = row.children;
    if (second) {
      config[first.textContent.trim().toLowerCase()] = second;
    } else if (first) {
      header.append(...first.childNodes);
    }
  });
  header.querySelector('h1')?.classList.add('shop-contact__heading');

  const form = el('form', {
    class: 'shop-contact__form',
    id: 'ContactForm',
    method: 'post',
    action: `${await getShopOrigin()}/contact`,
    'accept-charset': 'UTF-8',
  });
  form.append(
    el('input', { type: 'hidden', name: 'form_type', value: 'contact' }),
    el('input', { type: 'hidden', name: 'utf8', value: '✓' }),
  );

  if (new URLSearchParams(window.location.search).get('contact_posted') === 'true') {
    const success = el('div', { class: 'shop-contact__success', tabindex: '-1' });
    success.innerHTML = CHECKMARK;
    success.append(SUCCESS);
    form.append(success);
    requestAnimationFrame(() => success.focus());
  }

  const controls = FIELDS.map(({ key, tag, ...attrs }) => {
    const label = el('label', { class: 'shop-visually-hidden', for: attrs.id });
    if (config[key]) label.append(take(config[key]));
    else label.append(DEFAULTS[key]);
    // the placeholder attribute mirrors the authored label (attributes cannot hold nodes)
    const placeholder = label.textContent.trim();
    if (key === 'email') label.append(el('span', { 'aria-hidden': 'true' }, '*'));
    const input = el(tag || 'input', {
      class: tag === 'textarea' ? 'shop-contact__input shop-contact__input--textarea' : 'shop-contact__input',
      ...attrs,
      placeholder,
    });
    if (!tag) input.value = '';
    return [label, input];
  });

  const row = el('div', { class: 'shop-contact__row' }, ...controls[0], ...controls[1]);
  form.append(row, ...controls[2], ...controls[3]);

  /**
   * @ew-exempt EW7: the authored submit label is a text node MOVED into a span inside the
   * button (never re-typed from textContent); a native submit button needs a visible label.
   */
  const submitLabel = el('span', { class: 'shop-contact__submit-label' });
  if (config.submit) submitLabel.append(take(config.submit));
  else submitLabel.append(DEFAULTS.submit);
  form.append(el('button', { class: 'shop-button shop-button--primary shop-contact__submit', type: 'submit' }, submitLabel));

  block.replaceChildren(header, el('div', { class: 'shop-contact__body' }, form));
}
