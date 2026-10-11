import { storefront } from '../../scripts/shopify/storefront.js';

/*
 * shop-policy: a Shopify shop policy body (privacy, refund, terms, shipping, subscription).
 * Authored: `policy | <handle>` (empty = last URL path segment); the page h1 is default content
 * above the block. The body is Shopify data (edited in Shopify admin), sanitised to a tag
 * allow-list and inserted as default-content-like markup (p, h2, ul > li, strong, a), styled by
 * styles/shopify-policy.css (body.shopify.shop-policy main .shop-policy …).
 */

const POLICIES = {
  'privacy-policy': 'privacyPolicy',
  'refund-policy': 'refundPolicy',
  'terms-of-service': 'termsOfService',
  'shipping-policy': 'shippingPolicy',
  'subscription-policy': 'subscriptionPolicy',
};

const ALLOWED_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'STRONG', 'B',
  'EM', 'I', 'U', 'S', 'SMALL', 'SUB', 'SUP', 'BR', 'HR', 'A', 'SPAN', 'BLOCKQUOTE', 'TABLE', 'THEAD',
  'TBODY', 'TFOOT', 'TR', 'TH', 'TD']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON',
  'SELECT', 'TEXTAREA', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'LINK', 'META', 'BASE', 'IMG', 'VIDEO',
  'AUDIO']);
const ALLOWED_ATTRS = {
  A: ['href', 'title', 'target'],
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
    // unknown wrappers (Shopify wraps the body in a <div>) are unwrapped, their content kept
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    return fragment;
  }
  const clean = document.createElement(node.tagName.toLowerCase());
  (ALLOWED_ATTRS[node.tagName] || []).forEach((name) => {
    const value = node.getAttribute(name);
    if (value === null) return;
    if (name === 'href') {
      const url = safeUrl(value);
      if (url) clean.setAttribute(name, url);
    } else {
      clean.setAttribute(name, value);
    }
  });
  if (clean.getAttribute('target') === '_blank') clean.setAttribute('rel', 'noopener noreferrer');
  clean.append(...children);
  return clean;
}

function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const fragment = document.createDocumentFragment();
  fragment.append(...[...doc.body.childNodes].map(sanitizeNode).filter(Boolean));
  // drop whitespace-only text between blocks
  [...fragment.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
  return fragment;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    if (key && value) config[key.textContent.trim().toLowerCase()] = value.textContent.trim();
  });
  const handle = config.policy || window.location.pathname.split('/').filter(Boolean).pop() || '';
  const field = POLICIES[handle] || 'privacyPolicy';
  block.replaceChildren();
  // reserve the text column while Shopify answers
  block.style.minHeight = '100vh';
  try {
    const data = await storefront(`query Policy($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      shop { ${field} { title body } }
    }`);
    const policy = data?.shop?.[field];
    if (policy?.body) block.append(sanitizeHtml(policy.body));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('shop-policy: policy could not be loaded', e);
  }
  block.style.minHeight = '';
}
