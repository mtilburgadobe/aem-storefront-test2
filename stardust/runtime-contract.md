# Runtime contract: Shopify blocks on EDS (Phase 5)

Repo root: /backups/mtilburgadobe/aem-storefront-test2/repo. Also read `docs/shopify-integration.md` (content model and which fields come from AEM vs Shopify) and `stardust/replica/canon-contract.md` (CSS canon, Canon API).

## What exists (frozen foundation: never edit, request changes in stardust/rollout/foundation-requests.md)

- `scripts/scripts.js`: on pages with metadata `Template: shopify`, `commerce.js` is never imported; it delegates to `scripts/shopify/page.js`:
  - eager: `lang=de`, template classes on body, `styles/shopify.css` (+ `styles/shopify-policy.css` when body has `shop-policy`), `decorateMain`, first section.
  - lazy: builds the **`shop-header`** block inside `<header>` and the **`shop-footer`** block inside `<footer>`, then loads the remaining sections.
- `scripts/shopify/storefront.js`:
  - `storefront(query, variables)`. The query MUST declare `$country: CountryCode, $language: LanguageCode` and use `@inContext(country: $country, language: $language)`; the client fills both.
  - `getShopifyConfig()`, `getShopOrigin()` → `https://t8bnc1-5b.myshopify.com`
  - `getCountry()` / `setCountry(iso)` (fires `shop:country-changed`)
  - `formatMoney(moneyV2, withCurrency)` → "€129,99" / "€129,99 EUR"
  - `imageUrl(url, width)`, `imageSrcset(url, widths)`
  - `PRODUCT_CARD_FIELDS` (GraphQL selection for product cards)
- `scripts/shopify/cart.js`:
  - `getCart(refresh)`, `addToCart(variantGid, qty)`, `updateLine(lineGid, qty)` (0 removes)
  - `setCartCountry(iso)`, `goToCheckout()`, `buyNow(variantGid, qty)` (register R-02/R-03: a fresh cart, then hosted checkout)
  - Every change dispatches `shop:cart-updated` on `document` with `detail.cart`.
- Storefront API: `https://t8bnc1-5b.myshopify.com/api/2026-01/graphql.json` (CORS). Tokenless access works in production; the public token is optional config in the DA sheet `/shopify-config`. In this sandbox, outbound requests get the token injected automatically. Never put a token in code.

## Events (block ↔ block)

- `shop:cart-updated` (document, `detail.cart`): fired by cart.js. The header bubble, cart drawer and cart page re-render from it.
- `shop:open-cart` (document): any block asks the header to open the cart drawer (quick add, PDP add to cart, as on live). On `/cart` the header renders the cart icon as a plain link and doesn't open a drawer.
- `shop:country-changed` (document, `detail.isoCode`): price-bearing blocks re-query.

## Content (already imported, served locally)

`content/*.plain.html`, served by the running dev server at **http://localhost:3000** (aem up with `--html-folder content`, local code). Pages:
- `/`, `/collections`, `/collections/{all,frontpage,running,cycling,team-sports,fitness-training,camping-hiking,water-sports,winter-sports,golf,tennis-racquet-sports,fan-gear-apparel}`
- `/products/{trail-running-shoes,road-running-shoes,running-shorts,road-bike-helmet}`
- `/search`, `/cart`, `/pages/contact`, `/policies/privacy-policy`
- fragments `/nav`, `/footer`; sheet stub `/shopify-config`

Read the block tables with `curl -s http://localhost:3000/<path>.plain.html`. Never edit `content/`: it's produced by the import script `tools/importer/import-shopify.js`. If a block needs a different authored row, say so in your return and the main agent re-runs the import.

## Block JS rules

- `blocks/<name>/<name>.js` exports `default async function decorate(block)`. Reproduce EXACTLY the DOM contract in the comment at the top of `blocks/<name>/<name>.css` (classes, nesting, attributes, states), because that DOM is what the CSS was gated with. The gated reference page is `http://localhost:8791/stardust/prototypes/<slug>-proposed.html` (static server, repo root).
- Editability (EW rules): MOVE authored nodes (headings, paragraphs, links, pictures) into the slots with `append()`; never rebuild authored text from `textContent`/`innerHTML`; never put authored text into a `<button>`. Read key/value config rows with a small helper (first cell = key, lower-cased). Shopify data is built with DOM APIs (`document.createElement`, `textContent`). Only Shopify `descriptionHtml` / policy `body` are inserted as HTML, sanitised to a tag allow-list with no `on*` attributes and no `javascript:` URLs.
- Shopify data only at runtime: no product, price, title, image or stock value may be hard-coded or read from DA.
- Loading state: keep the block's layout box stable while data loads (reserve the grid/media space) so the page doesn't jump. On API failure, render the theme's empty state, never an exception.
- Links stay root-relative on this site: `/products/<handle>`, `/collections/<handle>`. Hosted handoffs are absolute on the shop domain: checkout URL, `/account`, `/contact` form action.
- Images: Shopify CDN `<img>` with `srcset`/`sizes` via `imageSrcset`; `loading="lazy"` except the first/LCP image; width/height from the API to avoid layout shift.
- Lint: `npx eslint blocks/<name>/<name>.js scripts/shopify` and `npx stylelint "blocks/<name>/*.css"` must be clean (airbnb-base: 2-space indent, single quotes, max-len 100, no `for…of` loops (use array methods), no nested ternaries, import extensions `.js`). Fix your own files only.

## How to verify (structural, local; the pixel verdict is the published-origin gate later)

1. `curl -s http://localhost:3000/<path>` → 200. Then load the page in Playwright (run with `export NODE_OPTIONS="--import $PWD/stardust/.work/tls-preload.mjs"`, scripts under `stardust/.work/<your-name>/`) and check: no console errors, no requests to `/scripts/commerce.js`, `/scripts/initializers/`, `/scripts/__dropins__/`, and the block DOM present with live Shopify data.
2. Structure against the gated prototype: `node stardust/scripts/diff/content-diff.mjs http://localhost:8791/stardust/prototypes/<slug>-proposed.html http://localhost:3000/<path> --main main` should show 0 structural 🔴 (data drift such as a changed price is 🟡).
3. A sanity pixel compare is allowed as a dev aid (`stardust/scripts/replica/stitch-shot.mjs` both, then `pixel-compare.mjs`). Aim for the prototype's numbers. Don't spend more than 2 rounds on pixels; report the numbers.
4. Exercise every interaction the DOM contract lists (click/hover with Playwright) and confirm the state attributes toggle as in the prototype's inline script, which is the reference behaviour to port into block JS.
5. Never submit the contact or newsletter form on any origin; never start checkout (asserting the checkout URL host is enough). Adding to an anonymous cart is fine.
