<!-- stardust:provenance writtenBy=stardust:replica writtenAt=2026-10-10T14:47:00Z -->
# Inconsistency register — Mein Shop replica

No design audit was requested and the user supplied no design items: there are no taste or design-improvement entries. The entries below are **platform deltas** — places where the Shopify theme relies on running on the Shopify domain, so the Edge Delivery build has to work differently. Each one keeps the look and only changes how it works underneath.

## R-01 — Desktop page scroll container

- **Evidence:** `base.css` @463 `html:has(.page-wrapper), … body { height: 100dvh; overflow: hidden }` and @830 `.page-wrapper { height: 100dvh; overflow-y: auto }` at `min-width: 990px`; live `documentElement.scrollHeight` 900 vs footer bottom 1408 at 1440 (stardust/.work/h2.mjs).
- **Finding:** At ≥ 990px the theme scrolls inside `.page-wrapper` instead of the document. Window-scroll screenshots stop at one viewport, and the EDS shell (body > header/main/footer) has no such wrapper.
- **Minimal change:** The build scrolls the document. Live captures are taken with document scroll restored (capture shim, live origin only). Nothing else changes: same header, same sticky behaviour, same layout.
- **Status:** applied
- **Where:** all page types, ≥ 990px.

## R-02 — PayPal express button on the product page

- **Evidence:** PDP buy box `shopify-accelerated-checkout` ("Mit PayPal zahlen", yellow PayPal button), captured `products-*.html`; CSP of the build origin can't host Shopify's wallet iframe, and the wallet SDK only works on the shop's own domain.
- **Finding:** Shopify's accelerated-checkout web component can't run off the Shopify domain.
- **Minimal change:** Render the same yellow "Mit PayPal zahlen" button. On click it creates a Storefront API cart with the selected variant and quantity, then sends the shopper to the cart's hosted `checkoutUrl`, where PayPal is offered. The PayPal popup no longer opens in place.
- **Status:** applied
- **Where:** product.

## R-03 — "Weitere Bezahlmöglichkeiten" link

- **Evidence:** PDP link under the PayPal button (`shopify-accelerated-checkout` more-options trigger).
- **Finding:** Opens Shopify's wallet chooser, which has the same off-domain limitation as R-02.
- **Minimal change:** Same link text and style. It follows the R-02 handoff (cart → hosted checkout), where every payment method is listed.
- **Status:** applied
- **Where:** product.

## R-04 — Shop app / Shop Pay sign-in surfaces

- **Evidence:** `shop-cart-sync`, `shop.app` iframe (blocked by CSP even on the live site — console "Framing 'https://shop.app/' violates … frame-ancestors"); invisible on the captures.
- **Finding:** Shopify-domain-only integrations with no visible UI in the captured state.
- **Minimal change:** Not rendered. Shop Pay stays available inside the hosted checkout.
- **Status:** applied
- **Where:** all page types (invisible).

## R-05 — Privacy-policy column overflows the viewport below 585px

- **Evidence:** live /policies/privacy-policy at 360: root scrollWidth 537 (+177px). `.shopify-policy__container` is a fit-content flex item whose min-content is the unbreakable 48px h1 "Datenschutzerklärung" (497px). measure.mjs 360 root line; gates/policies-privacy-policy-360 (pixel 14.93%, Δh −4250px).
- **Finding:** A defect on the source: on phones the whole policy text runs 177px past the right edge, which forces horizontal scrolling. The gate's hard overflow assert forbids reproducing it.
- **Minimal change:** The column is capped at the viewport (max-width 585px) and the h1 breaks with `overflow-wrap`, as it already does at 1440. The text reflows to the screen width, so the page is taller at 360. Nothing changes at ≥ 585px.
- **Status:** applied
- **Where:** policy, < 585px.
