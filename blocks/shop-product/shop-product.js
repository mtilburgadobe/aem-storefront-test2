import {
  storefront,
  formatMoney,
  imageUrl,
  imageSrcset,
} from '../../scripts/shopify/storefront.js';
import { addToCart, buyNow } from '../../scripts/shopify/cart.js';

/*
 * shop-product: product detail page. DOM contract: the comment at the top of shop-product.css.
 * Authored: `product | <handle>` (empty = last URL path segment). Everything else is Shopify data
 * read at runtime; the button/link labels are the theme's German UI strings (block constants).
 * The "You may also like" list is a separate shop-product-grid block in the next section.
 */

const LABELS = {
  skip: 'Zu Produktinformationen springen',
  sticky: 'Leiste „Schnell in den Warenkorb“',
  add: 'In den Warenkorb legen',
  soldOut: 'Ausverkauft',
  minus: 'Menge verringern',
  plus: 'Menge erhöhen',
  quantity: 'Anzahl',
  zoom: (n) => `Medien ${n} zoomen`,
  zoomDialog: 'Medien zoomen',
  close: 'Schließen',
  paypal: 'Mit PayPal zahlen',
  moreOptions: 'Weitere Bezahlmöglichkeiten',
  notFound: 'Produkt nicht gefunden',
  continue: 'Weiter einkaufen',
};

const GALLERY_WIDTHS = [240, 352, 640, 832, 1200, 1600, 1920, 2560, 3840];
const GALLERY_SIZES = '(min-width: 95rem) 65rem, (min-width: 750px) calc(100vw - 25rem - 40px - 24px - 40px), 100vw';

const CART_PLUS_ICON = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.608 9.421V6.906H3.392v8.016c0 .567.224 1.112.624 1.513.4.402.941.627 1.506.627H8.63M8.818 3h2.333c.618 0 1.212.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.344c0-.622.246-1.218.683-1.658A2.33 2.33 0 0 1 8.82 3"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M14.608 12.563v5m2.5-2.5h-5"/></svg>';
const BURST_LINES = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<g style="--index: ${i};"><line class="shop-product__burst-line" stroke-linecap="round" pathLength="1" x1="12" y1="8.5" x2="12" y2="15.5" stroke="currentColor"/></g>`).join('');
const BURST_ICON = `<svg class="shop-product__burst" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="shop-product__burst-check"><circle class="shop-product__burst-ring" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path class="shop-product__burst-tick" d="M9 12.75L11.25 15L15 9.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><g class="shop-product__burst-lines">${BURST_LINES}</g></svg>`;
const MINUS_ICON = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 7H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 2.75L7 11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const CLOSE_ICON = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1765 12.025C11.4108 12.2594 11.7907 12.2594 12.025 12.025C12.2594 11.7907 12.2594 11.4108 12.025 11.1765L8.84931 8.00078L12.025 4.82505C12.2594 4.59073 12.2594 4.21083 12.025 3.97652C11.7907 3.7422 11.4108 3.7422 11.1765 3.97652L8.00078 7.15225L4.82505 3.97652C4.59073 3.7422 4.21083 3.7422 3.97652 3.97652C3.7422 4.21083 3.7422 4.59073 3.97652 4.82505L7.15225 8.00078L3.97652 11.1765C3.7422 11.4108 3.7422 11.7907 3.97652 12.025C4.21083 12.2594 4.59073 12.2594 4.82505 12.025L8.00078 8.84931L11.1765 12.025Z" fill="currentColor"/></svg>';
const PAYPAL_LOGO = '<svg class="shop-product__paypal-logo" aria-hidden="true" viewBox="0 0 101 32" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg"><path fill="#003087" d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"/><path fill="#003087" d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.137 10.6 C 36.237 10.4 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z"/><path fill="#003087" d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z"/><path fill="#009cde" d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18 C 62.037 17.5 62.437 17.1 63.037 17.1 L 65.537 17.1 C 70.637 17.1 73.637 14.6 74.437 9.7 C 74.737 7.6 74.437 5.9 73.437 4.7 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.737 9.1 68.637 10.1 Z"/><path fill="#009cde" d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.637 10.6 C 91.637 10.4 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.737 15.3 85.937 16.2 85.737 17.2 Z"/><path fill="#009cde" d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"/></svg>';

const PRODUCT_QUERY = `query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
  shop { name }
  product(handle: $handle) {
    id title handle descriptionHtml availableForSale
    seo { title description }
    featuredImage { url altText width height }
    images(first: 50) { nodes { url altText width height } }
    options { name values }
    variants(first: 100) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url }
      }
    }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
  }
}`;

/* ---------- small DOM helpers ---------- */

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

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    if (key && value) config[key.textContent.trim().toLowerCase()] = value.textContent.trim();
  });
  return config;
}

function numericId(gid) {
  return (gid || '').split('/').pop();
}

/* ---------- description sanitiser (tag allow-list, no on* / javascript:) ---------- */

const ALLOWED_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'STRONG', 'B',
  'EM', 'I', 'U', 'S', 'SMALL', 'SUB', 'SUP', 'BR', 'HR', 'A', 'SPAN', 'BLOCKQUOTE', 'TABLE', 'THEAD',
  'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'IMG']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON',
  'SELECT', 'TEXTAREA', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'LINK', 'META', 'BASE', 'VIDEO', 'AUDIO']);
const ALLOWED_ATTRS = {
  A: ['href', 'title', 'target'],
  IMG: ['src', 'alt', 'width', 'height'],
  TD: ['colspan', 'rowspan'],
  TH: ['colspan', 'rowspan', 'scope'],
};

function safeUrl(value) {
  const url = (value || '').trim();
  if (!url) return null;
  if (/^(#|\/(?!\/)|\.)/.test(url)) return url;
  try {
    const { protocol } = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ? url : null;
  } catch (e) {
    return null;
  }
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
  if (node.nodeType !== Node.ELEMENT_NODE || DROP_TAGS.has(node.tagName)) return null;
  const children = [...node.childNodes].map(sanitizeNode).filter(Boolean);
  if (!ALLOWED_TAGS.has(node.tagName)) {
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    return fragment;
  }
  const clean = document.createElement(node.tagName.toLowerCase());
  (ALLOWED_ATTRS[node.tagName] || []).forEach((name) => {
    const value = node.getAttribute(name);
    if (value === null) return;
    if (name === 'href' || name === 'src') {
      const url = safeUrl(value);
      if (url) clean.setAttribute(name, url);
    } else {
      clean.setAttribute(name, value);
    }
  });
  if (clean.getAttribute('target') === '_blank') clean.setAttribute('rel', 'noopener noreferrer');
  if (clean.tagName === 'IMG') clean.setAttribute('loading', 'lazy');
  clean.append(...children);
  return clean;
}

function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const fragment = document.createDocumentFragment();
  fragment.append(...[...doc.body.childNodes].map(sanitizeNode).filter(Boolean));
  return fragment;
}

/* ---------- variant helpers ---------- */

function hasRealOptions(product) {
  const variants = product.variants.nodes;
  if (variants.length < 2) return false;
  return !(product.options.length === 1 && product.options[0].values.length === 1);
}

function initialVariant(product) {
  const variants = product.variants.nodes;
  const fromUrl = new URLSearchParams(window.location.search).get('variant');
  return variants.find((v) => fromUrl && numericId(v.id) === fromUrl)
    || variants.find((v) => v.availableForSale)
    || variants[0];
}

function findVariant(product, selection) {
  return product.variants.nodes.find((v) => v.selectedOptions
    .every((o) => selection[o.name] === o.value));
}

/* ---------- builders ---------- */

function galleryImage(image, product, index) {
  const img = el('img', {
    class: 'shop-product__image',
    src: imageUrl(image.url, 3840),
    srcset: imageSrcset(image.url, GALLERY_WIDTHS),
    sizes: GALLERY_SIZES,
    width: image.width,
    height: image.height,
    alt: image.altText || product.title,
  });
  if (index === 0) img.setAttribute('fetchpriority', 'high');
  else img.loading = 'lazy';
  return img;
}

function buildPrice(variant) {
  const price = el('div', { class: 'shop-product__price' });
  price.append(el('span', { class: 'shop-product__amount', text: formatMoney(variant.price) }));
  const compareAt = variant.compareAtPrice;
  if (compareAt && Number(compareAt.amount) > Number(variant.price.amount)) {
    price.append(el('s', { class: 'shop-product__compare-at', text: formatMoney(variant.compareAtPrice) }));
  }
  return price;
}

function buildAddButton(sticky) {
  const added = el('span', { class: 'shop-product__add-added', html: BURST_ICON });
  if (sticky) {
    const qty = el('span', { class: 'shop-product__add-qty', hidden: true });
    qty.append(' (', el('span', { class: 'shop-product__add-qty-number', text: '1' }), ')');
    const label = el('span', { class: 'shop-product__add-label' }, el('span', { text: LABELS.add }), qty);
    const text = el('span', { class: 'shop-product__add-text', html: CART_PLUS_ICON });
    text.append(label);
    return el('button', { class: 'shop-product__add shop-product__sticky-button', type: 'button' }, text, added);
  }
  const icon = el('span', { class: 'shop-product__add-icon', 'aria-hidden': 'true', html: CART_PLUS_ICON });
  return el('button', {
    class: 'shop-product__add shop-product__add--main', type: 'submit', name: 'add',
  }, icon, document.createTextNode(LABELS.add), added);
}

function buildVariantPicker(product, variant, onChange) {
  const picker = el('div', { class: 'shop-product__variant-picker' });
  product.options.forEach((option) => {
    const fieldset = el('fieldset', { class: 'shop-product__variant-option' }, el('legend', { class: 'shop-product__variant-legend', text: option.name }));
    const current = variant.selectedOptions.find((o) => o.name === option.name)?.value;
    option.values.forEach((value) => {
      const available = product.variants.nodes.some((v) => v.availableForSale
        && v.selectedOptions.some((o) => o.name === option.name && o.value === value));
      const input = el('input', {
        type: 'radio',
        name: `shop-product-option-${option.name}`,
        value,
        checked: value === current,
        'data-option-name': option.name,
        'data-option-available': String(available),
      });
      input.addEventListener('change', onChange);
      fieldset.append(el('label', { class: 'shop-product__variant-label' }, input, el('span', { class: 'shop-product__variant-text', text: value })));
    });
    picker.append(fieldset);
  });
  return picker;
}

function buildSkeleton() {
  const media = el('div', { class: 'shop-product__gallery-media', style: '--shop-product-media-ratio: 1' });
  return el('div', { class: 'shop-product__information' }, el(
    'div',
    { class: 'shop-product__grid' },
    el('div', { class: 'shop-product__media' }, el(
      'div',
      { class: 'shop-product__gallery' },
      el('ul', { class: 'shop-product__gallery-list' }, el('li', { class: 'shop-product__gallery-item' }, media)),
    )),
    el('div', { class: 'shop-product__details', id: 'shop-product-details' }, el('div', { class: 'shop-product__details-inner' })),
  ));
}

function buildNotFound() {
  return el('div', { class: 'shop-product__information' }, el(
    'div',
    { class: 'shop-product__details-inner' },
    el('h1', { class: 'shop-product__title shop-h3', text: LABELS.notFound }),
    el('p', {}, el('a', { href: '/collections/all', text: LABELS.continue })),
  ));
}

/* ---------- behaviours ---------- */

function flyToCart(block, source, variant) {
  const cart = document.querySelector('.shop-header__action--cart');
  if (!cart || !source) return Promise.resolve();
  const s = source.getBoundingClientRect();
  const d = cart.getBoundingClientRect();
  const chip = document.createElement('div');
  chip.className = `shop-product-fly${variant === 'sticky' ? ' shop-product-fly--sticky' : ''}`;
  const img = block.querySelector('.shop-product__sticky-image img');
  if (img) chip.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  const sx = s.left + s.width / 2;
  const sy = s.top + s.height / 2;
  chip.style.setProperty('--start-x', `${sx}px`);
  chip.style.setProperty('--start-y', `${sy}px`);
  chip.style.setProperty('--travel-x', `${d.left + d.width / 2 - sx}px`);
  chip.style.setProperty('--travel-y', `${d.top + d.height / 2 - sy}px`);
  if (variant === 'sticky') {
    chip.style.setProperty('--width', `${s.width}px`);
    chip.style.setProperty('--height', `${s.height}px`);
  }
  document.body.append(chip);
  return new Promise((resolve) => {
    const done = () => { chip.remove(); resolve(); };
    chip.addEventListener('animationend', (e) => { if (e.animationName === 'travel-scale') done(); });
    setTimeout(done, 1500); // reduced motion / no animation support
  });
}

function markAdded(button, done) {
  button.dataset.added = 'true';
  clearTimeout(button.addedTimer);
  done.then(() => {
    button.addedTimer = setTimeout(() => button.removeAttribute('data-added'), 800);
  });
}

function viewTransition(before, update, after) {
  if (!document.startViewTransition) {
    update();
    return;
  }
  const root = document.documentElement;
  root.style.viewTransitionName = 'none';
  before();
  const vt = document.startViewTransition(() => { before(true); update(); after(); });
  vt.finished.finally(() => { root.style.viewTransitionName = ''; after(true); });
}

function setupSticky(block, sticky, form) {
  let stuck = false;
  let hiddenByBottom = false;
  const show = () => { stuck = true; sticky.dataset.stuck = 'true'; };
  const hide = () => { stuck = false; sticky.dataset.stuck = 'false'; };
  const footer = document.querySelector('footer');
  if (!footer || !window.IntersectionObserver) return;
  new IntersectionObserver(([entry]) => {
    if (!entry) return;
    if (!entry.isIntersecting && !stuck) {
      const r = entry.target.getBoundingClientRect();
      if (r.bottom < 0 || r.top < 0) show();
    } else if (entry.isIntersecting && stuck) {
      hiddenByBottom = false;
      hide();
    }
  }).observe(form);
  new IntersectionObserver(([entry]) => {
    if (!entry) return;
    if (entry.isIntersecting && stuck) {
      hiddenByBottom = true;
      hide();
    } else if (!entry.isIntersecting && hiddenByBottom) {
      const r = form.getBoundingClientRect();
      if (r.bottom < 0 || r.top < 0) {
        hiddenByBottom = false;
        show();
      }
    }
  }, { rootMargin: '200px 0px 0px 0px' }).observe(footer);
}

function setupZoom(block) {
  const zoom = block.querySelector('.shop-product__zoom');
  const zoomImages = [...zoom.querySelectorAll('.shop-product__zoom-list img')];
  block.querySelectorAll('.shop-product__zoom-button').forEach((button, i) => {
    button.addEventListener('click', () => {
      const from = button.parentElement.querySelector('.shop-product__image');
      const to = zoomImages[i];
      viewTransition(
        (swap) => {
          from.style.viewTransitionName = swap ? '' : 'gallery-item-open';
          if (swap) to.style.viewTransitionName = 'gallery-item-open';
        },
        () => {
          zoom.showModal();
          if (i > 0) to.scrollIntoView({ block: 'start' });
        },
        (done) => { if (done) to.style.viewTransitionName = ''; },
      );
    });
  });
  zoom.querySelectorAll('.shop-product__zoom-thumbnail').forEach((thumb, i) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomImages[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  zoom.addEventListener('click', () => viewTransition(() => {}, () => zoom.close(), () => {}));
}

/* ---------- render ---------- */

function updateSeo(product, shop) {
  const title = product.seo?.title;
  if (title) document.title = shop?.name ? `${title} – ${shop.name}` : title;
  const description = product.seo?.description;
  if (description) {
    let meta = document.head.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    meta.content = description;
  }
}

function render(block, product) {
  const images = product.images?.nodes?.length ? product.images.nodes
    : [product.featuredImage].filter(Boolean);
  const first = images[0];
  const ratio = first?.width && first?.height ? first.width / first.height : 1;
  let variant = initialVariant(product);

  /* sticky quick-add bar */
  const stickyButton = buildAddButton(true);
  const stickyPrice = el('div', { class: 'shop-product__sticky-price' }, el('span', { class: 'shop-product__amount', text: formatMoney(variant.price) }));
  const sticky = el(
    'div',
    {
      class: 'shop-product__sticky', 'data-stuck': 'false', role: 'region', 'aria-label': LABELS.sticky,
    },
    el('div', { class: 'shop-product__sticky-image' }, first ? el('img', {
      src: imageUrl(first.url, 120), alt: first.altText || product.title, width: 120, height: 120, loading: 'lazy',
    }) : null),
    el('div', { class: 'shop-product__sticky-info' }, el('p', { class: 'shop-product__sticky-title', text: product.title })),
    stickyPrice,
    stickyButton,
  );

  /* gallery + zoom dialog */
  const galleryList = el('ul', { class: 'shop-product__gallery-list' });
  const zoomList = el('ul', { class: 'shop-product__zoom-list' });
  const thumbnails = el('div', { class: 'shop-product__zoom-thumbnails' });
  images.forEach((image, i) => {
    galleryList.append(el(
      'li',
      { class: 'shop-product__gallery-item' },
      el('button', {
        class: 'shop-product__zoom-button', type: 'button', 'aria-label': LABELS.zoom(i + 1), 'aria-haspopup': 'dialog', 'aria-controls': 'shop-product-zoom',
      }),
      el('div', { class: 'shop-product__gallery-media', style: `--shop-product-media-ratio: ${ratio}` }, galleryImage(image, product, i)),
    ));
    zoomList.append(el('li', {}, el('img', {
      src: imageUrl(image.url, 3840),
      srcset: imageSrcset(image.url, GALLERY_WIDTHS),
      sizes: '100vw',
      width: image.width,
      height: image.height,
      alt: image.altText || product.title,
      loading: 'lazy',
    })));
    if (images.length > 1) {
      thumbnails.append(el('button', { class: 'shop-product__zoom-thumbnail', type: 'button', 'aria-label': LABELS.zoom(i + 1) }, el('img', {
        src: imageUrl(image.url, 200), alt: '', width: image.width, height: image.height, loading: 'lazy',
      })));
    }
  });
  if (!images.length) {
    galleryList.append(el('li', { class: 'shop-product__gallery-item' }, el('div', { class: 'shop-product__gallery-media', style: '--shop-product-media-ratio: 1' })));
  }
  const zoom = el(
    'dialog',
    { class: 'shop-product__zoom', id: 'shop-product-zoom', 'aria-label': LABELS.zoomDialog },
    el('button', {
      class: 'shop-product__zoom-close', type: 'button', 'aria-label': LABELS.close, html: CLOSE_ICON,
    }),
    thumbnails,
    zoomList,
  );

  /* details */
  const viewLink = el('a', { href: `/products/${product.handle}?variant=${numericId(variant.id)}`, text: product.title });
  let price = buildPrice(variant);
  const heading = el(
    'div',
    { class: 'shop-product__heading' },
    el('h1', { class: 'shop-product__title shop-h3', text: product.title }),
    price,
  );

  const idInput = el('input', { type: 'hidden', name: 'id', value: numericId(variant.id) });
  const minus = el('button', {
    class: 'shop-product__quantity-button shop-product__quantity-button--minus', type: 'button', name: 'minus', disabled: true,
  }, el('span', { class: 'shop-visually-hidden', text: LABELS.minus }));
  minus.insertAdjacentHTML('beforeend', MINUS_ICON);
  const input = el('input', {
    class: 'shop-product__quantity-input', type: 'number', name: 'quantity', value: '1', min: '1', step: '1', 'aria-label': LABELS.quantity,
  });
  const plus = el('button', {
    class: 'shop-product__quantity-button shop-product__quantity-button--plus', type: 'button', name: 'plus',
  }, el('span', { class: 'shop-visually-hidden', text: LABELS.plus }));
  plus.insertAdjacentHTML('beforeend', PLUS_ICON);
  const mainButton = buildAddButton(false);
  const paypal = el('button', {
    class: 'shop-product__paypal', type: 'button', 'aria-label': LABELS.paypal,
  }, el('span', { 'aria-hidden': 'true', text: 'Mit' }));
  paypal.insertAdjacentHTML('beforeend', PAYPAL_LOGO);
  paypal.append(el('span', { 'aria-hidden': 'true', text: 'zahlen' }));
  const moreOptions = el('a', { class: 'shop-product__more-options', href: '#', text: LABELS.moreOptions });
  const express = el('div', { class: 'shop-product__express' }, paypal, moreOptions);

  const form = el(
    'form',
    { class: 'shop-product__form', method: 'post', action: '/cart/add' },
    idInput,
    el('div', { class: 'shop-product__buttons' }, el('div', { class: 'shop-product__quantity' }, minus, input, plus), mainButton, express),
  );

  const description = el('div', { class: 'shop-product__description' });
  description.append(sanitizeHtml(product.descriptionHtml));

  const detailsInner = el(
    'div',
    { class: 'shop-product__details-inner' },
    el('div', { class: 'shop-product__view-title' }, viewLink),
    heading,
    el('div', { class: 'shop-product__divider' }, el('span')),
  );

  /* availability: theme sold-out state (button disabled, label "Ausverkauft") */
  const setAvailability = () => {
    const available = Boolean(variant?.availableForSale);
    mainButton.disabled = !available;
    stickyButton.disabled = !available;
    mainButton.childNodes[1].textContent = available ? LABELS.add : LABELS.soldOut;
    stickyButton.querySelector('.shop-product__add-label').firstElementChild.textContent = available ? LABELS.add : LABELS.soldOut;
    express.hidden = !available;
  };

  if (hasRealOptions(product)) {
    const onChange = () => {
      const selection = {};
      form.querySelectorAll('.shop-product__variant-picker input:checked').forEach((radio) => {
        selection[radio.dataset.optionName] = radio.value;
      });
      const next = findVariant(product, selection);
      if (!next) {
        mainButton.disabled = true;
        stickyButton.disabled = true;
        return;
      }
      variant = next;
      idInput.value = numericId(variant.id);
      const nextPrice = buildPrice(variant);
      price.replaceWith(nextPrice);
      price = nextPrice;
      stickyPrice.firstElementChild.textContent = formatMoney(variant.price);
      viewLink.href = `/products/${product.handle}?variant=${numericId(variant.id)}`;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', numericId(variant.id));
      window.history.replaceState(null, '', url);
      setAvailability();
      const index = images.findIndex((image) => variant.image && image.url === variant.image.url);
      if (index > 0) galleryList.children[index]?.scrollIntoView({ block: 'nearest', inline: 'start' });
    };
    form.prepend(buildVariantPicker(product, variant, onChange));
    form.prepend(idInput);
  }
  detailsInner.append(form, description);

  const information = el(
    'div',
    { class: 'shop-product__information' },
    el(
      'div',
      { class: 'shop-product__grid' },
      el('div', { class: 'shop-product__media' }, el('div', { class: 'shop-product__gallery' }, galleryList), zoom),
      el('div', { class: 'shop-product__details', id: 'shop-product-details' }, detailsInner),
    ),
  );

  block.replaceChildren(
    sticky,
    el('a', { class: 'shop-product__skip shop-visually-hidden', href: '#shop-product-details', text: LABELS.skip }),
    information,
  );
  setAvailability();

  /* quantity stepper */
  const qty = sticky.querySelector('.shop-product__add-qty');
  const qtyNumber = sticky.querySelector('.shop-product__add-qty-number');
  const quantity = () => Math.max(1, parseInt(input.value, 10) || 1);
  const setQuantity = (value) => {
    const n = Math.max(1, parseInt(value, 10) || 1);
    input.value = n;
    minus.disabled = n <= 1;
    qtyNumber.textContent = n;
    qty.hidden = n <= 1;
  };
  minus.addEventListener('click', () => setQuantity(quantity() - 1));
  plus.addEventListener('click', () => setQuantity(quantity() + 1));
  input.addEventListener('blur', () => setQuantity(input.value));
  input.addEventListener('change', () => setQuantity(input.value));
  input.addEventListener('focus', () => input.select());

  /* add to cart (main + sticky): Storefront cartCreate / cartLinesAdd, then the added state.
     The header bubble updates from shop:cart-updated; the drawer stays closed (live). */
  let busy = false;
  const add = async (fromSticky) => {
    if (busy || !variant?.availableForSale) return;
    busy = true;
    try {
      await addToCart(variant.id, quantity());
      if (fromSticky) {
        markAdded(mainButton, Promise.resolve());
        markAdded(stickyButton, flyToCart(block, sticky.querySelector('.shop-product__sticky-image'), 'sticky'));
      } else {
        markAdded(mainButton, flyToCart(block, mainButton, 'main'));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('shop-product: add to cart failed', e);
    } finally {
      busy = false;
    }
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    add(false);
  });
  stickyButton.addEventListener('click', () => add(true));

  /* register R-02 / R-03: a fresh cart with this variant + quantity, then hosted checkout */
  const express2checkout = async (e) => {
    e.preventDefault();
    if (busy || !variant?.availableForSale) return;
    busy = true;
    try {
      await buyNow(variant.id, quantity());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('shop-product: checkout handoff failed', err);
    } finally {
      busy = false;
    }
  };
  paypal.addEventListener('click', express2checkout);
  moreOptions.addEventListener('click', express2checkout);

  setupSticky(block, sticky, form);
  setupZoom(block);
}

async function load(block, handle) {
  try {
    const { product, shop } = await storefront(PRODUCT_QUERY, { handle });
    if (!product || !product.variants?.nodes?.length) {
      block.replaceChildren(buildNotFound());
      return;
    }
    render(block, product);
    updateSeo(product, shop);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('shop-product: product could not be loaded', e);
    if (!block.querySelector('.shop-product__form')) block.replaceChildren(buildNotFound());
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  const handle = config.product
    || window.location.pathname.split('/').filter(Boolean).pop()
    || '';
  // reserve the gallery/details box while Shopify answers (no layout jump)
  block.replaceChildren(buildSkeleton());
  await load(block, handle);
  document.addEventListener('shop:country-changed', () => load(block, handle));
}
