import {
  buildBlock,
  decorateBlock,
  decorateTemplateAndTheme,
  getMetadata,
  loadBlock,
  loadCSS,
  loadSection,
  loadSections,
  waitForFirstImage,
} from '../aem.js';

function templates() {
  // case-insensitive: authoring tools may emit `Template` as well as `template`
  const meta = getMetadata('template')
    || document.head.querySelector('meta[name="template" i]')?.content
    || '';
  return meta.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}

/**
 * Shopify-backed pages are marked with page metadata `template: shopify`
 * (comma-separated with any further template classes, e.g. `shopify, shop-policy`).
 * @returns {boolean} true when the current page renders from Shopify
 */
export function isShopifyPage() {
  return templates().includes('shopify');
}

function codeBasePath() {
  return window.hlx?.codeBasePath || '';
}

async function loadChromeBlock(doc, tag, blockName) {
  let element = doc.querySelector(tag);
  if (!element) {
    // the delivery pipeline always renders header and footer; plain-html previews may not
    element = doc.createElement(tag);
    if (tag === 'header') doc.body.prepend(element);
    else doc.body.append(element);
  }
  const block = buildBlock(blockName, '');
  element.append(block);
  decorateBlock(block);
  return loadBlock(block);
}

/**
 * Eager phase for Shopify pages: page styles, main decoration, first section.
 * No Adobe Commerce configuration, initializer or drop-in is touched here.
 * @param {Document} doc the document
 * @param {Function} decorateMain the project's main decorator
 */
export async function loadShopifyEager(doc, decorateMain) {
  document.documentElement.lang = getMetadata('language') || 'de';
  decorateTemplateAndTheme();
  templates().forEach((t) => document.body.classList.add(t.replace(/[^a-z0-9-]+/g, '-')));

  const styles = [loadCSS(`${codeBasePath()}/styles/shopify.css`)];
  if (document.body.classList.contains('shop-policy')) {
    styles.push(loadCSS(`${codeBasePath()}/styles/shopify-policy.css`));
  }
  await Promise.all(styles);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
}

/**
 * Lazy phase for Shopify pages: header, remaining sections, footer.
 * @param {Document} doc the document
 */
export async function loadShopifyLazy(doc) {
  const headerLoaded = loadChromeBlock(doc, 'header', 'shop-header');

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  await loadChromeBlock(doc, 'footer', 'shop-footer');
  await headerLoaded;

  loadCSS(`${codeBasePath()}/styles/lazy-styles.css`);
}

/**
 * Delayed phase for Shopify pages. Analytics on the new host is an open owner
 * decision (stardust/dynamic-features.md #12), so nothing is loaded yet.
 */
export function loadShopifyDelayed() {
  // intentionally empty until the analytics decision is made
}
