import { getMetadata } from '../../scripts/aem.js';
import { getShopOrigin } from '../../scripts/shopify/storefront.js';

/*
 * shop-footer: email signup + utilities row. The DOM contract is the comment at the top of
 * shop-footer.css.
 *
 * Authored (the /footer fragment): section 1 = heading + text, section 2 = copyright paragraph,
 * policies label paragraph and the policy link list. Those nodes are MOVED into the slots.
 * The newsletter form is a native POST to Shopify's hosted /contact endpoint
 * (form_type=customer), exactly like the theme; Shopify runs its bot check and the redirect.
 */

const ARROW = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path clip-rule="evenodd" fill-rule="evenodd" fill="currentColor" d="m11.246 5.31759c.0322-.07821.0833-.14723.1486-.20093.0654-.0537.143-.09041.2259-.10686.083-.01645.1688-.01214.2497.01257.0808.0247.1544.06902.214.12902l4.104 4.104c.0478.04765.0857.10426.1115.16659.0259.06232.0392.12913.0392.19661 0 .06747-.0133.13429-.0392.19661-.0258.06233-.0637.11893-.1115.16659l-4.104 4.10401c-.0963.0963-.227.1504-.3632.1504s-.2669-.0541-.3632-.1504-.1504-.227-.1504-.3632.0541-.2669.1504-.3632l3.2288-3.2278h-11.0736c-.13606 0-.26654-.0541-.36275-.15027-.0962-.0962-.15025-.22669-.15025-.36274 0-.13606.05405-.26654.15025-.36275.09621-.0962.22669-.15025.36275-.15025h11.0736l-3.2288-3.2278c-.0721-.07178-.1212-.16335-.1411-.2631s-.0097-.20316.0293-.2971z"/></svg>';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    node.setAttribute(key, value === true ? '' : value);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

/**
 * Loads a fragment's sections (`<name>.plain.html`), skipping the metadata section.
 * Locally the fragments are served under /content: pages previewed under /content read them
 * there, any other localhost page retries there after a 404.
 * @param {string} metaName page metadata naming the fragment path
 * @param {string} fallback default fragment path
 * @returns {Promise<Element[]>} the authored sections
 */
async function fetchFragment(metaName, fallback) {
  const meta = getMetadata(metaName);
  const path = (meta ? new URL(meta, window.location).pathname : fallback)
    .replace(/(\.plain)?\.html$/, '');
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  // local previews of the imported content live under /content: go there first
  const preview = local && /^\/content\//.test(window.location.pathname) && !path.startsWith('/content/');
  try {
    let resp = await fetch(`${preview ? '/content' : ''}${path}.plain.html`);
    if (!resp.ok && local && !preview) resp = await fetch(`/content${path}.plain.html`);
    if (!resp.ok) return [];
    const tmp = document.createElement('div');
    tmp.innerHTML = await resp.text();
    return [...tmp.children].filter((section) => !section.querySelector('.metadata'));
  } catch (e) {
    return [];
  }
}

/** Moves an element's child nodes into a new span (authored nodes are moved, not rebuilt). */
function moveChildrenToSpan(node) {
  const span = el('span');
  span.append(...node.childNodes);
  return span;
}

function newsletterForm(shopOrigin) {
  const hidden = (name, value) => el('input', { type: 'hidden', name, value });
  return el(
    'form',
    {
      class: 'shop-footer__form',
      method: 'post',
      action: `${shopOrigin}/contact`,
      'accept-charset': 'UTF-8',
    },
    hidden('form_type', 'customer'),
    hidden('utf8', '✓'),
    hidden('contact[tags]', 'newsletter'),
    el(
      'div',
      { class: 'shop-footer__field' },
      el('label', { class: 'shop-visually-hidden', for: 'shop-footer-email' }, 'E-Mail'),
      el('input', {
        class: 'shop-footer__input',
        id: 'shop-footer-email',
        type: 'email',
        name: 'contact[email]',
        placeholder: 'E-Mail-Adresse',
        autocomplete: 'email',
        required: true,
      }),
      (() => {
        const button = el('button', { class: 'shop-footer__submit', type: 'submit', 'aria-label': 'Registrieren' });
        const tpl = document.createElement('template');
        tpl.innerHTML = ARROW;
        button.append(tpl.content.firstElementChild);
        return button;
      })(),
    ),
  );
}

/**
 * Builds the policies popover trigger from the authored label paragraph.
 * @ew-exempt EW7 (authored text inside a <button>): the native `popovertarget` invoker must be
 * a <button>. The authored paragraph's text nodes are MOVED (not rebuilt) into a span inside it,
 * so the author still edits one paragraph in the /footer fragment.
 * @param {Element} [label] the authored paragraph
 * @returns {HTMLButtonElement} the trigger
 */
function policiesTrigger(label) {
  const button = el('button', {
    class: 'shop-footer__policies-trigger',
    type: 'button',
    popovertarget: 'shop-footer-policies',
  });
  if (label) button.append(moveChildrenToSpan(label));
  return button;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [sections, shopOrigin] = await Promise.all([
    fetchFragment('footer', '/footer'),
    getShopOrigin(),
  ]);
  const signupSection = sections.find((s) => s.querySelector('h1, h2, h3, h4, h5, h6'));
  const utilitySection = sections.find((s) => s !== signupSection);
  block.textContent = '';

  /* signup row */
  const intro = el('div', { class: 'shop-footer__intro' });
  const heading = signupSection?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('shop-footer__heading');
    intro.append(heading);
  }
  const text = signupSection?.querySelector('p');
  if (text) {
    text.className = 'shop-footer__text';
    intro.append(text);
  }
  block.append(el('div', { class: 'shop-footer__signup' }, intro, newsletterForm(shopOrigin)));

  /* utilities row */
  const paragraphs = [...(utilitySection?.querySelectorAll(':scope > p') || [])];
  const copyright = paragraphs.find((p) => p.querySelector('a')) || paragraphs[0];
  const policiesLabel = paragraphs.find((p) => p !== copyright);
  const policyList = utilitySection?.querySelector('ul');

  const inner = el('div', { class: 'shop-footer__utilities-inner' });
  inner.append(el('div', { class: 'shop-footer__copyright' }, copyright ? moveChildrenToSpan(copyright) : null));
  if (policyList) {
    inner.append(el(
      'div',
      { class: 'shop-footer__policies' },
      policiesTrigger(policiesLabel),
      el('div', { class: 'shop-footer__policies-popover', id: 'shop-footer-policies', popover: true }, policyList),
    ));
  } else {
    inner.append(el('div', { class: 'shop-footer__policies' }));
  }
  inner.append(el('div', { class: 'shop-footer__social' }));
  block.append(el('div', { class: 'shop-footer__utilities' }, inner));
}
