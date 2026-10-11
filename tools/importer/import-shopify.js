/* global WebImporter */
/*
 * Import script: Shopify storefront (t8bnc1-5b.myshopify.com) → AEM Edge Delivery thin shells.
 *
 * Shopify stays the commerce backend: product, collection, price, stock and cart data is
 * NOT imported. Each document carries the editorial copy verbatim from the source page plus
 * the shop-* block that loads the Shopify data at runtime. The home page import also
 * emits the shared /nav and /footer fragments and the /shopify-config sheet stub.
 */

import { createShopBlock, createMetadata } from './parsers/shop-blocks.js';

const SHOP_HOST = 't8bnc1-5b.myshopify.com';

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function el(document, tag, content, attrs = {}) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (Array.isArray(content)) node.append(...content);
  else if (content instanceof document.defaultView.Node) node.append(content);
  else if (content !== undefined) node.textContent = content;
  return node;
}

function link(document, href, label) {
  return el(document, 'a', label, { href });
}

function block(document, name, cells) {
  return createShopBlock(document, name, cells);
}

function metadata(document, extra = {}) {
  const meta = {};
  const title = document.querySelector('title');
  if (title) meta.Title = text(title);
  const desc = document.querySelector('meta[name="description"]');
  if (desc?.content) meta.Description = desc.content.trim();
  meta.Template = 'shopify';
  Object.assign(meta, extra);
  return createMetadata(document, meta);
}

function doc(document, parts) {
  const main = document.createElement('div');
  parts.forEach((part, i) => {
    if (i > 0 && part.section) main.append(document.createElement('hr'));
    main.append(...(part.nodes || [part]).filter(Boolean));
  });
  return main;
}

const section = (...nodes) => ({ section: true, nodes });

function heroSection(document) {
  const hero = document.querySelector('main .hero');
  const heading = text(hero?.querySelector('.text-block p, .text-block h1, .text-block h2'));
  const cta = hero?.querySelector('a[href]');
  return section(block(document, 'shop-hero', [
    [el(document, 'p', heading)],
    [el(document, 'p', link(document, cta?.getAttribute('href') || '/collections/all', text(cta)))],
  ]));
}

function productGridSection(document, heading, collection = 'all', limit = '4') {
  return section(block(document, 'shop-product-grid', [
    [el(document, 'h3', heading)],
    ['collection', collection],
    ['limit', limit],
  ]));
}

function navDocument(document) {
  const announcement = text(document.querySelector('.announcement-bar p, .announcement-bar__message'));
  const brand = document.querySelector('.header-logo, a.header__heading-link');
  const items = [...document.querySelectorAll('header .menu-list__link, header nav[aria-label="Primär"] a')]
    .filter((a) => a.getAttribute('href') && a.getAttribute('href') !== 'null')
    .filter((a, i, all) => all.findIndex((b) => b.getAttribute('href') === a.getAttribute('href')) === i);
  const list = el(document, 'ul', items.map((a) => el(document, 'li', link(document, a.getAttribute('href'), text(a)))));
  return doc(document, [
    section(el(document, 'p', announcement)),
    section(
      el(document, 'p', link(document, '/', text(brand) || 'Mein Shop')),
      list,
    ),
    section(createMetadata(document, { Template: 'shopify', Robots: 'noindex' })),
  ]);
}

function footerDocument(document) {
  const footer = document.querySelector('footer');
  const h2 = footer?.querySelector('h2');
  const p = footer?.querySelector('.rte p, rte-formatter p');
  const copy = footer?.querySelector('.footer-utilities__text');
  const copyP = el(document, 'p');
  if (copy) {
    copy.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'A') copyP.append(link(document, n.getAttribute('href'), text(n)));
      else copyP.append(document.createTextNode(n.textContent.replace(/\s+/g, ' ')));
    });
    copyP.innerHTML = copyP.innerHTML.trim();
  }
  const trigger = footer?.querySelector('.policy-list-trigger');
  const policies = [...(footer?.querySelectorAll('.policy_list a') || [])];
  return doc(document, [
    section(el(document, 'h2', text(h2)), el(document, 'p', text(p))),
    section(
      copyP,
      el(document, 'p', text(trigger)),
      el(document, 'ul', policies.map((a) => el(document, 'li', link(document, a.getAttribute('href'), text(a))))),
    ),
    section(createMetadata(document, { Template: 'shopify', Robots: 'noindex' })),
  ]);
}

function configSheetStub(document) {
  // Rendered as a table; the owner turns it into the /shopify-config sheet in DA.
  return doc(document, [
    section(block(document, 'shopify-config', [
      ['Key', 'Value'],
      ['store-domain', SHOP_HOST],
      ['api-version', '2026-01'],
      ['storefront-token', ''],
      ['country', 'DE'],
      ['language', 'DE'],
    ])),
  ]);
}

function pageFor(document, pathname) {
  const h1 = text(document.querySelector('main h1'));
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    const gridHeading = text(document.querySelector('main .section-resource-list__header h3, main .section-resource-list__header h2'));
    return doc(document, [
      heroSection(document),
      productGridSection(document, gridHeading || 'Produkte'),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'collections' && segments.length === 1) {
    return doc(document, [
      section(block(document, 'shop-collection-list', [[el(document, 'h1', h1)]])),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'collections') {
    return doc(document, [
      section(block(document, 'shop-collection', [['collection', segments[1]]])),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'products') {
    const recHeading = [...document.querySelectorAll('main h2, main h3')].map(text)
      .find((t) => /you may also like/i.test(t));
    const parts = [section(block(document, 'shop-product', [['product', segments[1]]]))];
    if (recHeading) {
      parts.push(section(block(document, 'shop-product-grid', [
        [el(document, 'h3', recHeading)],
        ['source', 'recommendations'],
        ['product', segments[1]],
        ['limit', '4'],
      ])));
    }
    parts.push(section(metadata(document)));
    return doc(document, parts);
  }

  if (segments[0] === 'search') {
    const headings = [...document.querySelectorAll('main h3')].map(text);
    return doc(document, [
      section(block(document, 'shop-search', [
        [el(document, 'h3', headings[0] || 'Suche')],
        ['results-heading', 'Suchergebnisse'],
        ['label', 'Produkte'],
      ])),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'cart') {
    const empty = document.querySelector('main .cart-items__empty, main [class*="empty"]') || document.querySelector('main');
    const emptyHeading = text(empty.querySelector('h1, h2, h3')) || 'Dein Warenkorb ist leer';
    const loginP = [...empty.querySelectorAll('p')].find((p) => p.querySelector('a'));
    const loginCell = el(document, 'p');
    if (loginP) {
      loginP.childNodes.forEach((n) => {
        if (n.nodeType === 1 && n.tagName === 'A') loginCell.append(link(document, n.getAttribute('href'), text(n)));
        else loginCell.append(document.createTextNode(n.textContent.replace(/\s+/g, ' ')));
      });
      loginCell.innerHTML = loginCell.innerHTML.trim();
    }
    const cont = [...empty.querySelectorAll('a')].find((a) => /einkaufen/i.test(a.textContent));
    const recHeading = [...document.querySelectorAll('main h2, main h3')].map(text).find((t) => /like|empfehl/i.test(t)) || 'You may also like';
    return doc(document, [
      section(block(document, 'shop-cart', [
        [el(document, 'h1', emptyHeading)],
        [loginCell],
        [el(document, 'p', link(document, cont?.getAttribute('href') || '/collections/all', text(cont) || 'Weiter einkaufen'))],
        ['heading', 'Cart'],
        ['discount', 'Rabatt'],
        ['total', 'Geschätzter Gesamtbetrag'],
        ['tax-note', 'Inkl. Zollgebühren und Steuern. Versand wird beim Checkout berechnet.'],
        ['checkout', 'Auschecken'],
      ])),
      productGridSection(document, recHeading),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'pages' && segments[1] === 'contact') {
    return doc(document, [
      section(block(document, 'shop-contact', [
        [el(document, 'h1', h1)],
        ['name', 'Name'],
        ['email', 'E-Mail-Adresse'],
        ['phone', 'Telefonnummer'],
        ['comment', 'Kommentar'],
        ['submit', text(document.querySelector('main form.contact-form__form button, main .contact-form button')) || 'Submit'],
      ])),
      section(metadata(document)),
    ]);
  }

  if (segments[0] === 'policies') {
    return doc(document, [
      section(
        el(document, 'h1', h1),
        block(document, 'shop-policy', [['policy', segments[1]]]),
      ),
      section(metadata(document, { Template: 'shopify, shop-policy' })),
    ]);
  }

  return doc(document, [section(el(document, 'h1', h1)), section(metadata(document))]);
}

export default {
  // One document per URL (the runner converts a single output). The shared chrome
  // documents are requested as the home URL with ?eds-doc=nav|footer|shopify-config.
  transform: ({ document, params }) => {
    const source = new URL(params.originalURL);
    const chrome = source.searchParams.get('eds-doc');
    if (chrome === 'nav') return [{ element: navDocument(document), path: '/nav' }];
    if (chrome === 'footer') return [{ element: footerDocument(document), path: '/footer' }];
    if (chrome === 'shopify-config') {
      return [{ element: configSheetStub(document), path: '/shopify-config' }];
    }
    const { pathname } = source;
    const path = pathname === '/' ? '/index' : WebImporter.FileUtils.sanitizePath(pathname.replace(/\/$/, ''));
    return [{
      element: pageFor(document, pathname),
      path,
      report: { template: 'shopify', source: params.originalURL },
    }];
  },
};
