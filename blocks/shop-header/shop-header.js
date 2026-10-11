import { getMetadata } from '../../scripts/aem.js';
import {
  storefront,
  getShopOrigin,
  setCountry,
  formatMoney,
  imageUrl,
  imageSrcset,
  PRODUCT_CARD_FIELDS,
} from '../../scripts/shopify/storefront.js';
import {
  getCart,
  updateLine,
  setCartCountry,
  goToCheckout,
} from '../../scripts/shopify/cart.js';

/*
 * shop-header: announcement bar, header row, menu drawer, localization popover, search modal
 * and cart drawer. The DOM contract is the comment at the top of shop-header.css.
 *
 * Authored (the /nav fragment): section 1 = announcement paragraph, section 2 = brand link +
 * menu list. Those nodes are MOVED into the slots. Everything Shopify-related (shop name,
 * countries, currency, featured products, search results, cart) is read at runtime from the
 * Storefront API and built with DOM APIs. UI strings (aria labels, drawer copy) are constants.
 */

const CONTEXT = '@inContext(country: $country, language: $language)';
const VARS = '$country: CountryCode, $language: LanguageCode';
const FEATURED_COLLECTION = 'all';
const FEATURED_COUNT = 4;
const RESOURCE_WIDTHS = [240, 352, 640, 832, 1200];

const ICONS = {
  menu: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 3.5H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1 10.5H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  close: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 3.75L10.25 10.25M10.25 3.75L3.75 10.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  closeLarge: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1765 12.025C11.4108 12.2594 11.7907 12.2594 12.025 12.025C12.2594 11.7907 12.2594 11.4108 12.025 11.1765L8.84931 8.00078L12.025 4.82505C12.2594 4.59073 12.2594 4.21083 12.025 3.97652C11.7907 3.7422 11.4108 3.7422 11.1765 3.97652L8.00078 7.15225L4.82505 3.97652C4.59073 3.7422 4.21083 3.7422 3.97652 3.97652C3.7422 4.21083 3.7422 4.59073 3.97652 4.82505L7.15225 8.00078L3.97652 11.1765C3.7422 11.4108 3.7422 11.7907 3.97652 12.025C4.21083 12.2594 4.59073 12.2594 4.82505 12.025L8.00078 8.84931L11.1765 12.025Z" fill="currentColor"/></svg>',
  search: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="4.75" stroke="currentColor" stroke-width="1.5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m12.5 12.5 3.25 3.25"/></svg>',
  caret: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5.5L7 9.5L3 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  account: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none"><path stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M10.375 3.813a3.063 3.063 0 1 1-6.125 0 3.063 3.063 0 0 1 6.125 0ZM7.313 9.5c-3.667 0-6.24 2.691-6.563 6.125h13.125C13.552 12.191 10.979 9.5 7.312 9.5Z"/></svg>',
  cart: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.392 6.875h13.216v8.016c0 .567-.224 1.112-.624 1.513-.4.402-.941.627-1.506.627H5.522a2.13 2.13 0 0 1-1.506-.627 2.15 2.15 0 0 1-.624-1.513zM8.818 2.969h2.333c.618 0 1.211.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.313c0-.622.246-1.218.683-1.658a2.33 2.33 0 0 1 1.65-.686"/></svg>',
  check: '<svg class="shop-header__country-check" aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.75439 10.7485L7.68601 14.5888C7.79288 14.7288 7.84632 14.7988 7.91174 14.8242C7.96907 14.8466 8.03262 14.8469 8.09022 14.8253C8.15596 14.8007 8.21026 14.7314 8.31886 14.5927L15.2475 5.74658" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  minus: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  plus: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 2.75L7 11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  remove: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="shop-header-cart__remove-bottom" d="M11.5 9v4.25M8.5 9v4.25M5.75 12.2V6h8.5c0 2.421 0 3.779 0 6.2 0 .853 0 1.447-.038 1.91-.037.453-.106.714-.207.911a2.498 2.498 0 0 1-.983 1.017c-.197.1-.458.17-.911.207-.463.037-1.057.038-1.91.038h-.4c-.853 0-1.447 0-1.91-.038-.453-.037-.714-.106-.911-.207a2.498 2.498 0 0 1-.984-1.017c-.1-.197-.17-.458-.207-.911C5.75 13.647 5.75 13.053 5.75 12.2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="shop-header-cart__remove-top" d="M4.25 6h11.5M8 5.25a2 2 0 1 1 4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/**
 * Creates an element with attributes and children (strings become text nodes).
 * @param {string} tag tag name
 * @param {Object} [attrs] attributes; `class` sets the class list, `true` sets an empty value
 * @param {...(Node|string)} children child nodes
 * @returns {HTMLElement} the element
 */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    node.setAttribute(key, value === true ? '' : value);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

function icon(name) {
  const tpl = document.createElement('template');
  tpl.innerHTML = ICONS[name];
  return tpl.content.firstElementChild;
}

/**
 * Normalises a pathname to the site path: drops the local `/content` preview prefix,
 * `.html` and a trailing `/index`, and trailing slashes.
 * @param {string} pathname a URL pathname
 * @returns {string} the site path, `/` for the home page
 */
export function sitePath(pathname = window.location.pathname) {
  let path = pathname
    .replace(/^\/content(?=\/|$)/, '')
    .replace(/(\.plain)?\.html$/, '')
    .replace(/\/index$/, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
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
function wrapChildren(node, className) {
  const span = el('span', className ? { class: className } : {});
  span.append(...node.childNodes);
  node.append(span);
  return node;
}

function variantNumber(gid) {
  return (gid || '').split('/').pop();
}

/* ---------- Shopify data ---------- */

const CHROME_QUERY = `query HeaderChrome(${VARS}) ${CONTEXT} {
  shop { name }
  localization {
    country { isoCode currency { isoCode symbol } }
    availableCountries { isoCode name currency { isoCode symbol } }
  }
}`;

const PRODUCTS_QUERY = `query HeaderProducts($handle: String!, $first: Int!, ${VARS}) ${CONTEXT} {
  collection(handle: $handle) { products(first: $first) { nodes { ${PRODUCT_CARD_FIELDS} } } }
  products(first: $first, sortKey: TITLE) { nodes { ${PRODUCT_CARD_FIELDS} } }
}`;

const PREDICTIVE_QUERY = `query HeaderPredictive($query: String!, ${VARS}) ${CONTEXT} {
  predictiveSearch(query: $query, limit: 4, limitScope: EACH, types: [PRODUCT, COLLECTION, QUERY]) {
    queries { text }
    products { ${PRODUCT_CARD_FIELDS} }
    collections { handle title image { url altText width height } }
  }
}`;

async function loadFeaturedProducts() {
  try {
    const data = await storefront(PRODUCTS_QUERY, {
      handle: FEATURED_COLLECTION,
      first: FEATURED_COUNT,
    });
    // `all` is Shopify's virtual catalog collection (alphabetical); the API has no such handle
    return data.collection?.products?.nodes || data.products?.nodes || [];
  } catch (e) {
    return [];
  }
}

/* ---------- resource cards (drawer featured products + search results) ---------- */

function resourceCard({
  href, title, image, price, sizes, eager = false,
}) {
  const card = el(
    'div',
    { class: 'shop-header-resource' },
    el('a', { class: 'shop-header-resource__link', href }, el('span', { class: 'shop-visually-hidden' }, title)),
  );
  if (image?.url) {
    card.append(el('div', { class: 'shop-header-resource__media' }, el('img', {
      src: imageUrl(image.url, 1200),
      srcset: imageSrcset(image.url, RESOURCE_WIDTHS),
      sizes,
      width: image.width,
      height: image.height,
      alt: '',
      loading: eager ? 'eager' : 'lazy',
    })));
  }
  const content = el('div', { class: 'shop-header-resource__content' }, el('p', { class: 'shop-header-resource__title' }, title));
  if (price) content.append(el('span', { class: 'shop-header-resource__price' }, price));
  card.append(content);
  return card;
}

function productCard(product, sizes) {
  return resourceCard({
    href: `/products/${product.handle}`,
    title: product.title,
    image: product.featuredImage,
    price: formatMoney(product.priceRange?.minVariantPrice),
    sizes,
  });
}

function cardList(className, cards) {
  return el('ul', { class: className }, ...cards.map((card) => el('li', {}, card)));
}

/* ---------- localization (country list) ---------- */

function countryForm(labelId) {
  const list = el('ul', { class: 'shop-header__countries', role: 'listbox', 'aria-labelledby': labelId });
  const form = el(
    'form',
    {
      class: 'shop-header__localization-form', method: 'post', action: '/localization', 'aria-label': 'Region und Sprache',
    },
    el('h2', { class: 'shop-visually-hidden', id: labelId }, 'Land/Region'),
    list,
  );
  form.addEventListener('submit', (e) => e.preventDefault());
  return { form, list };
}

function renderCountries(list, countries, current) {
  list.replaceChildren(...countries.map((country) => {
    const selected = country.isoCode === current;
    const symbol = country.currency?.symbol || '';
    return el(
      'li',
      {
        class: 'shop-header__country',
        role: 'option',
        tabindex: '0',
        'aria-label': country.name,
        'aria-current': selected ? 'true' : null,
        'aria-selected': String(selected),
        'data-iso-code': country.isoCode,
      },
      icon('check'),
      el('span', {}, country.name),
      el('span', { hidden: true }, ` ${country.currency?.isoCode || ''} ${symbol}`),
    );
  }));
}

/* ---------- cart drawer ---------- */

function quantityControl(line, onChange) {
  const input = el('input', {
    class: 'shop-header-cart__quantity-input',
    type: 'number',
    name: 'updates[]',
    value: String(line.quantity),
    min: '1',
    step: '1',
    'aria-label': 'Anzahl',
  });
  const minus = el(
    'button',
    {
      class: 'shop-header-cart__quantity-button shop-header-cart__quantity-button--minus',
      type: 'button',
      name: 'minus',
      disabled: line.quantity <= 1,
    },
    el('span', { class: 'shop-visually-hidden' }, 'Menge verringern'),
    icon('minus'),
  );
  const plus = el(
    'button',
    { class: 'shop-header-cart__quantity-button shop-header-cart__quantity-button--plus', type: 'button', name: 'plus' },
    el('span', { class: 'shop-visually-hidden' }, 'Menge erhöhen'),
    icon('plus'),
  );
  minus.addEventListener('click', () => onChange(line.quantity - 1));
  plus.addEventListener('click', () => onChange(line.quantity + 1));
  input.addEventListener('change', () => {
    const qty = Math.max(0, Math.floor(Number(input.value)) || 0);
    if (qty !== line.quantity) onChange(qty);
  });
  return el('div', { class: 'shop-header-cart__quantity' }, minus, input, plus);
}

function cartLine(line, onChange) {
  const variant = line.merchandise || {};
  const product = variant.product || {};
  const href = `/products/${product.handle}?variant=${variantNumber(variant.id)}`;
  const media = el('a', { class: 'shop-header-cart__line-media', href, tabindex: '-1' });
  if (variant.image?.url) {
    media.append(el('img', {
      src: imageUrl(variant.image.url, 250),
      alt: '',
      width: '250',
      height: '250',
      loading: 'lazy',
    }));
  }
  const details = el(
    'div',
    { class: 'shop-header-cart__line-details' },
    el('a', { class: 'shop-header-cart__line-title', href }, product.title || ''),
  );
  const options = (variant.selectedOptions || []).filter((o) => o.value !== 'Default Title');
  if (options.length) {
    details.append(el(
      'p',
      { class: 'shop-header-cart__line-options' },
      options.map((o) => `${o.name}: ${o.value}`).join(', '),
    ));
  }
  details.append(el(
    'p',
    { class: 'shop-header-cart__line-unit-price' },
    el('span', { class: 'shop-visually-hidden' }, 'Preis'),
    ' ',
    el('span', {}, formatMoney(line.cost?.amountPerQuantity)),
  ));
  const remove = el(
    'button',
    { class: 'shop-header-cart__remove', type: 'button', 'aria-label': `Entferne ${product.title || ''}` },
    icon('remove'),
    el('span', { class: 'shop-visually-hidden' }, 'Entfernen'),
  );
  remove.addEventListener('click', () => onChange(0));
  details.append(el('div', { class: 'shop-header-cart__line-quantity' }, quantityControl(line, onChange), remove));
  return el(
    'li',
    { class: 'shop-header-cart__line', 'data-line-id': line.id },
    media,
    details,
    el('span', { class: 'shop-header-cart__line-price' }, formatMoney(line.cost?.totalAmount)),
  );
}

/**
 * Builds the cart drawer portal and returns its render function.
 * @param {string} shopOrigin hosted shop origin (login link)
 */
function buildCartDrawer(shopOrigin) {
  const close = el('button', { class: 'shop-header-cart__close', type: 'button', 'aria-label': 'Schließen' }, icon('closeLarge'));
  const content = el('div', { class: 'shop-header-cart__content' });
  const drawer = el(
    'div',
    {
      class: 'shop-header-cart', id: 'shop-header-cart', role: 'dialog', 'aria-label': 'Warenkorb', hidden: true, 'data-state': 'empty',
    },
    el('div', { class: 'shop-header-cart__header' }, close),
    content,
  );

  let busy = false;
  const change = async (lineId, quantity) => {
    if (busy) return;
    busy = true;
    drawer.setAttribute('aria-busy', 'true');
    try {
      await updateLine(lineId, quantity);
    } catch (e) {
      await getCart(true);
    } finally {
      busy = false;
      drawer.removeAttribute('aria-busy');
    }
  };

  const render = (cart, country = 'DE') => {
    const lines = cart?.lines?.nodes || [];
    if (!cart || !cart.totalQuantity || !lines.length) {
      drawer.dataset.state = 'empty';
      const login = el('a', { href: `${shopOrigin}/customer_authentication/redirect?locale=de&region_country=${country}` }, 'Logge dich ein');
      content.replaceChildren(
        el('h2', { class: 'shop-header-cart__title' }, 'Dein Warenkorb ist leer'),
        el('p', {}, 'Hast du ein Konto? ', login, ', damit es beim Checkout schneller geht.'),
        el('a', { class: 'shop-button shop-button--primary', href: '/collections/all' }, 'Weiter einkaufen'),
      );
      return;
    }
    drawer.dataset.state = 'filled';
    const checkout = el('a', { class: 'shop-button shop-button--primary shop-header-cart__checkout', href: cart.checkoutUrl }, 'Auschecken');
    checkout.addEventListener('click', (e) => {
      e.preventDefault();
      goToCheckout();
    });
    content.replaceChildren(
      el(
        'div',
        { class: 'shop-header-cart__title-row' },
        el(
          'h2',
          { class: 'shop-header-cart__title' },
          'Cart',
          ' ',
          el(
            'span',
            { class: 'shop-header-cart__bubble' },
            el('span', { class: 'shop-header-cart__bubble-count', 'aria-hidden': 'true' }, String(cart.totalQuantity)),
            el('span', { class: 'shop-visually-hidden' }, `Gesamtzahl der Artikel im Warenkorb: ${cart.totalQuantity}`),
          ),
        ),
      ),
      el(
        'div',
        { class: 'shop-header-cart__items' },
        el('ul', { class: 'shop-header-cart__lines' }, ...lines.map((line) => cartLine(line, (qty) => change(line.id, qty)))),
      ),
      el(
        'div',
        { class: 'shop-header-cart__summary' },
        el(
          'div',
          { class: 'shop-header-cart__total' },
          el('span', { class: 'shop-header-cart__total-label' }, 'Geschätzter Gesamtbetrag'),
          el('span', { class: 'shop-header-cart__total-value' }, formatMoney(cart.cost?.totalAmount, true)),
        ),
        el('p', { class: 'shop-header-cart__tax-note' }, el('small', {}, 'Inkl. Zollgebühren und Steuern. Versand wird beim Checkout berechnet.')),
        checkout,
      ),
    );
  };

  return { drawer, close, render };
}

/* ---------- search modal ---------- */

function buildSearch() {
  const input = el('input', {
    class: 'shop-header-search__input',
    id: 'shop-header-search-input',
    type: 'search',
    name: 'q',
    placeholder: 'Suchen',
    autocomplete: 'off',
    'aria-controls': 'shop-header-search-results',
  });
  const close = el('button', { class: 'shop-header-search__close', type: 'button', 'aria-label': 'Schließen' }, icon('closeLarge'));
  const results = el('div', { class: 'shop-header-search__results', id: 'shop-header-search-results' });
  const status = el('div', { class: 'shop-visually-hidden', role: 'status', 'aria-live': 'polite' });
  const backdrop = el('div', { class: 'shop-header-search__backdrop' });
  const form = el(
    'form',
    {
      class: 'shop-header-search__form', action: '/search', method: 'get', role: 'search',
    },
    el(
      'div',
      { class: 'shop-header-search__bar' },
      el('label', { class: 'shop-visually-hidden', for: 'shop-header-search-input' }, 'Suchen'),
      input,
      icon('search'),
      close,
    ),
    results,
    status,
  );
  const modal = el(
    'div',
    {
      class: 'shop-header-search', id: 'shop-header-search', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Suche', hidden: true,
    },
    backdrop,
    el('div', { class: 'shop-header-search__panel' }, form),
  );

  const SIZES = '(min-width: 750px) 150px, 50vw';
  let defaults = [];
  let seq = 0;
  let timer;

  const section = (title, list) => [el('h4', { class: 'shop-header-search__title' }, title), list];

  const showDefaults = () => {
    status.textContent = '';
    results.replaceChildren(...(defaults.length
      ? section('Produkte', cardList('shop-header-search__list', defaults.map((p) => productCard(p, SIZES))))
      : []));
  };

  const showResults = (query, { products = [], collections = [], queries = [] }) => {
    const parts = [];
    if (queries.length) {
      parts.push(...section('Vorschläge', el(
        'ul',
        { class: 'shop-header-search__queries' },
        ...queries.map((q) => el('li', {}, el('a', { class: 'shop-header-search__query', href: `/search?q=${encodeURIComponent(q.text)}` }, q.text))),
      )));
    }
    if (products.length) {
      parts.push(...section('Produkte', cardList('shop-header-search__list', products.map((p) => productCard(p, SIZES)))));
    }
    if (collections.length) {
      parts.push(...section('Kollektionen', cardList(
        'shop-header-search__list shop-header-search__list--collections',
        collections.map((c) => resourceCard({
          href: `/collections/${c.handle}`, title: c.title, image: c.image, sizes: SIZES,
        })),
      )));
    }
    const count = products.length + collections.length;
    if (!parts.length) {
      parts.push(el('p', { class: 'shop-header-search__empty' }, `Keine Ergebnisse für „${query}“`));
    }
    status.textContent = `${count} Suchergebnisse für „${query}“ gefunden`;
    results.replaceChildren(...parts);
  };

  const search = async () => {
    const query = input.value.trim();
    seq += 1;
    const current = seq;
    if (!query) {
      showDefaults();
      return;
    }
    let found = {};
    try {
      const data = await storefront(PREDICTIVE_QUERY, { query });
      found = data.predictiveSearch || {};
    } catch (e) {
      found = {};
    }
    if (current === seq) showResults(query, found);
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(search, 200);
  });
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) e.preventDefault();
  });

  const setDefaults = (products) => {
    defaults = products;
    if (!input.value.trim()) showDefaults();
  };

  return {
    modal, input, close, backdrop, setDefaults, search,
  };
}

/* ---------- block ---------- */

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const path = sitePath();
  const isHome = path === '/';
  const isCartPage = path === '/cart';
  const [sections, shopOrigin] = await Promise.all([
    fetchFragment('nav', '/nav'),
    getShopOrigin(),
  ]);
  const menuSection = sections.find((s) => s.querySelector('ul'));
  const announceSection = sections.find((s) => s !== menuSection);
  block.textContent = '';

  /* announcement bar (portal before <header>) */
  const announceText = announceSection?.querySelector('p');
  const header = block.closest('header');
  if (announceText) {
    announceText.className = 'shop-header-announcement__text';
    const aside = el('aside', { class: 'shop-header-announcement', 'aria-label': 'Ankündigung' }, announceText);
    (header || block).before(aside);
  }

  /* brand + menu (authored nodes moved; the drawer mirrors the menu links) */
  const authoredMenu = menuSection?.querySelector('ul');
  const logo = [...(menuSection?.querySelectorAll('a') || [])].find((a) => !a.closest('ul'));
  if (logo) {
    logo.className = 'shop-header__logo';
    wrapChildren(logo);
  }

  const drawerList = el('ul');
  const menuLinks = [...(authoredMenu?.querySelectorAll(':scope > li > a') || [])];
  menuLinks.forEach((a) => {
    const current = sitePath(new URL(a.href, window.location).pathname) === path;
    const drawerLink = a.cloneNode(true);
    drawerLink.className = 'shop-header__drawer-link';
    wrapChildren(drawerLink);
    a.className = 'shop-header__link';
    wrapChildren(a, 'shop-header__link-title');
    if (current) {
      a.setAttribute('aria-current', 'page');
      drawerLink.setAttribute('aria-current', 'page');
    }
    drawerList.append(el('li', {}, drawerLink));
  });
  if (authoredMenu) authoredMenu.className = 'shop-header__menu';

  /* header row */
  const menuToggle = el(
    'button',
    {
      class: 'shop-header__menu-toggle', type: 'button', 'aria-label': 'Menü', 'aria-expanded': 'false', 'aria-controls': 'shop-header-drawer',
    },
    el('span', { class: 'shop-header__menu-icon shop-header__menu-icon--open' }, icon('menu')),
    el('span', { class: 'shop-header__menu-icon shop-header__menu-icon--close' }, icon('close')),
  );
  const searchButton = (variant) => el(
    'button',
    {
      class: `shop-header__action shop-header__action--search shop-header__action--search-${variant}`,
      type: 'button',
      'aria-label': 'Suchen',
      'aria-haspopup': 'dialog',
      'aria-controls': 'shop-header-search',
    },
    icon('search'),
  );
  const searchMobile = searchButton('mobile');
  const searchDesktop = searchButton('desktop');

  const currencyLabel = el('span');
  const currencyButton = el(
    'button',
    {
      class: 'shop-header__currency', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'shop-header-localization',
    },
    currencyLabel,
    ' ',
    el('span', { class: 'shop-visually-hidden' }, 'Region- und Sprachwahl'),
    icon('caret'),
  );
  currencyButton.querySelector('svg').classList.add('shop-header__caret');
  const dropdown = countryForm('shop-header-dropdown-country-label');
  const locPanel = el('div', { class: 'shop-header__localization-panel', id: 'shop-header-localization', hidden: true }, dropdown.form);
  const localization = el('div', { class: 'shop-header__localization' }, currencyButton, locPanel);

  const account = el('a', { class: 'shop-header__action shop-header__action--account', href: `${shopOrigin}/account`, 'aria-label': 'Konto' }, icon('account'));

  const cartCount = el('span', { class: 'shop-header__cart-count', hidden: true }, '0');
  cartCount.addEventListener('animationend', () => cartCount.removeAttribute('data-animating'));
  const cartAction = isCartPage
    ? el(
      'a',
      { class: 'shop-header__action shop-header__action--cart', href: '/cart', 'aria-label': 'Warenkorb' },
      el('span', { hidden: true }, 'Warenkorb'),
      ' ',
      icon('cart'),
      ' ',
      cartCount,
    )
    : el(
      'button',
      {
        class: 'shop-header__action shop-header__action--cart',
        type: 'button',
        'aria-label': 'Warenkorb',
        'aria-haspopup': 'dialog',
        'aria-expanded': 'false',
        'aria-controls': 'shop-header-cart',
      },
      icon('cart'),
      cartCount,
    );

  const nav = el('nav', { class: 'shop-header__nav', 'aria-label': 'Primär' }, authoredMenu || el('ul', { class: 'shop-header__menu' }));
  const row = el(
    'div',
    { class: 'shop-header__row' },
    menuToggle,
    searchMobile,
    logo || null,
    nav,
    localization,
    searchDesktop,
    account,
    cartAction,
  );

  /* menu drawer */
  const drawerCloses = [
    el('button', { class: 'shop-header__drawer-close', type: 'button', 'aria-label': 'Schließen' }, icon('close')),
    el('button', { class: 'shop-header__drawer-close', type: 'button', 'aria-label': 'Schließen' }, icon('close')),
  ];
  const drawerCurrencyLabel = el('span');
  const drawerCurrency = el(
    'button',
    {
      class: 'shop-header__drawer-currency', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'shop-header-drawer-localization',
    },
    drawerCurrencyLabel,
    icon('caret'),
  );
  const featured = el('ul', { class: 'shop-header__featured' });
  const back = el('button', { class: 'shop-header__drawer-back', type: 'button', 'aria-label': 'Zurück zum Hauptmenü' }, icon('caret'));
  const drawerCountries = countryForm('shop-header-drawer-country-label');
  const submenu = el(
    'div',
    { class: 'shop-header__drawer-submenu', id: 'shop-header-drawer-localization', hidden: true },
    el(
      'div',
      { class: 'shop-header__drawer-submenu-bar' },
      back,
      el('span', { class: 'shop-header__drawer-title' }, 'Region und Sprache'),
      drawerCloses[1],
    ),
    drawerCountries.form,
  );
  const drawer = el(
    'div',
    { class: 'shop-header__drawer', id: 'shop-header-drawer' },
    el(
      'div',
      { class: 'shop-header__drawer-main' },
      drawerCloses[0],
      el('nav', { class: 'shop-header__drawer-nav', 'aria-label': 'Primär' }, drawerList),
      el('div', { class: 'shop-header__drawer-utility' }, drawerCurrency),
      featured,
    ),
    submenu,
  );
  const backdrop = el('div', { class: 'shop-header__backdrop' });

  block.append(row, drawer, backdrop);

  /* portals after <footer> (body level) */
  const searchUi = buildSearch();
  const cartUi = buildCartDrawer(shopOrigin);
  const footer = document.querySelector('body > footer');
  if (footer) footer.after(searchUi.modal, cartUi.drawer);
  else document.body.append(searchUi.modal, cartUi.drawer);

  /* ---------- behaviour (ported from the prototype's inline script) ---------- */
  let returnFocus = null;
  const closeLocalization = () => {
    locPanel.hidden = true;
    currencyButton.setAttribute('aria-expanded', 'false');
  };
  const closeAll = () => {
    drawer.removeAttribute('data-open');
    submenu.hidden = true;
    drawerCurrency.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-expanded', 'false');
    searchUi.modal.hidden = true;
    cartUi.drawer.hidden = true;
    if (!isCartPage) cartAction.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('shop-drawer-open');
    delete block.dataset.overlay;
    if (returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  };
  const openCart = () => {
    if (isCartPage) return;
    closeAll();
    returnFocus = cartAction;
    cartUi.drawer.hidden = false;
    cartAction.setAttribute('aria-expanded', 'true');
    document.body.classList.add('shop-drawer-open');
    cartUi.close.focus();
  };

  menuToggle.addEventListener('click', () => {
    if (drawer.hasAttribute('data-open')) {
      closeAll();
      return;
    }
    closeAll();
    drawer.setAttribute('data-open', '');
    menuToggle.setAttribute('aria-expanded', 'true');
    block.dataset.overlay = 'menu';
  });
  [searchMobile, searchDesktop].forEach((button) => button.addEventListener('click', () => {
    closeAll();
    returnFocus = button;
    searchUi.modal.hidden = false;
    searchUi.input.focus();
  }));
  if (!isCartPage) cartAction.addEventListener('click', openCart);
  document.addEventListener('shop:open-cart', openCart);
  currencyButton.addEventListener('click', () => {
    const open = locPanel.hidden;
    locPanel.hidden = !open;
    currencyButton.setAttribute('aria-expanded', String(open));
  });
  drawerCurrency.addEventListener('click', () => {
    submenu.hidden = false;
    drawerCurrency.setAttribute('aria-expanded', 'true');
  });
  back.addEventListener('click', () => {
    submenu.hidden = true;
    drawerCurrency.setAttribute('aria-expanded', 'false');
    drawerCurrency.focus();
  });
  [...drawerCloses, backdrop, searchUi.close, searchUi.backdrop, cartUi.close]
    .forEach((node) => node.addEventListener('click', closeAll));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll();
    closeLocalization();
  });
  document.addEventListener('click', (e) => {
    if (!locPanel.hidden && !localization.contains(e.target)) closeLocalization();
  });

  /* ---------- Shopify runtime data ---------- */
  let countries = [];
  let currentCountry = '';

  const renderLocalization = () => {
    [dropdown.list, drawerCountries.list]
      .forEach((list) => renderCountries(list, countries, currentCountry));
    const currency = countries.find((c) => c.isoCode === currentCountry)?.currency?.isoCode || '';
    currencyLabel.textContent = currency;
    drawerCurrencyLabel.textContent = currency;
  };

  const selectCountry = async (isoCode) => {
    closeLocalization();
    submenu.hidden = true;
    if (!isoCode || isoCode === currentCountry) return;
    currentCountry = isoCode;
    renderLocalization();
    setCountry(isoCode);
    try {
      await setCartCountry(isoCode);
    } catch (e) {
      // the cart keeps its previous buyer country; prices re-query anyway
    }
  };
  [dropdown.list, drawerCountries.list].forEach((list) => {
    list.addEventListener('click', (e) => {
      const option = e.target.closest('.shop-header__country');
      if (option) selectCountry(option.dataset.isoCode);
    });
    list.addEventListener('keydown', (e) => {
      const option = e.target.closest('.shop-header__country');
      if (!option || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      selectCountry(option.dataset.isoCode);
    });
  });

  const loadChrome = async () => {
    try {
      const data = await storefront(CHROME_QUERY);
      const loc = data.localization || {};
      currentCountry = loc.country?.isoCode || currentCountry;
      countries = [...(loc.availableCountries || [])]
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
      renderLocalization();
      if (isHome && data.shop?.name && !block.querySelector(':scope > h1')) {
        block.prepend(el('h1', { class: 'shop-visually-hidden' }, data.shop.name));
      }
    } catch (e) {
      // no country list: the selector stays empty, the rest of the header works
    }
  };

  const loadProducts = async () => {
    const products = await loadFeaturedProducts();
    featured.replaceChildren(...products.map((p) => el('li', {}, productCard(p, '40vw'))));
    searchUi.setDefaults(products);
  };

  let lastCount = 0;
  const renderCart = (cart) => {
    const count = cart?.totalQuantity || 0;
    cartCount.textContent = String(count);
    cartCount.hidden = count === 0;
    if (count > lastCount) cartCount.setAttribute('data-animating', '');
    lastCount = count;
    cartUi.render(cart, currentCountry || 'DE');
  };
  document.addEventListener('shop:cart-updated', (e) => renderCart(e.detail?.cart));
  document.addEventListener('shop:country-changed', (e) => {
    if (e.detail?.isoCode && e.detail.isoCode !== currentCountry) {
      currentCountry = e.detail.isoCode;
      renderLocalization();
    }
    loadProducts();
    if (searchUi.input.value.trim()) searchUi.search();
  });

  await loadChrome();
  loadProducts();
  getCart().then((cart) => {
    lastCount = cart?.totalQuantity || 0;
    renderCart(cart);
  });
}
