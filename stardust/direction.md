<!-- stardust:provenance writtenBy=stardust:replica writtenAt=2026-10-10T14:47:00Z -->
# Direction — preserve mode (replica)

- **Mode:** preserve. No redesign direction was chosen; `stardust direct` was not run.
- **Promoted verbatim (full-prep branch):** `stardust/current/PRODUCT.md` → `PRODUCT.md`, `stardust/current/DESIGN.md` → `DESIGN.md`, `stardust/current/DESIGN.json` → `DESIGN.json` (byte-identical, 2026-10-10).
- **Provenance:** `extract --prep --dynamics` over 22 live pages of https://t8bnc1-5b.myshopify.com (Shopify Horizon theme).
- **Target breakpoints:** none — the source's 750px / 990px switch points are kept.
- **Inconsistency register:** `stardust/replica/inconsistency-register.md` — platform deltas only (no audit run, no user-supplied design items).
- **Commerce backend:** Shopify stays the system of record for catalog, price, inventory, cart, checkout and customer accounts; AEM composes the pages (see `stardust/dynamic-features-plan.md`).
