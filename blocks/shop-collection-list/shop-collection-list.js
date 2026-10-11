import { storefront, imageUrl, imageSrcset } from '../../scripts/shopify/storefront.js';

const WIDTHS = [240, 352, 832, 1200, 1600, 1920, 2560, 3840];
// the theme's collection placeholder illustrations, used in rotation (index % 4)
const PLACEHOLDERS = ['apparel-1', 'apparel-2', 'apparel-3', 'apparel-4'];
const svgCache = {};

function codeBasePath() {
  return window.hlx?.codeBasePath || '';
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/**
 * Loads a committed placeholder SVG (code-owned file) as an inline element.
 * @param {string} name placeholder name
 * @returns {Promise<Element|null>} a fresh svg element
 */
async function placeholder(name) {
  if (!svgCache[name]) {
    svgCache[name] = fetch(`${codeBasePath()}/blocks/shop-collection-list/placeholder-${name}.svg`)
      .then((resp) => (resp.ok ? resp.text() : ''))
      .then((text) => new DOMParser().parseFromString(text, 'image/svg+xml').documentElement)
      .catch(() => null);
  }
  const root = await svgCache[name];
  if (!root || root.nodeName !== 'svg') return null;
  const node = document.importNode(root, true);
  node.setAttribute('class', 'shop-collection-list__placeholder');
  node.setAttribute('aria-hidden', 'true');
  return node;
}

async function renderTile(collection, index) {
  const li = el('li', 'shop-collection-list__item');
  const card = el('div', 'shop-collection-list__card');
  li.append(card);

  const link = el('a', 'shop-collection-list__link');
  link.href = `/collections/${collection.handle}`;
  const hidden = el('span', 'shop-visually-hidden');
  hidden.textContent = collection.title;
  link.append(hidden);

  const media = el('div', 'shop-collection-list__media');
  // the theme's collection.featured_image: the collection image, else the first product's
  const productImage = collection.products?.nodes?.[0]?.featuredImage;
  const image = collection.image || productImage;
  if (image?.url) {
    const img = el('img', 'shop-collection-list__image');
    img.src = imageUrl(image.url, WIDTHS[WIDTHS.length - 1]);
    img.srcset = imageSrcset(image.url, WIDTHS);
    img.sizes = '(min-width: 750px) 33vw, 100vw';
    if (image.width) img.width = image.width;
    if (image.height) img.height = image.height;
    const owner = collection.image ? collection : collection.products.nodes[0];
    img.alt = image.altText || owner.title;
    img.loading = index < 3 ? 'eager' : 'lazy';
    media.append(img);
  } else {
    const svg = await placeholder(PLACEHOLDERS[index % PLACEHOLDERS.length]);
    if (svg) media.append(svg);
  }

  const title = el('p', 'shop-collection-list__title');
  title.textContent = collection.title;
  card.append(link, media, title);
  return li;
}

/**
 * loads and decorates the block
 * Authored rows: heading.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const list = el('ul', 'shop-collection-list__list');
  // reserve the first row of square tiles while the API answers
  list.style.minHeight = 'calc((100vw - 2 * var(--shop-page-margin)) / 3)';
  if (heading) heading.className = 'shop-collection-list__heading';
  block.replaceChildren(...(heading ? [heading] : []), list);

  try {
    const data = await storefront(`query Collections($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      collections(first: 50, sortKey: TITLE) {
        nodes {
          handle
          title
          image { url altText width height }
          products(first: 1) { nodes { title featuredImage { url altText width height } } }
        }
      }
    }`);
    const collections = data.collections?.nodes || [];
    list.replaceChildren(...await Promise.all(collections.map(renderTile)));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('shop-collection-list: collections unavailable', e);
    list.replaceChildren();
  } finally {
    list.style.removeProperty('min-height');
  }
}
