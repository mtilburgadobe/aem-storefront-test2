import { storefront, formatMoney, imageUrl } from '../../scripts/shopify/storefront.js';
import { getCart, updateLine, goToCheckout } from '../../scripts/shopify/cart.js';

/*
 * shop-cart: the /cart page. DOM contract: the comment at the top of shop-cart.css.
 * Authored rows (moved into the slots, never re-typed):
 *   1 empty-state heading (h1) · 2 login sentence + link · 3 "Weiter einkaufen" link
 *   key/value: heading (filled title "Cart") · discount · total · tax-note · checkout
 * Cart data: scripts/shopify/cart.js (getCart + shop:cart-updated). Checkout = hosted Shopify.
 */

const LABELS = {
  bubble: (n) => `Gesamtzahl der Artikel im Warenkorb: ${n}`,
  caption: 'Gesamtbetrag im Warenkorb ',
  image: 'Produktbild',
  information: 'Produktinformationen',
  quantity: 'Anzahl',
  total: 'Produkt insgesamt',
  price: 'Preis',
  minus: 'Menge verringern',
  plus: 'Menge erhöhen',
  remove: (title) => `Entferne ${title}`,
  removeText: 'Entfernen',
  discountLabel: 'Rabattcode anwenden',
  discountPlaceholder: 'Rabattcode',
  discountApply: 'Anwenden',
  shopPay: 'Shop Pay',
  paypal: 'PayPal',
};

const MINUS_ICON = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 2.75L7 11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const DISCOUNT_ICON = '<svg class="shop-cart__discount-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 2.75L7 11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const REMOVE_ICON = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="shop-cart__remove-bottom" d="M11.5 9v4.25M8.5 9v4.25M5.75 12.2V6h8.5c0 2.421 0 3.779 0 6.2 0 .853 0 1.447-.038 1.91-.037.453-.106.714-.207.911a2.498 2.498 0 0 1-.983 1.017c-.197.1-.458.17-.911.207-.463.037-1.057.038-1.91.038h-.4c-.853 0-1.447 0-1.91-.038-.453-.037-.714-.106-.911-.207a2.498 2.498 0 0 1-.984-1.017c-.1-.197-.17-.458-.207-.911C5.75 13.647 5.75 13.053 5.75 12.2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="shop-cart__remove-top" d="M4.25 6h11.5M8 5.25a2 2 0 1 1 4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* wallet logos lifted from the prototype (register R-02 / R-04: both hand off to checkoutUrl) */
const SHOP_PAY_LOGO = '<svg xmlns="http://www.w3.org/2000/svg" width="51" height="20" aria-hidden="true" viewBox="0 -2 206 81"><path fill="#fff" d="M29.514 35.18c-7.934-1.697-11.469-2.36-11.469-5.374 0-2.834 2.392-4.246 7.176-4.246 4.207 0 7.283 1.813 9.546 5.363.171.274.524.369.812.222l8.927-4.447a.616.616 0 0 0 .256-.864c-3.705-6.332-10.55-9.798-19.562-9.798-11.843 0-19.2 5.752-19.2 14.898 0 9.714 8.96 12.169 16.904 13.865 7.944 1.697 11.49 2.36 11.49 5.373 0 3.014-2.584 4.436-7.742 4.436-4.763 0-8.297-2.15-10.433-6.321a.63.63 0 0 0-.843-.274L6.47 52.364a.623.623 0 0 0-.278.843c3.535 7.006 10.785 10.947 20.47 10.947 12.334 0 19.787-5.658 19.787-15.088s-9.001-12.169-16.935-13.865v-.021ZM77.353 16.036c-5.062 0-9.536 1.77-12.75 4.92-.203.19-.534.053-.534-.221V.622a.62.62 0 0 0-.63-.622h-11.17a.62.62 0 0 0-.63.622v62.426a.62.62 0 0 0 .63.621h11.17a.62.62 0 0 0 .63-.621V35.664c0-5.289 4.11-9.345 9.653-9.345 5.542 0 9.557 3.972 9.557 9.345v27.384a.62.62 0 0 0 .63.621h11.17a.62.62 0 0 0 .63-.621V35.664c0-11.505-7.646-19.618-18.356-19.618v-.01ZM118.389 14.255c-6.065 0-11.767 1.823-15.847 4.467a.618.618 0 0 0-.202.833l4.922 8.292c.182.295.566.4.865.22a19.82 19.82 0 0 1 10.262-2.78c9.749 0 16.914 6.785 16.914 15.75 0 7.64-5.734 13.297-13.006 13.297-5.926 0-10.037-3.403-10.037-8.207 0-2.75 1.185-5.005 4.271-6.596a.607.607 0 0 0 .246-.864l-4.645-7.754a.632.632 0 0 0-.759-.264c-6.225 2.276-10.593 7.755-10.593 15.109 0 11.126 8.981 19.428 21.507 19.428 14.629 0 25.147-9.998 25.147-24.338 0-15.372-12.237-26.603-29.066-26.603l.021.01ZM180.098 15.951c-5.649 0-10.689 2.055-14.373 5.68a.313.313 0 0 1-.534-.222v-4.362a.62.62 0 0 0-.63-.621H153.68a.62.62 0 0 0-.63.621v62.331a.62.62 0 0 0 .63.622h11.169a.62.62 0 0 0 .631-.622v-20.44c0-.274.331-.41.533-.231 3.674 3.371 8.532 5.342 14.096 5.342 13.102 0 23.321-10.463 23.321-24.054 0-13.592-10.23-24.054-23.321-24.054l-.011.01Zm-2.103 37.54c-7.454 0-13.103-5.847-13.103-13.58 0-7.734 5.638-13.582 13.103-13.582 7.464 0 13.091 5.753 13.091 13.581 0 7.829-5.553 13.581-13.102 13.581h.011Z"></path></svg>';
const PAYPAL_LOGO = '<svg class="shop-cart__wallet-logo" aria-hidden="true" viewBox="0 0 101 32" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg"><path fill="#003087" d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"/><path fill="#003087" d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.137 10.6 C 36.237 10.4 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z"/><path fill="#003087" d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z"/><path fill="#009cde" d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18 C 62.037 17.5 62.437 17.1 63.037 17.1 L 65.537 17.1 C 70.637 17.1 73.637 14.6 74.437 9.7 C 74.737 7.6 74.437 5.9 73.437 4.7 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.737 9.1 68.637 10.1 Z"/><path fill="#009cde" d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.637 10.6 C 91.637 10.4 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.737 15.3 85.937 16.2 85.737 17.2 Z"/><path fill="#009cde" d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"/></svg>';

const DISCOUNT_MUTATION = `mutation Discount($cartId: ID!, $codes: [String!], $country: CountryCode,
  $language: LanguageCode) @inContext(country: $country, language: $language) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) {
    cart { id }
    userErrors { field message }
  }
}`;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value; // static block constants (icons) only
    else node.setAttribute(key, value === true ? '' : value);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

function numericId(gid) {
  return (gid || '').split('/').pop();
}

/** Moves a cell's authored content (text nodes and inline elements) into a fragment. */
function take(cell) {
  const fragment = document.createDocumentFragment();
  if (!cell) return fragment;
  const only = cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    && !cell.textContent.replace(cell.firstElementChild.textContent, '').trim();
  fragment.append(...(only ? cell.firstElementChild.childNodes : cell.childNodes));
  return fragment;
}

function readAuthored(block) {
  const authored = { config: {} };
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    const [cell, value] = cells;
    if (value) {
      authored.config[cell.textContent.trim().toLowerCase()] = value;
      return;
    }
    if (!cell) return;
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && !authored.heading) {
      authored.heading = heading;
      return;
    }
    const link = cell.querySelector('a');
    const text = cell.textContent.trim();
    if (link && link.textContent.trim() === text && !authored.continue) {
      authored.continue = link;
    } else if (!authored.login) {
      const p = cell.querySelector('p');
      if (p && cell.children.length === 1) {
        authored.login = p;
      } else {
        authored.login = el('p');
        authored.login.append(...cell.childNodes);
      }
    }
  });
  return authored;
}

function quantityControl(line, onChange) {
  const minus = el('button', {
    class: 'shop-cart__quantity-button shop-cart__quantity-button--minus',
    type: 'button',
    name: 'minus',
    disabled: line.quantity <= 1,
  }, el('span', { class: 'shop-visually-hidden', text: LABELS.minus }));
  minus.insertAdjacentHTML('beforeend', MINUS_ICON);
  const input = el('input', {
    class: 'shop-cart__quantity-input',
    type: 'number',
    name: 'updates[]',
    value: String(line.quantity),
    min: '1',
    step: '1',
    'aria-label': LABELS.quantity,
    'data-line': line.id,
  });
  const plus = el('button', {
    class: 'shop-cart__quantity-button shop-cart__quantity-button--plus', type: 'button', name: 'plus',
  }, el('span', { class: 'shop-visually-hidden', text: LABELS.plus }));
  plus.insertAdjacentHTML('beforeend', PLUS_ICON);
  minus.addEventListener('click', () => onChange(line.quantity - 1));
  plus.addEventListener('click', () => onChange(line.quantity + 1));
  input.addEventListener('focus', () => input.select());
  input.addEventListener('change', () => {
    const n = Math.max(1, parseInt(input.value, 10) || 1);
    if (n !== line.quantity) onChange(n);
    else input.value = String(n);
  });
  return el('div', { class: 'shop-cart__quantity' }, minus, input, plus);
}

function lineRow(line, onUpdate) {
  const variant = line.merchandise || {};
  const product = variant.product || {};
  const href = `/products/${product.handle}?variant=${numericId(variant.id)}`;
  const media = el('td', { class: 'shop-cart__line-media', headers: 'shop-cart-product-image' });
  if (variant.image?.url) {
    media.append(el('a', { href }, el('img', {
      src: imageUrl(variant.image.url, 250), alt: '', width: 250, height: 250, loading: 'lazy',
    })));
  }
  const details = el(
    'td',
    { class: 'shop-cart__line-details', headers: 'shop-cart-product-information' },
    el('div', { class: 'shop-cart__line-title-row' }, el('a', { class: 'shop-cart__line-title', href, text: product.title })),
  );
  const options = (variant.selectedOptions || [])
    .filter((o) => !(o.name === 'Title' && o.value === 'Default Title'));
  if (options.length) {
    details.append(el('dl', { class: 'shop-cart__line-options' }, ...options.map((o) => el(
      'div',
      { class: 'shop-cart__line-option' },
      el('dt', { text: `${o.name}:` }),
      el('dd', { text: o.value }),
    ))));
  }
  const unit = el('p', { class: 'shop-cart__line-unit-price' }, el('span', { class: 'shop-visually-hidden', text: LABELS.price }));
  unit.append(' ', el('span', { text: formatMoney(line.cost?.amountPerQuantity) }));
  details.append(unit);

  const remove = el('button', {
    class: 'shop-cart__remove', type: 'button', 'aria-label': LABELS.remove(product.title), html: REMOVE_ICON,
  }, el('span', { class: 'shop-visually-hidden', text: LABELS.removeText }));
  remove.addEventListener('click', () => onUpdate(line, 0));

  return el(
    'tr',
    { class: 'shop-cart__line', 'data-line': line.id },
    media,
    details,
    el(
      'td',
      { class: 'shop-cart__line-quantity', headers: 'shop-cart-quantity' },
      quantityControl(line, (n) => onUpdate(line, n)),
      remove,
    ),
    el('td', { class: 'shop-cart__line-price', headers: 'shop-cart-product-total' }, el('span', { text: formatMoney(line.cost?.totalAmount) })),
  );
}

function walletLinks(href) {
  const shopPay = el('a', {
    class: 'shop-cart__wallet shop-cart__wallet--shop-pay', href, 'aria-label': LABELS.shopPay,
  });
  const paypal = el('a', {
    class: 'shop-cart__wallet shop-cart__wallet--paypal', href, 'aria-label': LABELS.paypal,
  });
  shopPay.innerHTML = SHOP_PAY_LOGO;
  paypal.innerHTML = PAYPAL_LOGO;
  return el('div', { class: 'shop-cart__wallets' }, shopPay, paypal);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const authored = readAuthored(block);
  const { config } = authored;
  block.replaceChildren();

  /* authored slots, built once and re-attached on every render */
  let emptyH1 = authored.heading || el('h1');
  if (emptyH1.tagName !== 'H1') {
    const h1 = el('h1');
    h1.append(...emptyH1.childNodes);
    emptyH1 = h1;
  }
  emptyH1.className = 'shop-cart__heading shop-h4';
  emptyH1.removeAttribute('id');

  const filledH1 = el('h1', { class: 'shop-cart__heading shop-h4' });
  filledH1.append(take(config.heading));
  const bubbleCount = el('span', { class: 'shop-cart__bubble-count', 'aria-hidden': 'true' });
  const bubbleText = el('span', { class: 'shop-visually-hidden' });
  filledH1.append(' ', el('span', { class: 'shop-cart__bubble' }, bubbleCount, bubbleText));

  // decorateButtons adds a title copy of the link text; the theme links carry none
  [authored.login?.querySelector('a'), authored.continue].forEach((a) => a?.removeAttribute('title'));
  const empty = el('div', { class: 'shop-cart__empty' });
  if (authored.login) empty.append(authored.login);
  if (authored.continue) {
    authored.continue.className = 'shop-button shop-button--primary shop-cart__continue';
    empty.append(authored.continue);
  }

  const discountLabel = el('span', { class: 'shop-cart__discount-label' });
  discountLabel.append(take(config.discount));
  const discountInput = el('input', {
    class: 'shop-cart__discount-input', id: 'shop-cart-discount', type: 'text', name: 'discount', placeholder: LABELS.discountPlaceholder, required: true,
  });
  const discountForm = el(
    'form',
    { class: 'shop-cart__discount-form' },
    el('label', { class: 'shop-visually-hidden', for: 'shop-cart-discount', text: LABELS.discountLabel }),
    discountInput,
    el('button', { class: 'shop-button shop-button--primary shop-cart__discount-button', type: 'submit', text: LABELS.discountApply }),
  );
  const summaryEl = el('summary', {}, discountLabel);
  summaryEl.insertAdjacentHTML('beforeend', DISCOUNT_ICON);
  const discount = el(
    'details',
    { class: 'shop-cart__discount' },
    summaryEl,
    el('div', { class: 'shop-cart__discount-content' }, discountForm),
  );

  const totalLabel = el('span', { class: 'shop-cart__total-label' });
  totalLabel.append(take(config.total));
  const totalValue = el('span', { class: 'shop-cart__total-value' });
  const taxNote = el('small');
  taxNote.append(take(config['tax-note']));
  const checkout = el('a', { class: 'shop-button shop-button--primary shop-cart__checkout', href: '#' });
  checkout.append(take(config.checkout));

  const title = el('div', { class: 'shop-cart__title' });
  const items = el('div', { class: 'shop-cart__items' });
  const wallets = walletLinks('#');
  const summary = el('div', { class: 'shop-cart__summary' }, el(
    'div',
    { class: 'shop-cart__summary-inner' },
    el(
      'div',
      { class: 'shop-cart__totals' },
      el('div', { class: 'shop-cart__actions' }, discount),
      el(
        'div',
        { class: 'shop-cart__totals-container' },
        el('div', { class: 'shop-cart__total' }, totalLabel, totalValue),
        el('p', { class: 'shop-cart__tax-note' }, taxNote),
      ),
    ),
    el('div', { class: 'shop-cart__ctas' }, checkout, wallets),
  ));
  const page = el('div', { class: 'shop-cart__page' }, title, items);
  block.append(page);

  [checkout, ...wallets.children].forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    goToCheckout();
  }));

  let queue = Promise.resolve();
  const onUpdate = (line, quantity) => {
    queue = queue.then(() => updateLine(line.id, quantity)).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('shop-cart: update failed', e);
      getCart(true).then((cart) => document.dispatchEvent(new CustomEvent('shop:cart-updated', { detail: { cart } })));
    });
  };

  const render = (cart) => {
    const lines = cart?.lines?.nodes || [];
    const filled = lines.length > 0 && cart.totalQuantity > 0;
    block.dataset.state = filled ? 'filled' : 'empty';
    if (!filled) {
      title.replaceChildren(emptyH1);
      items.replaceChildren(empty);
      summary.remove();
      return;
    }
    /* keep keyboard focus on the same control across re-renders */
    const active = document.activeElement;
    const activeLine = block.contains(active) ? active.closest('.shop-cart__line')?.dataset.line : null;
    const activeClass = activeLine ? [...active.classList].join('.') : null;

    bubbleCount.textContent = String(cart.totalQuantity);
    bubbleText.textContent = LABELS.bubble(cart.totalQuantity);
    title.replaceChildren(filledH1);
    const totalText = formatMoney(cart.cost?.totalAmount, true);
    const caption = el('caption', { class: 'shop-visually-hidden', text: LABELS.caption }, el('span', { text: totalText }));
    const head = el('thead', { class: 'shop-visually-hidden' }, el(
      'tr',
      {},
      el('th', { id: 'shop-cart-product-image', text: LABELS.image }),
      el('th', { id: 'shop-cart-product-information', text: LABELS.information }),
      el('th', { id: 'shop-cart-quantity', text: LABELS.quantity }),
      el('th', { id: 'shop-cart-product-total', text: LABELS.total }),
    ));
    const body = el('tbody', {}, ...lines.map((line) => lineRow(line, onUpdate)));
    const form = el(
      'form',
      {
        class: 'shop-cart__form', id: 'shop-cart-form', action: '/cart', method: 'post',
      },
      el('table', { class: 'shop-cart__table' }, caption, head, body),
    );
    form.addEventListener('submit', (e) => e.preventDefault());
    items.replaceChildren(form);
    totalValue.textContent = totalText;
    const href = cart.checkoutUrl || '#';
    checkout.href = href;
    [...wallets.children].forEach((a) => { a.href = href; });
    if (!summary.isConnected) page.append(summary);

    if (activeLine && activeClass) {
      block.querySelector(`.shop-cart__line[data-line="${CSS.escape(activeLine)}"] .${activeClass}`)?.focus();
    }
  };

  discountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = discountInput.value.trim();
    const cart = await getCart();
    if (!code || !cart) return;
    try {
      const data = await storefront(DISCOUNT_MUTATION, { cartId: cart.id, codes: [code] });
      const errors = data.cartDiscountCodesUpdate?.userErrors || [];
      if (errors.length) throw new Error(errors.map((err) => err.message).join('; '));
      discountInput.value = '';
      const fresh = await getCart(true);
      document.dispatchEvent(new CustomEvent('shop:cart-updated', { detail: { cart: fresh } }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('shop-cart: discount code not applied', err);
    }
  });

  document.addEventListener('shop:cart-updated', (e) => render(e.detail?.cart));
  render(await getCart());
}
