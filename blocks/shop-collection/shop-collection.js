import { loadCSS } from '../../scripts/aem.js';
import {
  storefront,
  formatMoney,
  PRODUCT_CARD_FIELDS,
} from '../../scripts/shopify/storefront.js';
import {
  readConfig,
  renderProductList,
  renderProductListPlaceholder,
  svg,
} from '../shop-product-grid/shop-product-grid.js';

const CONTEXT = '@inContext(country: $country, language: $language)';
const VARS = '$country: CountryCode, $language: LanguageCode';
const PAGE_SIZE = 100;
const CARD_SIZES = '(min-width: 1862px) 14vw, (min-width: 1596px) 16vw, (min-width: 1330px) 20vw, (min-width: 1064px) 25vw, (min-width: 798px) 33vw, (min-width: 750px) 50vw, 50vw';

/* theme UI strings (Horizon, de) */
const T = {
  allTitle: 'Produkte',
  skip: 'Zur Ergebnisliste springen',
  activeFilters: 'Aktive Filter:',
  filterForm: 'Filter',
  sort: 'Sortieren',
  columns: 'Spaltenraster',
  columnDefault: 'Standard',
  columnZoom: 'Herauszoomen',
  columnSingle: 'Einzeln',
  filter: 'Filtern',
  close: 'Schließen',
  count: (n) => `${n} Artikel`,
  viewCount: (n) => `${n} Artikel ansehen`,
  priceLow: 'Niedriger Preis',
  priceHigh: 'Hoher Preis',
  priceTo: 'bis',
  priceMax: 'Der höchste Preis ist ',
  emptyTitle: 'Keine Produkte gefunden.',
  emptyBefore: 'Versuche, weniger Filter zu verwenden oder ',
  emptyLink: 'alle Filter zu löschen',
  emptyAfter: '.',
};

/* [value, label, sortKey, reverse] */
const COLLECTION_SORTS = [
  ['manual', 'Ausgewählt', 'MANUAL', false],
  ['most-relevant', 'Am relevantesten', 'RELEVANCE', false],
  ['best-selling', 'meistverkauft', 'BEST_SELLING', false],
  ['title-ascending', 'Alphabetisch, A-Z', 'TITLE', false],
  ['title-descending', 'Alphabetisch, Z-A', 'TITLE', true],
  ['price-ascending', 'Preis, niedrig nach hoch', 'PRICE', false],
  ['price-descending', 'Preis, hoch nach niedrig', 'PRICE', true],
  ['created-ascending', 'Datum, alt zu neu', 'CREATED', false],
  ['created-descending', 'Datum, neu zu alt', 'CREATED', true],
];
const SEARCH_SORTS = [
  ['relevance', 'Relevanz', 'RELEVANCE', false],
  ['price-ascending', 'Preis (aufsteigend)', 'PRICE', false],
  ['price-descending', 'Preis (absteigend)', 'PRICE', true],
];
// ProductCollectionSortKeys -> ProductSortKeys (catalogue "all" uses the root products query)
const PRODUCT_SORT_KEYS = { MANUAL: 'ID', CREATED: 'CREATED_AT' };

const ICONS = {
  caret: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5.5L7 9.5L3 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  check: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="shop-collection__check"><path d="M4.75439 10.7485L7.68601 14.5888C7.79288 14.7288 7.84632 14.7988 7.91174 14.8242C7.96907 14.8466 8.03262 14.8469 8.09022 14.8253C8.15596 14.8007 8.21026 14.7314 8.31886 14.5927L15.2475 5.74658" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  gridDefault: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.324 3.5H14.176C14.434 3.5 14.67 3.5 14.868 3.516C15.081 3.534 15.314 3.573 15.544 3.691C15.874 3.859 16.142 4.126 16.309 4.456C16.427 4.686 16.466 4.919 16.484 5.132C16.5 5.33 16.5 5.566 16.5 5.824V6.676C16.5 6.934 16.5 7.17 16.484 7.368C16.471 7.6027 16.4115 7.83248 16.309 8.044C16.1412 8.3734 15.8734 8.6412 15.544 8.809C15.3325 8.91164 15.1027 8.97113 14.868 8.984C14.67 9 14.434 9 14.176 9H13.324C13.066 9 12.83 9 12.632 8.984C12.3973 8.97103 12.1675 8.91154 11.956 8.809C11.6266 8.6412 11.3588 8.3734 11.191 8.044C11.0885 7.83248 11.029 7.6027 11.016 7.368C11 7.17 11 6.934 11 6.676V5.824C11 5.566 11 5.33 11.016 5.132C11.0289 4.89728 11.0884 4.66748 11.191 4.456C11.3585 4.12675 11.626 3.85897 11.955 3.691C12.185 3.573 12.419 3.534 12.632 3.516C12.83 3.5 13.066 3.5 13.324 3.5ZM12.633 5.029C12.6726 5.01906 12.7132 5.01304 12.754 5.011C12.884 5.001 13.058 5 13.35 5H14.15C14.442 5 14.617 5 14.746 5.011C14.7865 5.0131 14.8267 5.01913 14.866 5.029C14.9107 5.05229 14.9473 5.08854 14.971 5.133C14.9809 5.17266 14.9869 5.21318 14.989 5.254C14.999 5.384 15 5.558 15 5.85V6.65C15 6.942 15 7.117 14.989 7.246C14.9868 7.28648 14.9808 7.32666 14.971 7.366C14.9477 7.41068 14.9115 7.44728 14.867 7.471C14.8274 7.48094 14.7868 7.48696 14.746 7.489C14.616 7.499 14.442 7.5 14.15 7.5H13.35C13.058 7.5 12.883 7.5 12.754 7.489C12.7135 7.4869 12.6733 7.48087 12.634 7.471C12.5893 7.44771 12.5527 7.41146 12.529 7.367C12.5191 7.32734 12.5131 7.28682 12.511 7.246C12.5003 7.04753 12.4966 6.84873 12.5 6.65V5.85C12.5 5.558 12.5 5.383 12.511 5.254C12.5132 5.21352 12.5192 5.17334 12.529 5.134C12.5523 5.08932 12.5885 5.05272 12.633 5.029Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.824 3.5H6.676C6.934 3.5 7.17 3.5 7.368 3.516C7.581 3.534 7.814 3.573 8.044 3.691C8.374 3.859 8.642 4.126 8.809 4.456C8.927 4.686 8.966 4.919 8.984 5.132C9 5.33 9 5.566 9 5.824V6.676C9 6.934 9 7.17 8.984 7.368C8.971 7.6027 8.91152 7.83248 8.809 8.044C8.6412 8.3734 8.3734 8.6412 8.044 8.809C7.83252 8.91164 7.60272 8.97113 7.368 8.984C7.17 9 6.934 9 6.676 9H5.824C5.566 9 5.33 9 5.132 8.984C4.8973 8.97103 4.66751 8.91154 4.456 8.809C4.1266 8.6412 3.8588 8.3734 3.691 8.044C3.58848 7.83248 3.529 7.6027 3.516 7.368C3.5 7.17 3.5 6.934 3.5 6.676V5.824C3.5 5.566 3.5 5.33 3.516 5.132C3.52887 4.89728 3.58836 4.66748 3.691 4.456C3.85854 4.12675 4.12597 3.85897 4.455 3.691C4.685 3.573 4.919 3.534 5.132 3.516C5.33 3.5 5.566 3.5 5.824 3.5ZM5.133 5.029C5.17265 5.01906 5.21318 5.01304 5.254 5.011C5.384 5.001 5.558 5 5.85 5H6.65C6.942 5 7.117 5 7.246 5.011C7.28649 5.0131 7.32668 5.01913 7.366 5.029C7.41068 5.05229 7.44728 5.08854 7.471 5.133C7.48086 5.17266 7.48689 5.21318 7.489 5.254C7.499 5.384 7.5 5.558 7.5 5.85V6.65C7.5 6.942 7.5 7.117 7.489 7.246C7.48683 7.28648 7.4808 7.32666 7.471 7.366C7.44771 7.41068 7.41146 7.44728 7.367 7.471C7.32735 7.48094 7.28682 7.48696 7.246 7.489C7.116 7.499 6.942 7.5 6.65 7.5H5.85C5.558 7.5 5.383 7.5 5.254 7.489C5.21351 7.4869 5.17332 7.48087 5.134 7.471C5.08932 7.44771 5.05272 7.41146 5.029 7.367C5.01914 7.32734 5.01311 7.28682 5.011 7.246C5.00026 7.04753 4.99659 6.84873 5 6.65V5.85C5 5.558 5 5.383 5.011 5.254C5.01317 5.21352 5.0192 5.17334 5.029 5.134C5.05229 5.08932 5.08854 5.05272 5.133 5.029Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.324 11H14.176C14.434 11 14.67 11 14.868 11.016C15.081 11.034 15.314 11.073 15.544 11.191C15.874 11.359 16.142 11.626 16.309 11.956C16.427 12.186 16.466 12.419 16.484 12.632C16.5 12.83 16.5 13.066 16.5 13.324V14.176C16.5 14.434 16.5 14.67 16.484 14.868C16.471 15.1027 16.4115 15.3325 16.309 15.544C16.1412 15.8734 15.8734 16.1412 15.544 16.309C15.3325 16.4116 15.1027 16.4711 14.868 16.484C14.67 16.5 14.434 16.5 14.176 16.5H13.324C13.066 16.5 12.83 16.5 12.632 16.484C12.3973 16.471 12.1675 16.4115 11.956 16.309C11.6266 16.1412 11.3588 15.8734 11.191 15.544C11.0885 15.3325 11.029 15.1027 11.016 14.868C11 14.67 11 14.434 11 14.176V13.324C11 13.066 11 12.83 11.016 12.632C11.0289 12.3973 11.0884 12.1675 11.191 11.956C11.3585 11.6268 11.626 11.359 11.955 11.191C12.185 11.073 12.419 11.034 12.632 11.016C12.83 11 13.066 11 13.324 11ZM12.633 12.529C12.6726 12.5191 12.7132 12.513 12.754 12.511C12.884 12.501 13.058 12.5 13.35 12.5H14.15C14.442 12.5 14.617 12.5 14.746 12.511C14.7865 12.5131 14.8267 12.5191 14.866 12.529C14.9107 12.5523 14.9473 12.5885 14.971 12.633C14.9809 12.6727 14.9869 12.7132 14.989 12.754C14.999 12.884 15 13.058 15 13.35V14.15C15 14.442 15 14.617 14.989 14.746C14.9868 14.7865 14.9808 14.8267 14.971 14.866C14.9477 14.9107 14.9115 14.9473 14.867 14.971C14.8274 14.9809 14.7868 14.987 14.746 14.989C14.616 14.999 14.442 15 14.15 15H13.35C13.058 15 12.883 15 12.754 14.989C12.7135 14.9869 12.6733 14.9809 12.634 14.971C12.5893 14.9477 12.5527 14.9115 12.529 14.867C12.5191 14.8273 12.5131 14.7868 12.511 14.746C12.5003 14.5475 12.4966 14.3487 12.5 14.15V13.35C12.5 13.058 12.5 12.883 12.511 12.754C12.5132 12.7135 12.5192 12.6733 12.529 12.634C12.5523 12.5893 12.5885 12.5527 12.633 12.529Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.676 16.5H5.824C5.566 16.5 5.33 16.5 5.132 16.484C4.8973 16.471 4.66752 16.4115 4.456 16.309C4.1266 16.1412 3.8588 15.8734 3.691 15.544C3.58846 15.3325 3.52897 15.1027 3.516 14.868C3.5 14.67 3.5 14.434 3.5 14.176V13.324C3.5 13.066 3.5 12.83 3.516 12.632C3.52887 12.3973 3.58836 12.1675 3.691 11.956C3.8588 11.6266 4.1266 11.3588 4.456 11.191C4.686 11.073 4.919 11.033 5.132 11.016C5.33 11 5.566 11 5.824 11H6.676C6.934 11 7.17 11 7.368 11.016C7.581 11.034 7.814 11.073 8.044 11.191C8.374 11.358 8.641 11.626 8.809 11.955C8.927 12.185 8.966 12.419 8.984 12.632C9 12.83 9 13.066 9 13.324V14.176C9 14.434 9 14.67 8.984 14.868C8.97103 15.1027 8.91154 15.3325 8.809 15.544C8.6412 15.8734 8.3734 16.1412 8.044 16.309C7.83252 16.4116 7.60272 16.4711 7.368 16.484C7.17 16.5 6.934 16.5 6.676 16.5ZM7.367 14.971C7.32734 14.9809 7.28682 14.9869 7.246 14.989C7.116 14.999 6.942 15 6.65 15H5.85C5.558 15 5.383 15 5.254 14.989C5.21352 14.9868 5.17334 14.9808 5.134 14.971C5.08932 14.9477 5.05272 14.9115 5.029 14.867C5.01906 14.8274 5.01304 14.7868 5.011 14.746C5.00023 14.5475 4.99656 14.3487 5 14.15V13.35C5 13.058 5 12.883 5.011 12.754C5.0131 12.7135 5.01913 12.6733 5.029 12.634C5.05229 12.5893 5.08854 12.5527 5.133 12.529C5.17266 12.5191 5.21318 12.5131 5.254 12.511C5.384 12.501 5.558 12.5 5.85 12.5H6.65C6.942 12.5 7.117 12.5 7.246 12.511C7.28648 12.5132 7.32666 12.5192 7.366 12.529C7.41068 12.5523 7.44728 12.5885 7.471 12.633C7.48094 12.6726 7.48696 12.7132 7.489 12.754C7.499 12.884 7.5 13.058 7.5 13.35V14.15C7.5 14.442 7.5 14.617 7.489 14.746C7.4869 14.7865 7.48087 14.8267 7.471 14.866C7.44771 14.9107 7.41146 14.9473 7.367 14.971Z" fill="currentColor"></path></svg>',
  gridZoom: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6C15.2652 6 15.5196 5.89464 15.7071 5.70711C15.8946 5.51957 16 5.26522 16 5C16 4.73478 15.8946 4.48043 15.7071 4.29289C15.5196 4.10536 15.2652 4 15 4C14.7348 4 14.4804 4.10536 14.2929 4.29289C14.1054 4.48043 14 4.73478 14 5C14 5.26522 14.1054 5.51957 14.2929 5.70711C14.4804 5.89464 14.7348 6 15 6Z" fill="currentColor"></path><path d="M5 6C5.26522 6 5.51957 5.89464 5.70711 5.70711C5.89464 5.51957 6 5.26522 6 5C6 4.73478 5.89464 4.48043 5.70711 4.29289C5.51957 4.10536 5.26522 4 5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5C4 5.26522 4.10536 5.51957 4.29289 5.70711C4.48043 5.89464 4.73478 6 5 6Z" fill="currentColor"></path><path d="M5 11C5.26522 11 5.51957 10.8946 5.70711 10.7071C5.89464 10.5196 6 10.2652 6 10C6 9.73478 5.89464 9.48043 5.70711 9.29289C5.51957 9.10536 5.26522 9 5 9C4.73478 9 4.48043 9.10536 4.29289 9.29289C4.10536 9.48043 4 9.73478 4 10C4 10.2652 4.10536 10.5196 4.29289 10.7071C4.48043 10.8946 4.73478 11 5 11Z" fill="currentColor"></path><path d="M5 16C5.26522 16 5.51957 15.8946 5.70711 15.7071C5.89464 15.5196 6 15.2652 6 15C6 14.7348 5.89464 14.4804 5.70711 14.2929C5.51957 14.1054 5.26522 14 5 14C4.73478 14 4.48043 14.1054 4.29289 14.2929C4.10536 14.4804 4 14.7348 4 15C4 15.2652 4.10536 15.5196 4.29289 15.7071C4.48043 15.8946 4.73478 16 5 16Z" fill="currentColor"></path><path d="M10 6C10.2652 6 10.5196 5.89464 10.7071 5.70711C10.8946 5.51957 11 5.26522 11 5C11 4.73478 10.8946 4.48043 10.7071 4.29289C10.5196 4.10536 10.2652 4 10 4C9.73478 4 9.48043 4.10536 9.29289 4.29289C9.10536 4.48043 9 4.73478 9 5C9 5.26522 9.10536 5.51957 9.29289 5.70711C9.48043 5.89464 9.73478 6 10 6Z" fill="currentColor"></path><path d="M10 11C10.2652 11 10.5196 10.8946 10.7071 10.7071C10.8946 10.5196 11 10.2652 11 10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9C9.73478 9 9.48043 9.10536 9.29289 9.29289C9.10536 9.48043 9 9.73478 9 10C9 10.2652 9.10536 10.5196 9.29289 10.7071C9.48043 10.8946 9.73478 11 10 11Z" fill="currentColor"></path><path d="M10 16C10.2652 16 10.5196 15.8946 10.7071 15.7071C10.8946 15.5196 11 15.2652 11 15C11 14.7348 10.8946 14.4804 10.7071 14.2929C10.5196 14.1054 10.2652 14 10 14C9.73478 14 9.48043 14.1054 9.29289 14.2929C9.10536 14.4804 9 14.7348 9 15C9 15.2652 9.10536 15.5196 9.29289 15.7071C9.48043 15.8946 9.73478 16 10 16Z" fill="currentColor"></path><path d="M15 11C15.2652 11 15.5196 10.8946 15.7071 10.7071C15.8946 10.5196 16 10.2652 16 10C16 9.73478 15.8946 9.48043 15.7071 9.29289C15.5196 9.10536 15.2652 9 15 9C14.7348 9 14.4804 9.10536 14.2929 9.29289C14.1054 9.48043 14 9.73478 14 10C14 10.2652 14.1054 10.5196 14.2929 10.7071C14.4804 10.8946 14.7348 11 15 11Z" fill="currentColor"></path><path d="M16 15C16 15.2652 15.8946 15.5196 15.7071 15.7071C15.5196 15.8946 15.2652 16 15 16C14.7348 16 14.4804 15.8946 14.2929 15.7071C14.1054 15.5196 14 15.2652 14 15C14 14.7348 14.1054 14.4804 14.2929 14.2929C14.4804 14.1054 14.7348 14 15 14C15.2652 14 15.5196 14.1054 15.7071 14.2929C15.8946 14.4804 16 14.7348 16 15Z" fill="currentColor"></path></svg>',
  filter: '<svg aria-hidden="true" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.823 6h-12m10 4h-8m2 4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  single: '<svg aria-hidden="true" width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.75" y="4.25" width="10" height="12" rx="2.25" stroke="currentColor" stroke-width="1.5"></rect></svg>',
  close: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1765 12.025C11.4108 12.2594 11.7907 12.2594 12.025 12.025C12.2594 11.7907 12.2594 11.4108 12.025 11.1765L8.84931 8.00078L12.025 4.82505C12.2594 4.59073 12.2594 4.21083 12.025 3.97652C11.7907 3.7422 11.4108 3.7422 11.1765 3.97652L8.00078 7.15225L4.82505 3.97652C4.59073 3.7422 4.21083 3.7422 3.97652 3.97652C3.7422 4.21083 3.7422 4.59073 3.97652 4.82505L7.15225 8.00078L3.97652 11.1765C3.7422 11.4108 3.7422 11.7907 3.97652 12.025C4.21083 12.2594 4.59073 12.2594 4.82505 12.025L8.00078 8.84931L11.1765 12.025Z" fill="currentColor"></path></svg>',
  select: '<svg aria-hidden="true" focusable="false" width="8" height="13" viewBox="0 0 8 13"><g opacity="0.6"><path d="M4.93509 1.08583C4.44566 0.596391 3.65213 0.596391 3.16269 1.08583L0.509308 3.73921C0.215647 4.03287 0.215647 4.50899 0.509308 4.80265C0.802969 5.09631 1.27909 5.09631 1.57275 4.80265L4.04889 2.32651L6.52504 4.80265C6.8187 5.09631 7.29482 5.09631 7.58848 4.80265C7.88214 4.50899 7.88214 4.03287 7.58848 3.73921L4.93509 1.08583Z" fill="#333030"></path><path d="M7.58848 9.81591L4.93509 12.4693C4.44566 12.9587 3.65213 12.9587 3.16269 12.4693L0.509308 9.81591C0.215647 9.52225 0.215647 9.04613 0.509308 8.75247C0.802969 8.45881 1.27909 8.45881 1.57275 8.75247L4.04889 11.2286L6.52504 8.75247C6.8187 8.45881 7.29482 8.45881 7.58848 8.75247C7.88214 9.04613 7.88214 9.52225 7.58848 9.81591Z" fill="#333030"></path></g></svg>',
};

function el(tag, className, attrs = {}, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

/* ---------- sanitised Shopify HTML (descriptionHtml) ---------- */

const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'A', 'UL', 'OL', 'LI',
  'SPAN', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']);

function cleanNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const children = [...node.childNodes].map((c) => cleanNode(c, doc)).filter(Boolean);
  if (!ALLOWED_TAGS.has(node.tagName)) {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE'].includes(node.tagName)) return null;
    const frag = doc.createDocumentFragment();
    frag.append(...children);
    return frag;
  }
  const out = doc.createElement(node.tagName.toLowerCase());
  if (node.tagName === 'A') {
    const href = (node.getAttribute('href') || '').trim();
    if (href && !/^\s*(javascript|data|vbscript):/i.test(href)) out.setAttribute('href', href);
  }
  out.append(...children);
  return out;
}

/**
 * Parses Shopify HTML into a fragment restricted to a tag allow-list, with no
 * attributes besides safe link hrefs (no on* handlers, no javascript: URLs).
 * @param {string} html Shopify HTML
 * @returns {DocumentFragment} sanitised fragment
 */
export function sanitizeHtml(html) {
  const parsed = new DOMParser().parseFromString(html || '', 'text/html');
  const frag = document.createDocumentFragment();
  [...parsed.body.childNodes].forEach((c) => {
    const clean = cleanNode(c, document);
    if (clean) frag.append(clean);
  });
  return frag;
}

/* ---------- URL state ---------- */

function parseNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = Number(String(value).trim().replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Converts a theme filter param (`filter.v.availability=1`) to a Storefront ProductFilter.
 * @returns {Object|null} ProductFilter
 */
function paramToFilter(name, value) {
  if (name === 'filter.v.availability') return { available: value === '1' };
  if (name === 'filter.p.product_type') return { productType: value };
  if (name === 'filter.p.vendor') return { productVendor: value };
  if (name === 'filter.p.tag') return { tag: value };
  let m = name.match(/^filter\.v\.option\.(.+)$/);
  if (m) return { variantOption: { name: m[1], value } };
  m = name.match(/^filter\.([pv])\.m\.([^.]+)\.(.+)$/);
  if (m) {
    const key = m[1] === 'p' ? 'productMetafield' : 'variantMetafield';
    return { [key]: { namespace: m[2], key: m[3], value } };
  }
  return null;
}

function readUrlState(sorts, defaultSort) {
  const params = new URLSearchParams(window.location.search);
  const values = [];
  params.forEach((value, name) => {
    if (name.startsWith('filter.') && !name.startsWith('filter.v.price.')) values.push([name, value]);
  });
  const sort = params.get('sort_by');
  return {
    values,
    gte: params.get('filter.v.price.gte') || '',
    lte: params.get('filter.v.price.lte') || '',
    sort: sorts.some(([v]) => v === sort) ? sort : defaultSort,
    explicitSort: sorts.some(([v]) => v === sort),
  };
}

function writeUrlState(state, defaultSort) {
  const params = new URLSearchParams(window.location.search);
  [...params.keys()].filter((k) => k.startsWith('filter.') || k === 'sort_by')
    .forEach((k) => params.delete(k));
  state.values.forEach(([name, value]) => params.append(name, value));
  if (state.gte) params.set('filter.v.price.gte', state.gte);
  if (state.lte) params.set('filter.v.price.lte', state.lte);
  if (state.sort !== defaultSort || state.explicitSort) params.set('sort_by', state.sort);
  const qs = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
}

function toProductFilters(state) {
  const filters = state.values.map(([n, v]) => paramToFilter(n, v)).filter(Boolean);
  const min = parseNumber(state.gte);
  const max = parseNumber(state.lte);
  if (min !== null || max !== null) {
    const price = {};
    if (min !== null) price.min = min;
    if (max !== null) price.max = max;
    filters.push({ price });
  }
  return filters;
}

function activeCount(state) {
  return state.values.length + (state.gte || state.lte ? 1 : 0);
}

/* ---------- data ---------- */

const FILTER_FIELDS = 'filters { id label type values { id label count input } }';

function toProductQuery(filters) {
  const parts = [];
  filters.forEach((f) => {
    if ('available' in f) parts.push(`available_for_sale:${f.available}`);
    if (f.price?.min !== undefined) parts.push(`variants.price:>=${f.price.min}`);
    if (f.price?.max !== undefined) parts.push(`variants.price:<=${f.price.max}`);
    if (f.productType) parts.push(`product_type:"${f.productType.replace(/"/g, '')}"`);
    if (f.productVendor) parts.push(`vendor:"${f.productVendor.replace(/"/g, '')}"`);
    if (f.tag) parts.push(`tag:"${f.tag.replace(/"/g, '')}"`);
  });
  const translatable = filters.every((f) => ['available', 'price', 'productType', 'productVendor', 'tag']
    .some((k) => k in f));
  return { query: parts.join(' AND '), translatable };
}

/**
 * Fetches one page of results for the view.
 * @param {Object} source { type: 'collection'|'all'|'search', handle, query }
 * @param {Object} sortDef [value, label, sortKey, reverse]
 * @param {Object[]} filters Storefront ProductFilter list
 * @param {boolean} useDefaultSort no explicit sort chosen (collection default order)
 * @returns {Promise<Object>} { found, title, descriptionHtml, products, filters, count }
 */
async function fetchResults(source, sortDef, filters, useDefaultSort) {
  const [, , sortKey, reverse] = sortDef;
  if (source.type === 'search' || source.type === 'all') {
    const { query, translatable } = toProductQuery(filters);
    const viaProducts = source.type === 'all' && translatable
      && !['RELEVANCE', 'PRICE'].includes(sortKey);
    const data = await storefront(`query Results($q: String!, $first: Int!, $sortKey: SearchSortKeys,
      $reverse: Boolean, $filters: [ProductFilter!], $productsFirst: Int!, $pSort: ProductSortKeys,
      $pQuery: String, ${VARS}) ${CONTEXT} {
      search(query: $q, types: PRODUCT, first: $first, sortKey: $sortKey, reverse: $reverse,
        productFilters: $filters, unavailableProducts: LAST) {
        totalCount
        productFilters { id label type values { id label count input } }
        nodes { ... on Product { ${PRODUCT_CARD_FIELDS} } }
      }
      products(first: $productsFirst, sortKey: $pSort, reverse: $reverse, query: $pQuery) {
        nodes { ${PRODUCT_CARD_FIELDS} }
      }
    }`, {
      q: source.type === 'search' ? source.query : '*',
      first: viaProducts ? 1 : PAGE_SIZE,
      sortKey: sortKey === 'PRICE' ? 'PRICE' : 'RELEVANCE',
      reverse,
      filters,
      productsFirst: viaProducts ? PAGE_SIZE : 0,
      pSort: PRODUCT_SORT_KEYS[sortKey] || sortKey,
      pQuery: query || null,
    });
    const { search } = data;
    return {
      found: true,
      products: viaProducts ? data.products.nodes : search.nodes.filter((n) => n?.handle),
      filters: search.productFilters || [],
      count: search.totalCount,
    };
  }
  const data = await storefront(`query Collection($handle: String!, $first: Int!,
    $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!], ${VARS})
    ${CONTEXT} {
    collection(handle: $handle) {
      title
      descriptionHtml
      products(first: $first, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        ${FILTER_FIELDS}
        nodes { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }`, {
    handle: source.handle,
    first: PAGE_SIZE,
    sortKey: useDefaultSort ? 'COLLECTION_DEFAULT' : sortKey,
    reverse: useDefaultSort ? false : reverse,
    filters,
  });
  const { collection } = data;
  if (!collection) {
    return {
      found: false, products: [], filters: [], count: 0,
    };
  }
  return {
    found: true,
    title: collection.title,
    descriptionHtml: collection.descriptionHtml,
    products: collection.products.nodes,
    filters: collection.products.filters || [],
    count: collection.products.nodes.length,
  };
}

/* ---------- DOM builders ---------- */

function summary(label, extra) {
  return el(
    'summary',
    'shop-collection__summary',
    {},
    el('span', 'shop-collection__label', {}, label),
    extra,
    el('span', 'shop-collection__icon-caret', {}, svg(ICONS.caret)),
  );
}

function priceMax(filter) {
  try {
    return JSON.parse(filter.values[0].input).price.max;
  } catch (e) {
    return null;
  }
}

function decimal(amount) {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(amount));
}

function inputId(prefix, filterId, value) {
  if (filterId === 'filter.v.availability') return `${prefix}-avail-${value}`;
  return `${prefix}-${filterId.replace(/[^a-z0-9]+/gi, '-')}-${value.replace(/[^a-z0-9]+/gi, '-')}`;
}

function buildFacet(filter, ctx, prefix, inDrawer) {
  const details = el('details', 'shop-collection__facet', inDrawer ? { open: true } : { name: 'shop-collection-facet' });
  details.dataset.filterId = filter.id;
  details.append(summary(filter.label));
  if (filter.type === 'PRICE_RANGE') {
    const max = ctx.priceMax ?? priceMax(filter);
    const field = (bound, label, placeholder) => {
      const id = `${prefix}-price-${bound}`;
      return el(
        'div',
        'shop-collection__price-field',
        {},
        el('input', 'shop-collection__price-input', {
          id,
          type: 'text',
          name: `filter.v.price.${bound}`,
          inputmode: 'decimal',
          'aria-label': label,
          placeholder,
        }),
        el('label', '', { for: id }, ctx.symbol),
      );
    };
    const panel = el(
      'div',
      'shop-collection__panel shop-collection__panel--price',
      {},
      el(
        'div',
        'shop-collection__price-fields',
        {},
        field('gte', T.priceLow, '0'),
        el('span', 'shop-collection__price-sep', {}, T.priceTo),
        field('lte', T.priceHigh, max !== null ? decimal(max) : ''),
      ),
    );
    if (max !== null) {
      panel.append(el(
        'p',
        'shop-collection__price-max',
        {},
        T.priceMax,
        el('bdi', '', {}, formatMoney({ amount: String(max), currencyCode: ctx.currency })),
      ));
    }
    details.append(panel);
    return details;
  }
  const options = el('ul', 'shop-collection__options');
  filter.values.forEach((v) => {
    const value = v.id.startsWith(`${filter.id}.`) ? v.id.slice(filter.id.length + 1) : v.id;
    options.append(el('li', '', {}, el(
      'label',
      'shop-collection__checkbox',
      {},
      el('input', '', {
        type: 'checkbox',
        name: filter.id,
        value,
        id: inputId(prefix, filter.id, value),
        disabled: v.count === 0,
      }),
      svg(ICONS.check),
      el('span', 'shop-collection__checkbox-text', {}, v.label),
    )));
  });
  details.append(el('div', 'shop-collection__panel shop-collection__panel--list', {}, options));
  return details;
}

function buildFilters(filters, ctx, prefix, inDrawer) {
  if (!filters.length) return null;
  return el(
    'div',
    'shop-collection__filters',
    {},
    ...filters.map((f) => buildFacet(f, ctx, prefix, inDrawer)),
  );
}

function buildSortMenu(sorts) {
  return el(
    'details',
    'shop-collection__sort',
    { name: 'shop-collection-facet' },
    summary(T.sort),
    el(
      'div',
      'shop-collection__panel shop-collection__panel--sort',
      { role: 'listbox', 'aria-label': T.sort },
      el('div', 'shop-collection__sort-options', {}, ...sorts.map(([value, label]) => el(
        'label',
        'shop-collection__sort-option',
        {},
        el('input', '', { type: 'radio', name: 'sort_by', value }),
        svg(ICONS.check),
        el('span', '', {}, label),
      ))),
    ),
  );
}

function column(name, value, label, icon) {
  return el(
    'label',
    'shop-collection__column',
    {},
    el('input', '', {
      type: 'radio', name, value, 'aria-label': label,
    }),
    el('span', 'shop-collection__column-icon', {}, svg(icon)),
  );
}

function buildColumns(mobile) {
  const name = mobile ? 'grid-mobile' : 'grid';
  return el(
    'fieldset',
    'shop-collection__columns',
    {},
    el('legend', 'shop-visually-hidden', {}, T.columns),
    ...(mobile
      ? [column(name, 'mobile-single', T.columnSingle, ICONS.single),
        column(name, 'default', T.columnDefault, ICONS.gridDefault)]
      : [column(name, 'default', T.columnDefault, ICONS.gridDefault),
        column(name, 'zoom-out', T.columnZoom, ICONS.gridZoom)]),
  );
}

function buildEmpty(clearHref) {
  return el(
    'div',
    'shop-collection__empty',
    { id: 'shop-collection-results' },
    el('h2', 'shop-collection__empty-title', {}, T.emptyTitle),
    el(
      'p',
      '',
      {},
      T.emptyBefore,
      el('a', 'shop-collection__empty-link', { href: clearHref }, T.emptyLink),
      T.emptyAfter,
    ),
  );
}

/**
 * Builds the shop-collection view (facet bar, mobile bar + drawer, results / empty state)
 * inside `block` and keeps it in sync with the Storefront API and the URL query.
 * Used by shop-collection and, with `source.type = 'search'`, by shop-search.
 * @param {Element} block div.shop-collection
 * @param {Object} source { type: 'collection'|'all'|'search', handle?, query?, title? }
 * @returns {Promise<Object>} the first result set
 */
export async function createCollectionView(block, source) {
  const isSearch = source.type === 'search';
  const sorts = isSearch ? SEARCH_SORTS : COLLECTION_SORTS;
  let defaultSort = 'most-relevant';
  if (isSearch) defaultSort = 'relevance';
  else if (source.type === 'all') defaultSort = 'title-ascending';
  const action = window.location.pathname;
  const clearHref = isSearch
    ? `${action}?${new URLSearchParams({ q: source.query, type: 'product' })}`
    : action;
  const state = readUrlState(sorts, defaultSort);
  const ctx = { symbol: '€', currency: 'EUR', priceMax: null };

  block.classList.add('shop-collection');
  if (isSearch) block.classList.add('shop-collection--search');
  block.dataset.state = 'results';
  block.dataset.view = 'default';

  /* skeleton (stable while the API answers) */
  let header = null;
  if (!isSearch) {
    header = el('div', 'shop-collection__header', {}, el('h1', 'shop-collection__title'));
  }
  const body = el('div', 'shop-collection__body');
  const skip = el('a', 'shop-collection__skip', { href: '#shop-collection-results' }, T.skip);

  const count = el('span', 'shop-collection__count', { role: 'status' });
  const sortMenu = buildSortMenu(sorts);
  const bar = el(
    'form',
    'shop-collection__bar',
    { action, method: 'get', 'aria-label': T.filterForm },
    el('h3', 'shop-visually-hidden', {}, T.activeFilters),
    count,
    sortMenu,
    buildColumns(false),
  );

  const toggle = el(
    'button',
    'shop-collection__filter-toggle',
    { type: 'button', 'aria-controls': 'shop-collection-drawer', 'aria-expanded': 'false' },
    svg(ICONS.filter),
    T.filter,
  );
  const mobileBar = el('div', 'shop-collection__mobile-bar', {}, toggle, buildColumns(true));

  const badge = el('span', 'shop-collection__badge', { hidden: true }, '0');
  const closeBtn = el(
    'button',
    'shop-collection__drawer-close',
    { type: 'button', 'aria-label': T.close },
    svg(ICONS.close),
  );
  const select = el('select', '', { id: 'shop-collection-sort-select', name: 'sort_by' }, ...sorts.map(
    ([value, label]) => el('option', '', { value }, label),
  ));
  const status = el('span', 'shop-collection__status');
  const drawerSort = el(
    'div',
    'shop-collection__drawer-sort',
    {},
    el('label', '', { for: 'shop-collection-sort-select' }, T.sort),
    el('span', 'shop-collection__select', {}, select, svg(ICONS.select)),
  );
  const drawerSortMenu = el(
    'details',
    'shop-collection__sort shop-collection__drawer-sort-menu',
    { hidden: true },
    summary(T.sort, status),
  );
  const drawerForm = el(
    'form',
    'shop-collection__drawer-body',
    { action, method: 'get' },
    el('h3', 'shop-visually-hidden', {}, T.activeFilters),
    drawerSort,
    drawerSortMenu,
  );
  const drawerAction = el('button', 'shop-button shop-button--primary', { type: 'button' });
  const drawer = el(
    'div',
    'shop-collection__drawer',
    {
      id: 'shop-collection-drawer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'shop-collection-drawer-title',
      hidden: true,
    },
    el(
      'div',
      'shop-collection__drawer-header',
      {},
      el('h2', 'shop-collection__drawer-title', { id: 'shop-collection-drawer-title' }, T.filter, badge),
      closeBtn,
    ),
    drawerForm,
    el('div', 'shop-collection__drawer-actions', {}, drawerAction),
  );

  const results = el('div', 'shop-collection__results shop-product-grid', { id: 'shop-collection-results' });
  results.append(renderProductListPlaceholder(4));
  let resultsSlot = results;

  body.append(skip, bar, mobileBar, drawer, results);
  block.replaceChildren(...(header ? [header] : []), body);

  /* sync inputs with the state */
  const syncInputs = () => {
    block.querySelectorAll('input[type=checkbox]').forEach((input) => {
      input.checked = state.values.some(([n, v]) => n === input.name && v === input.value);
    });
    block.querySelectorAll('input[name="filter.v.price.gte"]').forEach((i) => { i.value = state.gte; });
    block.querySelectorAll('input[name="filter.v.price.lte"]').forEach((i) => { i.value = state.lte; });
    sortMenu.querySelectorAll('input[name=sort_by]').forEach((i) => { i.checked = i.value === state.sort; });
    select.value = state.sort;
    status.textContent = sorts.find(([v]) => v === state.sort)?.[1] || '';
    const n = activeCount(state);
    badge.textContent = String(n);
    badge.hidden = n === 0;
  };

  const render = (data) => {
    if (header) {
      const title = header.querySelector('.shop-collection__title');
      title.textContent = data.title || source.title || '';
      header.querySelector('.shop-collection__description')?.remove();
      const desc = data.descriptionHtml ? sanitizeHtml(data.descriptionHtml) : null;
      if (desc && desc.textContent.trim()) {
        header.append(el('div', 'shop-collection__description', {}, desc));
      }
    }
    const currency = data.products[0]?.priceRange?.minVariantPrice?.currencyCode;
    if (currency) {
      ctx.currency = currency;
      ctx.symbol = formatMoney({ amount: '0', currencyCode: currency }).replace(/[\d.,\s]+$/, '').trim();
    }

    // facets (bar + drawer): keep which dropdown is open and which input has focus
    const openId = bar.querySelector('.shop-collection__facet[open]')?.dataset.filterId;
    const focusId = document.activeElement?.id;
    bar.querySelector('.shop-collection__filters')?.remove();
    drawerForm.querySelector('.shop-collection__filters')?.remove();
    if (data.filters.length || activeCount(state)) {
      ctx.filters = data.filters.length ? data.filters : ctx.filters || [];
    } else {
      ctx.filters = [];
    }
    const barFilters = buildFilters(ctx.filters, ctx, 'bar', false);
    const drawerFilters = buildFilters(ctx.filters, ctx, 'drawer', true);
    if (barFilters) {
      bar.querySelector('h3').after(barFilters);
      drawerForm.querySelector('h3').after(drawerFilters);
      if (openId) {
        const open = [...barFilters.children].find((d) => d.dataset.filterId === openId);
        if (open) open.open = true;
      }
    }

    count.textContent = T.count(data.count);
    drawerAction.textContent = T.viewCount(data.count);
    syncInputs();
    if (focusId) document.getElementById(focusId)?.focus();

    let next;
    if (data.products.length) {
      block.dataset.state = 'results';
      next = results;
      renderProductList(data.products, {
        sizes: CARD_SIZES, withId: true, eagerCount: 2,
      }, results.querySelector('.shop-product-grid__list'));
    } else {
      block.dataset.state = 'empty';
      next = buildEmpty(clearHref);
    }
    if (next !== resultsSlot) {
      resultsSlot.replaceWith(next);
      resultsSlot = next;
    }
  };

  let requestId = 0;
  const update = async () => {
    requestId += 1;
    const id = requestId;
    const sortDef = sorts.find(([v]) => v === state.sort);
    const filters = toProductFilters(state);
    const hasPrice = filters.some((f) => f.price);
    const needMax = hasPrice && ctx.priceMax === null;
    try {
      const [data, unfiltered] = await Promise.all([
        fetchResults(source, sortDef, filters, !state.explicitSort && !isSearch),
        needMax ? fetchResults(source, sortDef, filters.filter((f) => !f.price), true) : null,
      ]);
      if (id !== requestId) return null;
      if (!hasPrice || unfiltered) {
        const priceFilter = (unfiltered || data).filters.find((f) => f.type === 'PRICE_RANGE');
        if (priceFilter) ctx.priceMax = priceMax(priceFilter);
      }
      render(data);
      return data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('shop-collection: results unavailable', e);
      if (id === requestId) {
        render({
          found: false, products: [], filters: [], count: 0,
        });
      }
      return null;
    }
  };

  /* behaviour */
  const setView = (view, animate) => {
    const apply = () => { block.dataset.view = view; };
    if (!animate || !document.startViewTransition) {
      apply();
      return;
    }
    const items = [...block.querySelectorAll('.shop-product-grid__item')];
    items.forEach((li) => {
      li.style.viewTransitionName = `product-card-${li.dataset.productId}`;
    });
    const t = document.startViewTransition({ update: apply, types: ['product-grid'] });
    t.finished.finally(() => items.forEach((li) => { li.style.viewTransitionName = ''; }));
  };

  const readForm = (form, changed) => {
    if (changed.name === 'grid') {
      setView(changed.value, true);
      return false;
    }
    if (changed.name === 'grid-mobile') {
      setView(changed.value, false);
      return false;
    }
    if (changed.name === 'sort_by') {
      state.sort = changed.value;
      state.explicitSort = true;
      return true;
    }
    if (changed.type === 'checkbox') {
      state.values = state.values.filter(([n, v]) => !(n === changed.name && v === changed.value));
      if (changed.checked) state.values.push([changed.name, changed.value]);
      return true;
    }
    if (changed.name === 'filter.v.price.gte') {
      state.gte = changed.value.trim();
      return true;
    }
    if (changed.name === 'filter.v.price.lte') {
      state.lte = changed.value.trim();
      return true;
    }
    return false;
  };

  const onChange = (e) => {
    if (readForm(e.currentTarget, e.target)) {
      writeUrlState(state, defaultSort);
      syncInputs();
      update();
    }
  };
  [bar, drawerForm].forEach((form) => {
    form.addEventListener('change', onChange);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input:focus');
      if (input) input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  // the mobile grid radios sit outside the forms
  mobileBar.addEventListener('change', (e) => {
    if (e.target.name === 'grid-mobile') setView(e.target.value, false);
  });

  block.addEventListener('click', (e) => {
    const link = e.target.closest('.shop-collection__empty-link');
    if (link && activeCount(state)) {
      e.preventDefault();
      state.values = [];
      state.gte = '';
      state.lte = '';
      writeUrlState(state, defaultSort);
      syncInputs();
      update();
    }
  });

  const closeDrawer = () => {
    drawer.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  });
  closeBtn.addEventListener('click', closeDrawer);
  drawerAction.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!drawer.hidden) closeDrawer();
    bar.querySelectorAll('details[open]').forEach((d) => { d.open = false; });
  });
  document.addEventListener('click', (e) => {
    bar.querySelectorAll('details[open]').forEach((d) => {
      if (!d.contains(e.target)) d.open = false;
    });
  });
  document.addEventListener('shop:country-changed', () => {
    ctx.priceMax = null;
    update();
  });

  block.querySelector('input[name=grid][value=default]').checked = true;
  block.querySelector('input[name=grid-mobile][value=default]').checked = true;
  syncInputs();
  return update();
}

/**
 * loads and decorates the block
 * Authored rows: `collection` | handle (empty = last URL path segment).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  const handle = config.collection?.value
    || window.location.pathname.split('/').filter(Boolean).pop()
    || 'all';
  const cssLoaded = loadCSS(`${window.hlx?.codeBasePath || ''}/blocks/shop-product-grid/shop-product-grid.css`);
  const view = createCollectionView(block, handle === 'all'
    ? { type: 'all', handle, title: config.title?.value || T.allTitle }
    : { type: 'collection', handle });
  await Promise.all([cssLoaded, view]);
}
