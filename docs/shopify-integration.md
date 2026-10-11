# Shopify storefront on AEM Edge Delivery

The Mein Shop storefront (`t8bnc1-5b.myshopify.com`, Shopify Horizon theme) is replicated on Edge Delivery with the same design, content and interactions. **Shopify stays the live commerce backend.** AEM composes the pages and holds the editorial copy. Every product, price, stock, cart and checkout value is read from Shopify in the browser at runtime. None of it is copied into DA.

## How a page becomes a Shopify page

Page metadata `Template: shopify` (policy pages: `Template: shopify, shop-policy`) does the following:

- adds `body.shopify`. All Shopify styling is scoped to it (`styles/shopify.css`, `styles/shopify-policy.css`, `blocks/shop-*`).
- makes `scripts/scripts.js` run the Shopify path (`scripts/shopify/page.js`): `shop-header` / `shop-footer` chrome, no Adobe Commerce.
- **never imports `scripts/commerce.js`**: no Adobe Commerce configuration, initializers, drop-ins, ACDL or commerce events. `head.html` only modulepreloads and boots `commerce.js` when the page is *not* a Shopify page, and `delayed.js` (which reads commerce config) is skipped. Pages without the template keep the existing Adobe Commerce behaviour unchanged.

## Configuration: DA sheet `/shopify-config`

| Key | Value | Notes |
|---|---|---|
| store-domain | `t8bnc1-5b.myshopify.com` | the Shopify shop (the code defaults to this) |
| api-version | `2026-01` | Storefront API version (the one the theme uses) |
| storefront-token | *(public Storefront API token)* | browser-facing public token; enter it in DA, **never commit it**. Empty = Shopify tokenless access (catalog, search, cart). |
| country | `DE` | default buyer country (`AT` is the other market) |
| language | `DE` | storefront language |

`scripts/shopify/storefront.js` reads the sheet, sends `X-Shopify-Storefront-Access-Token` only when a token is set, and wraps every query in `@inContext(country, language)`.

## Which fields come from where

| Surface | From AEM (authored in DA) | From Shopify (runtime, Storefront API / hosted) |
|---|---|---|
| Header (`/nav` fragment) | announcement text, wordmark + link, menu links (Startseite, Katalog, Kontakt) | cart count bubble, drawer featured products, predictive search results, country list (Deutschland / Österreich, EUR), account → hosted customer accounts |
| Footer (`/footer` fragment) | "Join our email list" heading + text, copyright line, policy link list | newsletter sign-up: native POST to Shopify `/contact` (`form_type=customer`) |
| Home | hero image (optional; the theme placeholder illustration otherwise), hero text, "Shop all" link; grid heading "Produkte", collection handle, product count | product cards: title, image, price, compare-at price, availability, variant id for quick add |
| Collection pages (`/collections/<handle>`) | collection handle (block row) | collection title, description, image; products; filters (Verfügbarkeit, Preis); sort; product count |
| Collection list (`/collections`) | heading "Collections" | collections (title, image) in Shopify's order |
| Product pages (`/products/<handle>`) | product handle (block row), "You may also like" heading, button labels | title, price, compare-at, media, variants, availability, description HTML, recommendations; add to cart; PayPal / "Weitere Bezahlmöglichkeiten" → hosted checkout (register R-02 / R-03) |
| Search (`/search?q=`) | heading "Suche", "Produkte" label | search results, result count, default product grid |
| Cart (`/cart`) | empty-state copy, login sentence + link, "Weiter einkaufen", labels, "You may also like" heading | cart lines, quantities, prices, totals, checkout URL → hosted Shopify checkout |
| Contact (`/pages/contact`) | heading "Kontakt", field labels / placeholders, button text | native POST to Shopify `/contact` (`form_type=contact`); Shopify sends the email |
| Privacy policy (`/policies/privacy-policy`) | page heading "Datenschutzerklärung", policy type | policy body (`shop.privacyPolicy.body`), edited in Shopify admin |

Hosted flows that are kept: checkout (`cart.checkoutUrl` on the shop domain), customer accounts (`/account` → `shopify.com/110471348549/account`), contact and newsletter submissions (Shopify's form endpoint and its bot check).

## Block authoring reference

| Block | Rows |
|---|---|
| `shop-hero` | optional image · text (paragraph) · link (CTA) |
| `shop-product-grid` | heading · `collection` \| handle · `limit` \| number (`source` \| `recommendations` on product pages) |
| `shop-collection` | `collection` \| handle (empty = taken from the URL) |
| `shop-collection-list` | heading |
| `shop-product` | `product` \| handle (empty = taken from the URL) · labels |
| `shop-search` | heading · `label` \| Produkte |
| `shop-cart` | labelled rows for every visible string |
| `shop-contact` | heading / intro · optional label rows |
| `shop-policy` | `policy` \| privacy-policy |
