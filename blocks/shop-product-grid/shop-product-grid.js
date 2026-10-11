import {
  storefront,
  formatMoney,
  imageUrl,
  imageSrcset,
  PRODUCT_CARD_FIELDS,
} from '../../scripts/shopify/storefront.js';
import { addToCart } from '../../scripts/shopify/cart.js';

const CONTEXT = '@inContext(country: $country, language: $language)';
const VARS = '$country: CountryCode, $language: LanguageCode';

// widths the theme's card srcset uses (live `image_tag` widths)
const CARD_WIDTHS = [240, 352, 640, 832, 1200, 1600, 1920, 2560, 3840];
const ADDED_MS = 2000;

const ICON_QUICK_ADD = '<svg class="shop-product-grid__quick-add-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.608 9.421V6.906H3.392v8.016c0 .567.224 1.112.624 1.513.4.402.941.627 1.506.627H8.63M8.818 3h2.333c.618 0 1.212.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.344c0-.622.246-1.218.683-1.658A2.33 2.33 0 0 1 8.82 3"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M14.608 12.563v5m2.5-2.5h-5"/></svg>';
const ICON_ADDED = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12.75L11.25 15L15 9.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><g>${
  [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => `<line stroke-linecap="round" pathLength="1" x1="12" y1="8.5" x2="12" y2="15.5" stroke="currentColor" transform="rotate(${deg} 12 12)"/>`).join('')
}</g></svg>`;

/**
 * Parses static, code-owned SVG markup (never Shopify or authored data).
 * @param {string} markup svg markup
 * @returns {Element} the svg element
 */
export function svg(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild;
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
  });
  return node;
}

/**
 * Reads the key/value rows of a block (first cell = key, lower-cased).
 * @param {Element} block the block
 * @returns {Object<string, {row: Element, cell: Element, value: string}>} config by key
 */
export function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    if (key) config[key] = { row, cell: cells[1], value: cells[1].textContent.trim() };
  });
  return config;
}

/**
 * @param {string} gid Shopify global id (gid://shopify/Product/123)
 * @returns {string} the numeric id
 */
export function numericId(gid) {
  return (gid || '').split('/').pop();
}

function productPath(handle) {
  return `/products/${handle}`;
}

async function quickAdd(button, variantId) {
  if (button.getAttribute('aria-busy') === 'true') return;
  button.setAttribute('aria-busy', 'true');
  try {
    await addToCart(variantId, 1);
    // live: the checkmark burst plays and the header bubble updates; the drawer stays closed
    button.dataset.added = '';
    setTimeout(() => { delete button.dataset.added; }, ADDED_MS);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('quick add failed', e);
  } finally {
    button.removeAttribute('aria-busy');
  }
}

/**
 * Renders one product card (the shop-product-grid DOM contract), shared by
 * shop-collection, shop-search and every product rail.
 * @param {Object} product Storefront product with PRODUCT_CARD_FIELDS
 * @param {Object} [options]
 * @param {boolean} [options.eager] first / LCP card: no lazy loading
 * @param {string} [options.sizes] img sizes attribute
 * @param {boolean} [options.withId] set data-product-id (collection / search grids)
 * @param {string} [options.quickAddLabel] quick-add button text
 * @returns {HTMLLIElement} li.shop-product-grid__item
 */
export function renderProductCard(product, options = {}) {
  const {
    eager = false,
    sizes = '(min-width: 750px) 25.0vw, 100vw',
    withId = false,
    quickAddLabel = 'Hinzufügen',
  } = options;
  const href = productPath(product.handle);
  const li = el('li', 'shop-product-grid__item', withId ? { 'data-product-id': numericId(product.id) } : {});
  const card = el('div', 'shop-product-grid__card');
  li.append(card);

  card.append(el('a', 'shop-product-grid__link', { href, 'aria-label': product.title }));

  const media = el('div', 'shop-product-grid__media');
  const mediaLink = el('a', '', { href, 'aria-label': product.title });
  const image = product.featuredImage;
  if (image?.url) {
    const img = el('img', 'shop-product-grid__image', {
      src: imageUrl(image.url, CARD_WIDTHS[CARD_WIDTHS.length - 1]),
      srcset: imageSrcset(image.url, CARD_WIDTHS),
      sizes,
      width: image.width,
      height: image.height,
      alt: image.altText || product.title,
      loading: eager ? 'eager' : 'lazy',
      fetchpriority: eager ? 'high' : undefined,
    });
    mediaLink.append(img);
  }
  media.append(mediaLink);

  const variant = product.variants?.nodes?.[0];
  const button = el('button', 'shop-product-grid__quick-add', { type: 'button' });
  const text = el('span', 'shop-product-grid__quick-add-text');
  text.textContent = quickAddLabel;
  const added = el('span', 'shop-product-grid__quick-add-added');
  added.append(svg(ICON_ADDED));
  button.append(svg(ICON_QUICK_ADD), text, added);
  if (!variant || !variant.availableForSale || !product.availableForSale) {
    button.disabled = true;
  } else {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      quickAdd(button, variant.id);
    });
  }
  media.append(button);
  card.append(media);

  const zoomTitle = el('h3', 'shop-product-grid__zoom-title');
  zoomTitle.textContent = product.title;
  card.append(zoomTitle);

  const titleLink = el('a', 'shop-product-grid__title-link', { href });
  const title = el('p', 'shop-product-grid__title', { role: 'heading' });
  title.textContent = product.title;
  titleLink.append(title);
  card.append(titleLink);

  const price = el('div', 'shop-product-grid__price');
  const amount = el('span', 'shop-product-grid__amount');
  const min = product.priceRange?.minVariantPrice;
  amount.textContent = formatMoney(min);
  price.append(amount);
  const compare = product.compareAtPriceRange?.minVariantPrice;
  if (compare && min && Number(compare.amount) > Number(min.amount)) {
    const s = el('s', 'shop-product-grid__compare-at');
    s.textContent = formatMoney(compare);
    price.append(s);
  }
  card.append(price);
  return li;
}

/**
 * Renders the product cards into a ul.shop-product-grid__list.
 * @param {Object[]} products Storefront products
 * @param {Object} [options] renderProductCard options; `eagerCount` cards load eagerly
 * @param {HTMLUListElement} [list] existing list to fill (its children are replaced)
 * @returns {HTMLUListElement} the list
 */
export function renderProductList(products, options = {}, list = el('ul', 'shop-product-grid__list')) {
  const { eagerCount = 0, ...cardOptions } = options;
  list.replaceChildren(...products.map((p, i) => renderProductCard(p, {
    ...cardOptions,
    eager: i < eagerCount,
  })));
  return list;
}

/**
 * Loading placeholders that reserve the grid space while the API answers.
 * @param {number} count number of cards
 * @param {HTMLUListElement} [list] list to fill
 * @returns {HTMLUListElement} the list
 */
export function renderProductListPlaceholder(count, list = el('ul', 'shop-product-grid__list')) {
  list.replaceChildren(...Array.from({ length: count }, () => {
    const li = el('li', 'shop-product-grid__item', { 'aria-hidden': 'true' });
    const card = el('div', 'shop-product-grid__card');
    const media = el('div', 'shop-product-grid__media');
    media.style.aspectRatio = '4 / 5';
    card.append(media);
    li.append(card);
    return li;
  }));
  return list;
}

/**
 * Products of a collection; `all` is the whole catalogue (alphabetical, as live).
 * @param {string} handle collection handle
 * @param {number} first number of products
 * @returns {Promise<Object[]>} products
 */
export async function fetchCollectionProducts(handle, first) {
  if (!handle || handle === 'all') {
    const data = await storefront(`query AllProducts($first: Int!, ${VARS}) ${CONTEXT} {
      products(first: $first, sortKey: TITLE) { nodes { ${PRODUCT_CARD_FIELDS} } }
    }`, { first });
    return data.products?.nodes || [];
  }
  const data = await storefront(`query CollectionProducts($handle: String!, $first: Int!, ${VARS}) ${CONTEXT} {
    collection(handle: $handle) { products(first: $first) { nodes { ${PRODUCT_CARD_FIELDS} } } }
  }`, { handle, first });
  return data.collection?.products?.nodes || [];
}

/**
 * "You may also like": Storefront productRecommendations for the product; when
 * Shopify has none (as today), the catalogue without the current product, which
 * is what live shows on the product page.
 * @param {string} handle product handle
 * @param {number} first number of products
 * @returns {Promise<Object[]>} products
 */
export async function fetchRecommendations(handle, first) {
  const data = await storefront(`query Recs($handle: String!, ${VARS}) ${CONTEXT} {
    product(handle: $handle) { id }
    productRecommendations(productHandle: $handle) { ${PRODUCT_CARD_FIELDS} }
  }`, { handle });
  const id = data.product?.id;
  let products = (data.productRecommendations || []).filter((p) => p.id !== id);
  if (!products.length) {
    products = (await fetchCollectionProducts('all', first + 1)).filter((p) => p.id !== id);
  }
  return products.slice(0, first);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const limit = Math.max(1, parseInt(config.limit?.value, 10) || 4);
  const source = (config.source?.value || '').toLowerCase();
  const handle = config.collection?.value || 'all';
  const productHandle = config.product?.value
    || window.location.pathname.split('/').filter(Boolean).pop();
  const quickAddLabel = config['quick-add']?.value;

  const header = el('div', 'shop-product-grid__header');
  if (heading) {
    heading.className = 'shop-product-grid__heading';
    header.append(heading);
  }
  const list = renderProductListPlaceholder(limit);
  // product-page rail: the theme's product-recommendations section spaces cards wider
  if (source === 'recommendations') block.classList.add('shop-product-grid--recommendations');
  block.replaceChildren(header, list);
  if (!heading) header.remove();

  try {
    const products = source === 'recommendations'
      ? await fetchRecommendations(productHandle, limit)
      : await fetchCollectionProducts(handle, limit);
    if (!products.length) {
      block.hidden = true;
      return;
    }
    renderProductList(products, { quickAddLabel }, list);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('shop-product-grid: products unavailable', e);
    list.replaceChildren();
    block.hidden = true;
  }
}
