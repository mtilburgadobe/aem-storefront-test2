<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-10-10T14:50:00Z source=https://t8bnc1-5b.myshopify.com evidence=stardust/current/pages/*.json -->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — Shopify Online Store 2.0, Horizon theme (`/cdn/shop/t/1`), German storefront (`lang="de"`), EUR, markets Deutschland + Österreich.

## Users

_provenance: inferred_ — basis: catalog and collection titles.
Shoppers looking for sports gear in Germany and Austria: running, cycling, team sports, fitness, outdoor, water and winter sports, golf, tennis, fan apparel.

## Product Purpose

A small direct-to-consumer storefront ("Mein Shop") that sells sports equipment and apparel. The home page invites browsing ("Browse our latest products" → "Shop all") and lists the products; each product page sells one item with quantity + add to cart + PayPal express checkout.

## Positioning

_provenance: inferred_ — basis: collection SEO titles ("Running Gear & Equipment - Shop Running Essentials", …). A generalist sports shop; the store is young (4 products, 10 of 11 collections empty).

## Capabilities and Constraints

- Catalog, prices, inventory, cart, checkout, customer accounts: Shopify (Storefront API + hosted checkout + hosted customer accounts at `shopify.com/110471348549/account`).
- Forms: contact (`/contact`, `form_type=contact`) and newsletter (`/contact`, `form_type=customer`) post to Shopify.
- Search: Shopify `/search` (products) + predictive search modal in the header.
- Localization: country selector (Deutschland, Österreich — both EUR).
- Policies: only the privacy policy is published (`/policies/privacy-policy`); other `/policies/*` are 404.

## Brand Commitments

Register: `brand` (retail storefront, theme defaults). Personality: neutral, monochrome, product-first — black on white, Inter throughout, generous whitespace, 14px rounded buttons. Anti-references: none observed (default theme styling).

## Evidence on Hand

- `stardust/current/pages/<slug>.json` + `.html` — 22 live renders (Playwright, 200).
- `stardust/current/assets/screenshots/` — 1440 full-page captures.
- `stardust/current/assets/fonts/` — Inter 400/500/700 (+ italics), OFL.
- `stardust/current/css/` — theme stylesheets (base.css, compiled styles.css) + inline per-page styles.
- `stardust/current/_computed-styles.json` — census at 1440 and 360.

## Product Principles

_provenance: inferred_ — Let the product imagery carry the page; keep chrome quiet; the cart and checkout are always one click away.

## Accessibility & Inclusion

Skip link ("Direkt zum Inhalt"), visually hidden h1 with the shop name, labelled icon buttons (Suchen, Konto, Warenkorb), German UI strings.
