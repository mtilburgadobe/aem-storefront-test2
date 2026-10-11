<!-- stardust:provenance writtenBy=stardust:replica (dynamics phases 1–3) writtenAt=2026-10-10T14:55:00Z evidence=stardust/current/_dynamics.json,stardust/dynamics/dynamic-features.generated-plan.md -->
# Dynamic features — Mein Shop (t8bnc1-5b.myshopify.com)

Owner decision already stated in the brief: **Shopify stays the live commerce backend.** Product titles, descriptions, images, prices, variants, availability, cart, checkout and customer accounts come from Shopify at runtime through the public Storefront API (browser → `https://t8bnc1-5b.myshopify.com/api/2026-01/graphql.json`, CORS) and Shopify's hosted pages. AEM only composes pages and holds editorial copy. No product data is stored in DA.

## Listings contract

There's no AEM query index. Every listing (home product grid, collection grids, collection list, search results, recommendations) reads from the Shopify Storefront API, keyed by the collection handle or the search term that the block or URL supplies.

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | shopify-catalog | Product / collection / collection-list data (title, description, media, price, compare-at, variants, availability) | A, L | 22/22 | data-fed (Storefront API, runtime) | needs-credential | interim | off-origin-data (CORS API) | Public Storefront token entered by the owner in the DA config sheet `/shopify-config` (never committed). Without one, requests go out tokenless. | `_dynamics.json` row 1 (`/api/2026-01/graphql.json` on 8/8 archetypes) |
| 2 | shopify-cart | Cart: add / update / remove lines, count badge, cart drawer, /cart page, "You may also like" | F, A | 22/22 | rebuild-native + data-fed (Storefront `cart*` mutations; cart id in localStorage) | self (given #1) | pending | commerce-cart | — | rows 10, 23, 24, 26 (`/cart/add` form on 33 pages) |
| 3 | shopify-checkout | Checkout, incl. PayPal / Shop Pay / more payment options | X | product, cart | embed-passthrough → Shopify hosted `cart.checkoutUrl` | self | pending | hosted-handoff | — (register R-02, R-03) | rows 22, 25 |
| 4 | shopify-account | Customer account (Konto icon) | X | 22/22 | embed-passthrough → hosted Shopify customer accounts (`/account` → `shopify.com/110471348549/account`) | self | pending | hosted-handoff | — | `/account` 302 |
| 5 | shopify-search | Predictive search modal + /search results ("3 Ergebnisse" for "running") | S | 22/22 | data-fed (Storefront `predictiveSearch` + `search`) | self | pending | search-api | Corpus = the Shopify catalog. Parity: q=running → 3: Trail Running Shoes, Running Shorts, Road Running Shoes. | rows 17, 18 |
| 6 | shopify-facets | Collection filters (Verfügbarkeit, Preis), sort (Sortieren), product count, grid/list toggle | F, L | 12 collections | data-fed (Storefront `collection.products(filters, sortKey)`) | self | pending | listing-facets | — | rows 8, 9 |
| 7 | contact-form | Contact form (Name, E-Mail, Telefon, Kommentar) | F | /pages/contact | embed-passthrough: native POST to `https://t8bnc1-5b.myshopify.com/contact` (`form_type=contact`) | needs-business-decision | interim | forms (hosted form service) | A real success test sends an email to the merchant, so the owner has to approve one live submission. The validation-error path is verified without side effects. | row 11 |
| 8 | newsletter | Footer "Join our email list" | F | 22/22 | embed-passthrough: native POST to `https://t8bnc1-5b.myshopify.com/contact` (`form_type=customer`, `contact[tags]=newsletter`) | needs-business-decision | interim | forms (hosted form service) | A real success test creates a subscribed customer, so the owner has to approve it. | row 7 |
| 9 | localization | Country selector (Deutschland / Österreich, EUR) | I18N | 22/22 | rebuild-native (Storefront `localization`, `@inContext(country)`, cart `buyerIdentity.countryCode`) | self | pending | locale-context | Only `de` exists: no locale tree (row 12 "en" is the theme's `en` alias — `/en` is 404). | row 12 |
| 10 | chrome-drawers | Mobile menu drawer, search modal, cart drawer, localization popover, quick-add modal | M | 22/22 | rebuild-native | self | pending | chrome-interaction | — (motion-observe evidence at gate) | rows 14–16 |
| 11 | recommendations | "You may also like" rail on /cart and the product page | CR | cart, product | data-fed (Storefront `productRecommendations` / first products of the catalog) | self | pending | api-rail | — | row 6 |
| 12 | shopify-analytics | Web pixels, `/api/collect`, `/.well-known/shopify/fec/produce`, shop.app, PayPal SDK | T | 22/22 | static-snapshot (not wired) — reason: undecided, revisit at rollout | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | Which analytics should run on the new host (Shopify Customer Privacy API + pixels, Adobe Analytics, none)? | rows 2, 4, 5, 19, 20 |
| 13 | adobe-commerce-isolation | Adobe Commerce config / initializers / drop-ins must not start on Shopify pages | X | Shopify pages | rebuild-native (page metadata `commerce: shopify` gates them off) | self | pending | platform-isolation | — (brief) | `scripts/scripts.js`, `head.html` |

## Decision batch

One message to the owner:

1. **Public Storefront API token**: paste it into the DA sheet `/shopify-config` (`storefront-token` row). It's a public, browser-facing token, so it's fine in content, but it is never committed to code. Until it's filled in, the client sends requests without a token.
2. **Contact form live test**: approve one real submission (it sends an email to the store inbox) to confirm the success handoff end to end.
3. **Newsletter live test**: approve one real sign-up (it creates a subscribed customer) to confirm the success handoff.
4. **Analytics on the new host**: which tags should run (Shopify pixels / Customer Privacy API, Adobe, none).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| — | none: nothing is decided-out by assumption | — |
