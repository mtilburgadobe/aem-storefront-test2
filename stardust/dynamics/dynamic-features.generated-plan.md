<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-10T14:49:24.181Z · input stardust/current/_dynamics.json (8 pages, 26 findings) -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-first-party-api-post-api-2026-01-graphql-json | A | first-party API POST /api/2026-01/graphql.json | 8/8 (reach 22/22) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 2 | a-first-party-api-post-api-collect | A | first-party API POST /api/collect | 8/8 (reach 22/22) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 3 | a-cms-app-settings-object-shopify | A | CMS / app settings object Shopify | 8/8 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-first-party-api-post-well-known-shopify-fec-produce | A | first-party API POST /.well-known/shopify/fec/produce | 4/8 (reach 18/22) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 5 | a-first-party-api-post-api-event-collect | A | first-party API POST /api/event/collect | 1/8 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 6 | cr-client-rendered-slot-product-recommendations | CR | client-rendered slot product-recommendations | 1/8 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 7 | f-form-contact-form-origin-contact-1-fields | F | form "contact_form" → origin /contact (1 fields) | 8/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 8 | f-form-facetfiltersform-template-32544931774789-main-desktop | F | form "FacetFiltersForm--template--32544931774789__main-desktop" → origin /collections/all (16 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 9 | f-form-facetfiltersform-template-32544931774789-main-overflo | F | form "FacetFiltersForm--template--32544931774789__main-overflow" → origin /collections/all (14 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 10 | f-form-ref-node-origin-cart-add-1-fields | F | form "ref: <Node>" → origin /cart/add (1 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 11 | f-form-contactform-aqytpbfn3u0liefnct-contact-form-uwickq-or | F | form "ContactForm-AQytPbFN3U0lieFNCT__contact_form_UwiCkQ" → origin /contact (4 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 12 | i18n-locale-variants-en | I18N | locale variants en | 1/8 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 13 | l-listing-candidate-11-cards | L | listing candidate 
  (11 cards) | 1/8 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 14 | m-modal-trigger-aria-haspopup-chrome-only-theme-drawer-conte | M | modal trigger aria-haspopup (chrome only) → theme-drawer:content | 6/8 (reach 99/22) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 15 | m-modal-trigger-aria-haspopup-theme-drawer-content | M | modal trigger aria-haspopup → theme-drawer:content | 1/8 (reach 99/22) | rebuild-native | self | pending | modal-loader | none |  |
| 16 | m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 1/8 (reach 99/22) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 17 | s-site-search-form-search | S | site search form → /search | 8/8 (reach 1/22) | index-backed | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 18 | s-first-party-api-get-search | S | first-party API GET /search | 2/8 (reach 8/22) | data-fed | needs-business-decision | pending | off-origin-data | datasource ownership / same-origin routing on production |  |
| 19 | t-unknown-third-party-host-shop-app | T | unknown third-party host shop.app | 8/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 20 | t-unknown-third-party-host-www-paypalobjects-com | T | unknown third-party host www.paypalobjects.com | 1/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 21 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 1/8 | embed-passthrough | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |
| 22 | x-commerce-platform | X | commerce: platform | 8/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 23 | x-commerce-signals-cart-true-prices-4 | X | commerce signals (cart: true, prices: 4) | 4/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 24 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 3/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 25 | x-commerce-payments | X | commerce: payments | 1/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 26 | x-commerce-signals-cart-true-prices-5 | X | commerce signals (cart: true, prices: 5) | 1/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 6 row(s) — read-settings, settled-dom-snapshot, chrome-interaction, modal-loader, search-index-backed.
- **One owner decision batch:** 15 row(s) — which tier for the target host; consumer on the migrated pages? · production endpoint; interim capture ships now · scope of the locale trees · index-driven or editorially curated? · datasource ownership / same-origin routing on production · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **off-origin data** — 5
- **forms** — 5
- **register** — 5
- **interactive** — 3
- **tags** — 2
- **detect** — 1
- **capture** — 1
- **locale wave** — 1
- **listings** — 1
- **search** — 1
- **embeds** — 1
