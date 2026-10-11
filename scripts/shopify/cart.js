import { storefront, getCountry, getShopifyConfig } from './storefront.js';

/*
 * Shopify cart over the Storefront API. The cart id lives in localStorage; every
 * change dispatches `shop:cart-updated` on document with the cart as detail.
 * Checkout is always Shopify's hosted checkout (cart.checkoutUrl).
 */

const CART_KEY = 'shop-cart-id';

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost {
        amountPerQuantity { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          image { url altText width height }
          product { handle title }
          selectedOptions { name value }
        }
      }
    }
  }
`;

const CONTEXT = '@inContext(country: $country, language: $language)';

let cartPromise;

function storedId() {
  try {
    return localStorage.getItem(CART_KEY);
  } catch (e) {
    return null;
  }
}

function store(cart) {
  try {
    if (cart?.id) localStorage.setItem(CART_KEY, cart.id);
    else localStorage.removeItem(CART_KEY);
  } catch (e) {
    // storage unavailable
  }
  document.dispatchEvent(new CustomEvent('shop:cart-updated', { detail: { cart } }));
  return cart;
}

async function buyerIdentity() {
  const config = await getShopifyConfig();
  return { countryCode: getCountry() || config.country };
}

function check(payload) {
  const errors = payload?.userErrors || [];
  if (errors.length) throw new Error(errors.map((e) => e.message).join('; '));
  return payload.cart;
}

/**
 * @param {boolean} [refresh] re-read the cart from Shopify
 * @returns {Promise<Object|null>} the current cart, or null when there is none
 */
export function getCart(refresh = false) {
  if (!cartPromise || refresh) {
    const id = storedId();
    cartPromise = id
      ? storefront(`query Cart($id: ID!, $country: CountryCode, $language: LanguageCode) ${CONTEXT} {
          cart(id: $id) { ${CART_FIELDS} }
        }`, { id }).then(({ cart }) => {
        if (!cart) store(null);
        return cart;
      }).catch(() => null)
      : Promise.resolve(null);
  }
  return cartPromise;
}

async function createCart(lines) {
  const data = await storefront(`mutation CartCreate($input: CartInput!, $country: CountryCode, $language: LanguageCode) ${CONTEXT} {
    cartCreate(input: $input) { cart { ${CART_FIELDS} } userErrors { field message } }
  }`, { input: { lines, buyerIdentity: await buyerIdentity() } });
  return check(data.cartCreate);
}

async function mutate(name, args, values) {
  const data = await storefront(`mutation M(${args}, $country: CountryCode, $language: LanguageCode) ${CONTEXT} {
    ${name}(${Object.keys(values).map((k) => `${k}: $${k}`).join(', ')}) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }`, values);
  return check(data[name]);
}

function update(promise) {
  cartPromise = promise.then(store);
  return cartPromise;
}

/**
 * Adds a variant to the cart (creating the cart when needed).
 * @param {string} merchandiseId ProductVariant gid
 * @param {number} [quantity] quantity to add
 * @returns {Promise<Object>} the updated cart
 */
export async function addToCart(merchandiseId, quantity = 1) {
  const cart = await getCart();
  const lines = [{ merchandiseId, quantity }];
  if (!cart) return update(createCart(lines));
  return update(mutate('cartLinesAdd', '$cartId: ID!, $lines: [CartLineInput!]!', { cartId: cart.id, lines }));
}

/**
 * Sets a cart line's quantity (0 removes it).
 * @param {string} lineId CartLine gid
 * @param {number} quantity new quantity
 * @returns {Promise<Object>} the updated cart
 */
export async function updateLine(lineId, quantity) {
  const cart = await getCart();
  if (!cart) return null;
  if (quantity <= 0) {
    return update(mutate('cartLinesRemove', '$cartId: ID!, $lineIds: [ID!]!', { cartId: cart.id, lineIds: [lineId] }));
  }
  return update(mutate('cartLinesUpdate', '$cartId: ID!, $lines: [CartLineUpdateInput!]!', {
    cartId: cart.id,
    lines: [{ id: lineId, quantity }],
  }));
}

/**
 * Applies the buyer country to an existing cart (localization selector).
 * @param {string} countryCode ISO country code
 * @returns {Promise<Object|null>} the updated cart
 */
export async function setCartCountry(countryCode) {
  const cart = await getCart();
  if (!cart) return null;
  return update(mutate('cartBuyerIdentityUpdate', '$cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!', {
    cartId: cart.id,
    buyerIdentity: { countryCode },
  }));
}

/**
 * Sends the shopper to Shopify's hosted checkout for the current cart.
 */
export async function goToCheckout() {
  const cart = await getCart();
  if (cart?.checkoutUrl) window.location.assign(cart.checkoutUrl);
}

/**
 * Express checkout (register R-02 / R-03): a fresh cart holding only this variant,
 * then Shopify's hosted checkout, where PayPal, Shop Pay and every other method is offered.
 * @param {string} merchandiseId ProductVariant gid
 * @param {number} [quantity] quantity
 */
export async function buyNow(merchandiseId, quantity = 1) {
  const cart = await createCart([{ merchandiseId, quantity }]);
  if (cart?.checkoutUrl) window.location.assign(cart.checkoutUrl);
}
