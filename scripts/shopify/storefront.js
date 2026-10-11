/*
 * Minimal Shopify Storefront API client for browser-facing requests.
 *
 * Configuration comes from the authored DA sheet `/shopify-config` (served as
 * `/shopify-config.json`, columns Key / Value):
 *   store-domain      e.g. t8bnc1-5b.myshopify.com
 *   api-version       e.g. 2026-01
 *   storefront-token  the PUBLIC Storefront API access token (never commit it to code)
 *   country           default buyer country (DE)
 *   language          default language (DE)
 * Without a token, requests use Shopify's tokenless Storefront access
 * (catalog, search and cart are available tokenless).
 */

const DEFAULTS = {
  'store-domain': 't8bnc1-5b.myshopify.com',
  'api-version': '2026-01',
  'storefront-token': '',
  country: 'DE',
  language: 'DE',
};

const COUNTRY_KEY = 'shop-country';

let configPromise;

/**
 * @returns {Promise<Object>} the merged Shopify configuration
 */
export function getShopifyConfig() {
  if (!configPromise) {
    configPromise = fetch(`${window.hlx?.codeBasePath || ''}/shopify-config.json`)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .catch(() => ({ data: [] }))
      .then(({ data = [] }) => {
        const config = { ...DEFAULTS };
        data.forEach((row) => {
          const key = (row.Key || row.key || '').trim().toLowerCase();
          const value = (row.Value || row.value || '').trim();
          if (key && value) config[key] = value;
        });
        return config;
      });
  }
  return configPromise;
}

/**
 * @returns {string} the buyer country (ISO code) chosen in the localization selector
 */
export function getCountry() {
  try {
    return localStorage.getItem(COUNTRY_KEY) || '';
  } catch (e) {
    return '';
  }
}

/**
 * Persists the buyer country and notifies listeners.
 * @param {string} isoCode ISO country code, e.g. DE or AT
 */
export function setCountry(isoCode) {
  try {
    localStorage.setItem(COUNTRY_KEY, isoCode);
  } catch (e) {
    // storage unavailable: the choice lasts for this page only
  }
  document.dispatchEvent(new CustomEvent('shop:country-changed', { detail: { isoCode } }));
}

/**
 * Runs a Storefront API GraphQL operation in the buyer's country/language context.
 * The operation must use the variables `$country` and `$language` in an
 * `@inContext(country: $country, language: $language)` directive.
 * @param {string} query GraphQL document
 * @param {Object} [variables] operation variables
 * @returns {Promise<Object>} the `data` object
 */
export async function storefront(query, variables = {}) {
  const config = await getShopifyConfig();
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (config['storefront-token']) {
    headers['X-Shopify-Storefront-Access-Token'] = config['storefront-token'];
  }
  const resp = await fetch(
    `https://${config['store-domain']}/api/${config['api-version']}/graphql.json`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: {
          country: getCountry() || config.country,
          language: config.language,
          ...variables,
        },
      }),
    },
  );
  if (!resp.ok) throw new Error(`Storefront API ${resp.status}`);
  const { data, errors } = await resp.json();
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));
  return data;
}

/**
 * @returns {Promise<string>} the shop origin, e.g. https://t8bnc1-5b.myshopify.com
 */
export async function getShopOrigin() {
  const config = await getShopifyConfig();
  return `https://${config['store-domain']}`;
}

const SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF ',
};

/**
 * Formats money like the theme's money format ("€129,99").
 * @param {{amount: string, currencyCode: string}} money Storefront MoneyV2
 * @param {boolean} [withCurrency] append the ISO code ("€129,99 EUR")
 * @returns {string} the formatted price
 */
export function formatMoney(money, withCurrency = false) {
  if (!money) return '';
  const number = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(money.amount));
  const symbol = SYMBOLS[money.currencyCode] ?? `${money.currencyCode} `;
  return `${symbol}${number}${withCurrency ? ` ${money.currencyCode}` : ''}`;
}

/**
 * Builds a Shopify CDN image URL at a given width.
 * @param {string} url image url from the API
 * @param {number} width target width in px
 * @returns {string} sized url
 */
export function imageUrl(url, width) {
  if (!url) return '';
  const u = new URL(url);
  u.searchParams.set('width', width);
  return u.toString();
}

/**
 * Builds a responsive srcset for a Shopify CDN image.
 * @param {string} url image url from the API
 * @param {number[]} widths widths in px
 * @returns {string} srcset value
 */
export function imageSrcset(url, widths = [240, 352, 600, 832, 1200, 1600]) {
  return widths.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ');
}

export const PRODUCT_CARD_FIELDS = `
  id
  handle
  title
  availableForSale
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id availableForSale } }
`;
