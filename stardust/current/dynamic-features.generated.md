# Dynamic features — detected (2026-10-10T14:47:38.642Z)

Pages probed: /, /collections/all, /collections, /products/trail-running-shoes, /search, /cart, /pages/contact, /policies/privacy-policy · settle 5000 ms · width 1440 · reach from 22/22 crawled pages

Evidence only. Every row must receive a disposition in `stardust/dynamic-features.md` (`dynamics-plan.mjs` drafts it).

| id | class | feature | pages | reach | evidence | hint |
|---|---|---|---|---|---|---|
| a-first-party-api-post-api-2026-01-graphql-json | A API / personalisation / settings | first-party API POST /api/2026-01/graphql.json | 8/8 | 22/22 | POST /api/2026-01/graphql.json → 200 | api |
| a-first-party-api-post-api-collect | A API / personalisation / settings | first-party API POST /api/collect | 8/8 | 22/22 | POST /api/collect → 204 | api |
| a-cms-app-settings-object-shopify | A API / personalisation / settings | CMS / app settings object Shopify | 8/8 |  | shopJsCdnBaseUrl<br>ce_forms<br>analytics | settings |
| a-first-party-api-post-well-known-shopify-fec-produce | A API / personalisation / settings | first-party API POST /.well-known/shopify/fec/produce | 4/8 | 18/22 | POST /.well-known/shopify/fec/produce → 200 | api |
| a-first-party-api-post-api-event-collect | A API / personalisation / settings | first-party API POST /api/event/collect | 1/8 |  | POST /api/event/collect → 200 | api |
| cr-client-rendered-slot-product-recommendations | CR client-rendered | client-rendered slot product-recommendations | 1/8 |  | data-url=/recommendations/products?limit=4 | client-rendered |
| f-form-contact-form-origin-contact-1-fields | F form | form "contact_form" → origin /contact (1 fields) | 8/8 |  | email:contact[email]<br>form_type,utf8 | forms |
| f-form-facetfiltersform-template-32544931774789-main-desktop | F form | form "FacetFiltersForm--template--32544931774789__main-desktop" → origin /collections/all (16 fields) | 1/8 |  | checkbox:filter.v.availability,checkbox:filter.v.availability,text:filter.v.price.gte,text:filter.v.price.lte,select:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by | forms |
| f-form-facetfiltersform-template-32544931774789-main-overflo | F form | form "FacetFiltersForm--template--32544931774789__main-overflow" → origin /collections/all (14 fields) | 1/8 |  | checkbox:filter.v.availability,checkbox:filter.v.availability,text:filter.v.price.gte,text:filter.v.price.lte,select:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by,radio:sort_by | forms |
| f-form-ref-node-origin-cart-add-1-fields | F form | form "ref: <Node>" → origin /cart/add (1 fields) | 1/8 |  | number:quantity<br>form_type,utf8,id,product-id,section-id | forms |
| f-form-contactform-aqytpbfn3u0liefnct-contact-form-uwickq-or | F form | form "ContactForm-AQytPbFN3U0lieFNCT__contact_form_UwiCkQ" → origin /contact (4 fields) | 1/8 |  | text:contact[name],email:contact[email],tel:contact[phone],textarea:contact[body]<br>form_type,utf8,contact[id] | forms |
| i18n-locale-variants-en | I18N locale | locale variants en | 1/8 |  | https://privacy.shopify.com/en | locale |
| l-listing-candidate-11-cards | L listing | listing candidate 
  (11 cards) | 1/8 |  |  | listings |
| m-modal-trigger-aria-haspopup-chrome-only-theme-drawer-conte | M modal / interactive | modal trigger aria-haspopup (chrome only) → theme-drawer:content | 6/8 | 99/22 | Suche<br>Mehr<br>Warenkorb 0 | chrome-interaction |
| m-modal-trigger-aria-haspopup-theme-drawer-content | M modal / interactive | modal trigger aria-haspopup → theme-drawer:content | 1/8 | 99/22 | Suche<br>Mehr<br>Warenkorb 0 | modal |
| m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M modal / interactive | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 1/8 | 99/22 | Suche<br>Mehr | chrome-interaction |
| s-site-search-form-search | S search | site search form → /search | 8/8 | 1/22 | search:q | search |
| s-first-party-api-get-search | S search | first-party API GET /search | 2/8 | 8/22 | GET /search?q,resources[type],section_id → 200<br>GET /search?section_id → 200 | search |
| t-unknown-third-party-host-shop-app | T tag / consent | unknown third-party host shop.app | 8/8 |  | shop.app | inspect |
| t-unknown-third-party-host-www-paypalobjects-com | T tag / consent | unknown third-party host www.paypalobjects.com | 1/8 |  | www.paypalobjects.com | inspect |
| v-iframe-without-src-runtime-injected-embed | V media | iframe without src (runtime-injected embed) | 1/8 |  | PayPal-paypal<br>0×0 | embed-runtime |
| x-commerce-platform | X auth / commerce | commerce: platform | 8/8 |  | cdn.shopify.com<br>otlp-http-production.shopifysvc.com<br>monorail-edge.shopifysvc.com | decided-out |
| x-commerce-signals-cart-true-prices-4 | X auth / commerce | commerce signals (cart: true, prices: 4) | 4/8 |  |  | decided-out |
| x-commerce-signals-cart-true-prices-0 | X auth / commerce | commerce signals (cart: true, prices: 0) | 3/8 |  |  | decided-out |
| x-commerce-payments | X auth / commerce | commerce: payments | 1/8 |  | www.paypal.com | decided-out |
| x-commerce-signals-cart-true-prices-5 | X auth / commerce | commerce signals (cart: true, prices: 5) | 1/8 |  |  | decided-out |
