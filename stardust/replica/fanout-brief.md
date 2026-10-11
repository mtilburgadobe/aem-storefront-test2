# Fan-out brief: archetype prototypes after the canon (shared by every archetype agent)

Repo root (cwd): /backups/mtilburgadobe/aem-storefront-test2/repo

1. Read stardust/replica/canon-contract.md in full: the environment, the skeleton and the **Canon API** section.
   - Always `export NODE_OPTIONS="--import $PWD/stardust/.work/tls-preload.mjs"` before running any Playwright-based script.
   - The server on http://localhost:8791/ serves the repo root. Never start or kill servers.
   - Never run `npm install` or `npx playwright install`, and never write under /home/node/.excat-marketplaces.
2. The canon is FROZEN and owned by the home archetype: styles/shopify.css, blocks/shop-header/*, blocks/shop-footer/*, blocks/shop-hero/*, blocks/shop-product-grid/*. Do NOT edit them. Reuse them instead:
   - Copy the header, footer, announcement and portal markup verbatim from stardust/prototypes/index-proposed.html.
   - Use the product-card markup and classes of shop-product-grid for every product tile.
   - If the canon is wrong for your page (the live chrome differs, a token is missing), compensate in your own block CSS scoped to your block, AND append one line to stardust/replica/canon-requests.md: "<archetype>: <file> — <change> — <evidence>".
3. Read the reference docs by section only (`node stardust/scripts/replica/section.mjs <doc> --list`, then one heading per call):
   - /home/node/.excat-marketplaces/excat-extended/stardust/skills/replica/reference/recreation-procedure.md
   - /home/node/.excat-marketplaces/excat-extended/stardust/skills/replica/reference/source-fidelity-gate.md
   - /home/node/.excat-marketplaces/excat-extended/stardust/skills/stardust/reference/scripts-index.md

   Reading discipline: html-slice.mjs for captured HTML, css-rules.mjs for CSS, json-query.mjs for JSON, measure.mjs (--against) for live-vs-prototype boxes, run-bg.mjs for gate rounds. Look at images only as small crops.
4. Captures are in:
   - stardust/current/pages/<slug>.json + .html
   - stardust/current/css/ (base.css, compiled-styles.css, inline-<slug>.css)
   - stardust/current/assets/screenshots/<slug>.png

   Copy content verbatim (German as-is). For product data, use what the live page shows NOW. It changes, and at delivery it comes from the Storefront API at runtime.
5. Author per archetype: stardust/prototypes/<slug>-proposed.html (canon skeleton) plus your own block CSS (blocks/<block>/<block>.css; CSS only, NO JS files).
   - Put a DOM-contract comment at the top of the CSS: the element/class outline the Phase 5 block JS must reproduce, including which nodes come from Shopify data and which from AEM authoring.
   - Author in px. Scope every rule `.<block> …`, with ≥ 2 classes wherever it competes with the boilerplate link rules.
   - Write mobile-first min-width queries at the theme's own switch points (750 / 990, plus measured grid steps).
6. Gate each archetype at 1440 AND 360, per the gate doc:
   `bash stardust/scripts/replica/gate.sh <slug> <live-url> http://localhost:8791/stardust/prototypes/<slug>-proposed.html <w> iter1 --full --main main`
   - Run it through run-bg: start both widths, then `wait`.
   - Pass bar: pixel ≤ 10 % with no unexplained hot band, |Δh| ≤ 8px, content-diff 0 structural 🔴, clip-probe Clipped: 0, no overflow.
   - Then `node stardust/scripts/replica/cap-probe.mjs <live-url> --against <proto-url> --design DESIGN.json --slug <slug> --main main` must PASS.
   - At most 3 fix iterations per breakpoint, then log the residuals. Finish with a --full confirmation round.
   - Interaction parity: run motion-observe on live and on the prototype with the same --click/--hover pokes, for the behaviours your page owns (not the canon chrome; that's done). Then run motion-compare and implement only what fired. A small inline <script> in the prototype is fine; document it in the DOM-contract comment for Phase 5.
7. Record results in stardust/replica/progress-<slug>.json, one file per archetype. Never edit progress.json or another archetype's file. Shape: {archetype, iterations:{1440,360}, gates:{1440:{pixel,heightDelta,structuralRed,clipped,overflow},360:{…}}, capProbe, residuals:[], motion:{observed,implemented,dead}}.
   Do not edit state.json, the ledger, the journal, scripts/, head.html or the boilerplate blocks.
8. This is recreation, not redesign: no DOM copying, no porting of page-level theme CSS, no "improvements". Lift values from the theme CSS and the measurements; use the screenshots for composition.
9. RETURN (≤ 30 lines per archetype):
   - per-breakpoint verdicts (pixel %, Δh, structural 🔴, clipped, overflow, cap-probe)
   - iterations used and residuals
   - motion summary
   - files written and canon requests filed
   - the block DOM contract in one paragraph (which elements are driven by Shopify data)
