<!-- stardust:provenance writtenBy=stardust:replica writtenAt=2026-10-10T14:55:00Z -->
# Dynamic features plan — Mein Shop

## Phase D1 — Shopify runtime foundation (self)
- `scripts/shopify/storefront.js`: a tiny GraphQL client (fetch, `X-Shopify-Storefront-Access-Token` only when configured, `@inContext(country, language: DE)`), config from `/shopify-config.json` (DA sheet), with in-memory caching.
- `scripts/shopify/cart.js`: cart create/add/update/remove, cart id in `localStorage`, `shopify:cart` events, `checkoutUrl` handoff.
- `scripts/shopify/format.js`: `Intl.NumberFormat('de-DE', { style: 'currency', currency })` → "€129,99".
- Isolation: pages with metadata `commerce: shopify` never import `scripts/commerce.js`, the initializers or drop-ins; `head.html` only preloads them on other pages.

## Phase D2 — Blocks (self)
- `shopify-header` / `shopify-footer` (fragments `/nav`, `/footer`), with drawers, the search modal, cart drawer and localization.
- `shopify-product` (PDP buy box + gallery + description), `shopify-product-grid` (home / search / recommendations), `shopify-collection` (title, description, facets, sort, grid), `shopify-collection-list`, `shopify-search`, `shopify-cart`, `shopify-contact-form`, newsletter inside the footer.

## Phase D3 — Verification
- Catalog parity: titles / prices / handles on the built pages match the API output.
- Search parity: q=running → 3 results (Trail Running Shoes, Running Shorts, Road Running Shoes).
- Cart: add → count 1 → `/cart` line → checkout URL on `t8bnc1-5b.myshopify.com/cart/c/…` (hosted).
- Forms: the native POST reaches Shopify `/contact`. The validation-error path is checked without side effects; the success path waits for owner approval.
- Isolation: on Shopify pages, no request to `/scripts/commerce.js`, `/scripts/initializers/*` or `/scripts/__dropins__/*`. On a non-Shopify page the existing Adobe Commerce path still runs.

## Authoring contract
See `docs/shopify-integration.md` (which fields come from AEM and which from Shopify).

## Effort
D1 small · D2 the bulk (recreation + gate) · D3 small.
