# Journal — Mein Shop replica (t8bnc1-5b.myshopify.com → AEM Edge Delivery)

## Extract — 22/22 storefront routes captured live (2026-10-10)

- Flow: replica (keep design), hands-off. Source: Shopify Horizon theme, German, EUR.
- Discovery: sitemap (16) + Shopify routes (/collections, /collections/all, /collections/frontpage, /search, /cart, /pages/contact, /policies/privacy-policy). /account → hosted Shopify customer accounts (link-out). Other /policies/* 404.
- Environment: egress proxy re-signs TLS → Chromium launched with a run-local shim (`stardust/.work/tls-preload.mjs`, via NODE_OPTIONS); no branded Chrome in the image.
- Trap found: at ≥ 990px the theme scrolls inside `.page-wrapper` (html/body 100dvh, overflow hidden) — full-page captures saw 900px only. Live captures now restore document scroll (register R1).
- Census at 1440 + 360, cap probe (content max 1440px; policy shell 585px, contact form 672px), Inter woff2 ×6 saved (OFL).
- Page types: landing 1 · listing 14 (collection 12, collection-list 1, search 1) · unique 6 (product 4, cart 1) · form 1 · static 1.

## Preserve direction — spec promoted verbatim, 4 platform-delta register entries, 13 dynamic features triaged (2026-10-10)

- PRODUCT.md / DESIGN.md / DESIGN.json promoted byte-identical; direction.md records preserve mode; no target breakpoints.
- Register: R-01 desktop scroll container → document scroll; R-02 PayPal express → cart + hosted checkout; R-03 more payment options → hosted checkout; R-04 Shop app surfaces not rendered. No design/taste items.
- Dynamics: 26 detector rows curated to 13 features, every row has a disposition. Shopify Storefront API (2026-01, CORS) feeds catalog/search/facets/recommendations; cart via Storefront cart mutations; checkout + accounts hosted. Contact + newsletter post natively to Shopify /contact; curl posts get Shopify's "Verifying your connection" bot check (403), so the handoff gets verified in a real browser.
- Decision batch (hands-off, interim shipped): public token in the DA sheet `/shopify-config`; owner approval for one live contact / newsletter submission; analytics on the new host.

## Recreate + source-fidelity gate — 8 page types (10 prototypes) gated at 1440 and 360 (2026-10-10)

- Canon (styles/shopify.css, shop-header/footer/hero/product-grid CSS) built and gated with the home archetype: 0.03 % / 0.08 % pixel, Δh 0, 0 structural red, cap-probe PASS.
- Fan-out (3 agents, one interrupted by a service restart and resumed): collections-all 0.02/0.09 %, collections-running 0.02/0.22 %, collections 0.01/0.19 % (cap-probe 2/3 FAIL = section-pairing artefact, accepted residual), search 0.03/0.11 %, search-running 0.02/0.08 %, product 0.60/0.17 %, cart 0.00/0.11 % (+ filled cart 0.02/0.13 % vs a same-session capture), contact 0.00/0.09 %, policy 0.00 % at 1440; at 360 14.93 % / −4250px from a live overflow bug → register R-05.
- Interaction parity: drawers, search modal, cart drawer, currency popover, facets/sort/grid toggle, quantity, sticky add-to-cart, hovers — observed on live, implemented, compared.
- Residuals: R-index-1 (one off-screen checkmark icon inside the closed drawer on live, shifts icon pairing at 360), keyframe renames for lint, canon requests queued in stardust/replica/canon-requests.md.

## Handoff — code on branch shopify-replica, 24 documents + config sheet in DA, published; all-pages gate 22/22 at 1440, 21/22 at 360 (2026-10-11)

- Foundation: scripts/shopify/{page,storefront,cart}.js; scripts.js imports commerce.js only on non-Shopify pages; head.html boots/preloads Adobe Commerce only when the page is not `template: shopify`. Regression check: a non-Shopify page still requests commerce.js, initializers and drop-ins; Shopify pages request none (8/8 page types on preview, 0 console errors).
- Blocks: shop-header, shop-footer, shop-hero, shop-product-grid, shop-collection, shop-collection-list, shop-product, shop-search, shop-cart, shop-contact, shop-policy. Live behaviour checked: card quick add and PDP add to cart do not open the drawer.
- Content: thin shells via tools/importer/import-shopify.js + run-bulk-import (chrome documents via ?eds-doc=); staged to DA source format, PUT 201, preview 200, live 200, 0 about:error. /shopify-config.json sheet published (token empty → tokenless).
- Published-origin gate (gate-all, branch host): 1440 22/22 PASS (product pages 0.61–0.64 % after the recommendations-rail spacing fix, all others ≤ 0.03 %); 360 21/22 PASS (products 0.09–0.19 %), the one FAIL = policy, register R-05 (live overflow bug).
- Local lint uses stardust/.work/eslintrc.local.cjs: the repo's node_modules can't load eslint-plugin-import / babel parser (missing es-abstract/browserslist files); CI runs the full config.
