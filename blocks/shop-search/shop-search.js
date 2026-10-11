import { loadCSS } from '../../scripts/aem.js';
import {
  readConfig,
  renderProductListPlaceholder,
  renderProductList,
  fetchCollectionProducts,
  svg,
} from '../shop-product-grid/shop-product-grid.js';

const DEFAULT_LIMIT = 24;
const CARD_SIZES = '(min-width: 1862px) 14vw, (min-width: 1596px) 16vw, (min-width: 1330px) 20vw, (min-width: 1064px) 25vw, (min-width: 798px) 33vw, (min-width: 750px) 50vw, 50vw';

/* theme UI strings (Horizon, de) */
const T = {
  search: 'Suchen',
  reset: 'Suche zurücksetzen',
  clear: 'Löschen',
  skip: 'Zur Ergebnisliste springen',
};

const ICON_SEARCH = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="4.75" stroke="currentColor" stroke-width="1.5"></circle><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m12.5 12.5 3.25 3.25"></path></svg>';
const ICON_RESET = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="6.25" stroke="currentColor" stroke-width="1.5"></circle><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m12.5 7.5-5 5M12.5 12.5l-5-5"></path></svg>';

function el(tag, className, attrs = {}, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children.filter(Boolean));
  return node;
}

/**
 * The inline content of a config cell (unwrapping a single authored paragraph).
 * @param {Element} cell value cell
 * @returns {Node[]} nodes to move
 */
function inlineNodes(cell) {
  const only = cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    && cell.textContent.trim() === cell.firstElementChild.textContent.trim();
  return [...(only ? cell.firstElementChild : cell).childNodes];
}

function codeBasePath() {
  return window.hlx?.codeBasePath || '';
}

/**
 * loads and decorates the block
 * Authored rows: heading "Suche" · `results-heading` | Suchergebnisse · `label` | Produkte.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const query = (new URLSearchParams(window.location.search).get('q') || '').trim();
  const action = window.location.pathname;
  const css = [loadCSS(`${codeBasePath()}/blocks/shop-product-grid/shop-product-grid.css`)];
  if (query) css.push(loadCSS(`${codeBasePath()}/blocks/shop-collection/shop-collection.css`));

  /* header: authored heading (with a query: the authored results heading text) */
  const header = el('div', 'shop-search__header');
  if (heading) {
    heading.className = 'shop-search__heading';
    const resultsText = config['results-heading']?.cell;
    if (query && resultsText?.textContent.trim()) {
      heading.replaceChildren(...inlineNodes(resultsText));
    }
    header.append(heading);
  }

  const input = el('input', 'shop-search__input', {
    id: 'shop-search-input',
    type: 'search',
    name: 'q',
    placeholder: T.search,
    autocomplete: 'off',
  });
  input.value = query;
  input.setAttribute('value', query);
  const reset = el(
    'a',
    'shop-search__reset',
    { href: `${action}?type=product&q=`, 'aria-label': T.reset },
    el('span', 'shop-search__reset-icon', {}, svg(ICON_RESET)),
    el('span', 'shop-visually-hidden', {}, T.clear),
  );
  const form = el(
    'form',
    'shop-search__form',
    { action, method: 'get', role: 'search' },
    el(
      'div',
      'shop-search__field',
      {},
      el('label', 'shop-visually-hidden', { for: 'shop-search-input' }, T.search),
      el('span', 'shop-search__icon', {}, svg(ICON_SEARCH)),
      el('input', '', { type: 'hidden', name: 'type', value: 'product' }),
      input,
      reset,
    ),
  );
  header.append(form);

  /* label row ("Produkte"): moved into the default-state heading */
  const labelCell = config.label?.cell;
  const resultsHeading = el('h4', 'shop-product-grid__heading');
  if (labelCell) resultsHeading.append(...inlineNodes(labelCell));

  if (!query) {
    block.dataset.state = 'default';
    const results = el(
      'div',
      'shop-search__results shop-product-grid',
      { id: 'shop-search-results' },
      el('a', 'shop-search__skip', { href: '#shop-search-results' }, T.skip),
      el('div', 'shop-product-grid__header', {}, resultsHeading),
    );
    const list = renderProductListPlaceholder(4);
    results.append(list);
    block.replaceChildren(header, results);
    await css[0];
    try {
      const limit = parseInt(config.limit?.value, 10) || DEFAULT_LIMIT;
      const products = await fetchCollectionProducts(config.collection?.value || 'all', limit);
      renderProductList(products, { sizes: CARD_SIZES, eagerCount: 2 }, list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('shop-search: products unavailable', e);
      list.replaceChildren();
    }
    return;
  }

  block.dataset.state = 'results';
  const view = el('div', 'shop-collection shop-collection--search');
  block.replaceChildren(header, view);
  const { createCollectionView } = await import('../shop-collection/shop-collection.js');
  await Promise.all([...css, createCollectionView(view, { type: 'search', query })]);
}
