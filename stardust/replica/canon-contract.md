# Canon contract: Mein Shop replica prototypes → EDS blocks

This is the agreement every archetype prototype and every Phase 5 block follows. The prototypes are written in **EDS-decorated form** and link the **real project CSS files**, so the CSS they pass the gate with is the CSS that ships. Converting to blocks then only adds block JS that produces the same DOM.

## Environment (sandbox specifics: always do this)

- Every Playwright-based instrument (stardust scripts, ad-hoc probes) runs with
  `export NODE_OPTIONS="--import $PWD/stardust/.work/tls-preload.mjs"` from the repo root
  `/backups/mtilburgadobe/aem-storefront-test2/repo`. The shim accepts the sandbox proxy's TLS CA, falls back from branded Chrome to bundled Chromium, and on the LIVE origin only restores document scroll (register R-01: the theme scrolls inside `.page-wrapper` at ≥ 990px).
- Run stardust scripts from the project copies: `node stardust/scripts/replica/<x>.mjs`, `bash stardust/scripts/replica/gate.sh …`. Plugin references (read by section only):
  `/home/node/.excat-marketplaces/excat-extended/stardust/skills/replica/reference/*.md`.
- Never `npm install`, never `npx playwright install`, never write into `/home/node/.excat-marketplaces`.
- ONE static server is already running: `http://localhost:8791/` = the repo root (python http.server). Never start or kill another one. Prototype URL: `http://localhost:8791/stardust/prototypes/<slug>-proposed.html`.
- Long instruments go through `node stardust/scripts/replica/run-bg.mjs start --name <job> -- <cmd>`, then `run-bg.mjs wait` (≤ 100 s slices; exit 75 = still running, call `wait` again).

## Live source

`https://t8bnc1-5b.myshopify.com` (Shopify Horizon theme, German, EUR). The captured content is in `stardust/current/pages/<slug>.json` + `.html` (rendered DOM), the theme CSS in `stardust/current/css/` (`base.css`, `compiled-styles.css`, `inline-<slug>.css` holding the `:root` tokens), and the fonts in `/fonts/inter-{normal,italic}-{400,500,700}.woff2` (Inter, OFL; `@font-face` lives in `styles/shopify.css`).
Live product data changes (for example, the helmet price was €89,99 at crawl and €99,99 at measure time). In prototypes, use the data the live page shows *now*; at delivery it comes from the Storefront API.

## Page skeleton (every prototype)

```html
<!doctype html><html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>…verbatim…</title>
<link rel="stylesheet" href="/styles/styles.css">          <!-- boilerplate, unchanged, ships on every page -->
<link rel="stylesheet" href="/styles/shopify.css">         <!-- canon: tokens, base type, section grid, buttons, inputs -->
<link rel="stylesheet" href="/blocks/shop-header/shop-header.css">
<link rel="stylesheet" href="/blocks/shop-footer/shop-footer.css">
<link rel="stylesheet" href="/blocks/<block>/<block>.css">  <!-- one per block used on the page -->
</head>
<body class="shopify appear">
<header class="shop-header-wrapper"><div class="shop-header block" data-block-name="shop-header" data-block-status="loaded"> … </div></header>
<main>
  <div class="section" data-section-status="loaded">          <!-- one per authored section -->
    <div class="<block>-wrapper"><div class="<block> block" data-block-name="<block>" data-block-status="loaded"> … </div></div>
    <div class="default-content-wrapper"> … </div>               <!-- default content (headings / text) -->
  </div>
</main>
<footer class="shop-footer-wrapper"><div class="shop-footer block" data-block-name="shop-footer" data-block-status="loaded"> … </div></footer>
</body></html>
```

- `body.shopify` scopes everything. **Every rule in `styles/shopify.css` starts with `body.shopify`** (or `.shopify`), and every block rule starts with `.<block>`. Nothing may change the look of non-Shopify (Adobe Commerce) pages.
- `styles/styles.css` (boilerplate) stays untouched. It sets `html { font-size: 62.5% }`, so **author in px, never rem**, and override its body / heading / `a` / `p` / `main > .section` rules inside `body.shopify`.
- Block names (new, namespaced, never the boilerplate's `header`/`footer`/`hero`/`cards`):
  `shop-header`, `shop-footer`, `shop-hero`, `shop-product-grid`, `shop-collection`, `shop-collection-list`, `shop-product`, `shop-search`, `shop-cart`, `shop-contact`. Policy pages are default content.
- Classes inside a block are BEM-ish under the block name (`.shop-product-grid__card`). Never use `<block>-container` / `<block>-wrapper` inside a block.
- The DOM of each block is the **contract its JS must reproduce**. Write it down at the top of the block's CSS file as a comment (a short outline of the elements and classes), so Phase 5 can implement the JS from it.
- Icons: inline SVG lifted from the live DOM (`stardust/current/pages/*.html`), with the same viewBox and stroke.
- Images: Shopify CDN URLs as the live page uses them (the runtime fetches the same CDN). The hero illustration is the theme's placeholder SVG (`stardust/current/assets/media/hero-placeholder.svg`, `preserveAspectRatio="xMaxYMid slice"`). At delivery it is an authored image, so in the prototype render it as an `<img>` with `object-fit: cover; object-position: 100% 50%`.

## Canon API (established by the home archetype; reuse, never fork)

- **Skeleton amendment.** The live theme renders the announcement bar *outside* `<header>` and the search modal + cart drawer at `<body>` level, and the gate's chrome roots compare `header`/`footer` literally. So every prototype puts `aside.shop-header-announcement` immediately before `<header class="shop-header-wrapper">`, and `div.shop-header-search#shop-header-search[hidden]` + `div.shop-header-cart#shop-header-cart[hidden]` after `<footer>` (Phase 5: shop-header block JS inserts these portals). Copy the header/footer/portal markup verbatim from `stardust/prototypes/index-proposed.html`; the full DOM contract is the comment at the top of each block CSS.
- **Sticky header** lives in `styles/shopify.css` (`body.shopify > header { position: sticky; top: -1px }`); no scroll morph fired live, so no JS.
- **Page grid:** `padding-inline: var(--shop-gutter)` on a full-width element (content column max `--shop-content-width` 1440px; margin `--shop-page-margin` 16px, 40px ≥ 750px). EDS wrappers are reset to full width.
- **Section spacing:** multiply theme paddings by `--shop-spacing-scale` (0.7 below 750px, 1 above), e.g. `calc(48px * var(--shop-spacing-scale))`.
- **Type:** `h1`–`h6` (and `.shop-h1`…`.shop-h6`) carry the theme presets with `text-wrap: balance`; `p` gets `text-wrap: pretty` (theme text-blocks). Body 14px/1.6 Inter. "Section heading" roles in the theme are usually the h4 preset (24px/1).
- **Buttons/inputs:** `.shop-button` + `--primary` / `--secondary`; `.shop-input`; `.shop-visually-hidden`.
- **Specificity rule:** block selectors must be at least two classes (`.shop-x .shop-x__el`) to beat the boilerplate `a:not(.dropin-design a)` rule that `body.shopify a` resets; style link `:hover` per block.
- **States are attributes** (`[hidden]`, `[data-open]`, `data-overlay`, `aria-expanded`); `body.shop-drawer-open` pushes the page 480px at ≥ 750px (cart drawer). Keyframes reuse the theme's names where kebab-case (`drawer-slide-in`, `menu-drawer-nav-open`, `search-element-slide-in-bottom`, `search-element-slide-up`).
- **Hero/height model:** heights tied to the viewport use the theme model (`--shop-section-height-medium` 400px / 55svh ≥ 640 / 65svh ≥ 960, minus `--shop-header-group-height` 103px / 111px ≥ 750).
- Custom properties: see the `body.shopify { --shop-* }` token block at the top of `styles/shopify.css`.

## Breakpoints

Source switch points are kept: **750px** and **990px** (plus the theme's 1200/1400 grid steps where measured). Mobile-first `min-width` queries.

## Gate (per archetype, per breakpoint 1440 and 360)

Follow `replica/reference/source-fidelity-gate.md` (read it by section with `section.mjs`). Pass bar: pixel ≤ 10 % full-page with no unexplained hot band, |Δh| ≤ 8px, content-diff 0 structural 🔴, clip-probe `Clipped: 0`, no horizontal overflow, `cap-probe … --against` PASS. At most 3 iterations per breakpoint; log the residuals after that.
Evidence lands in `stardust/replica/gates/<slug>-<width>/`. Record per-archetype results in `stardust/replica/progress.json` (merge, never clobber other archetypes' keys).
Pass `--main main` on both sides (the live content root is `main#MainContent`; the prototype's is `main`).
