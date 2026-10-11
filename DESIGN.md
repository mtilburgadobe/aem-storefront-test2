<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-10-10T14:50:00Z source=https://t8bnc1-5b.myshopify.com evidence=stardust/current/_computed-styles.json,stardust/current/css/inline-index.css -->
---
name: Mein Shop (current state — Shopify Horizon)
colors:
  background: "#ffffff"
  foreground: "#000000"
  input-border: "#dfdfdf"
  primary-button: "#000000"
  primary-button-hover: "#262626"
  muted: "rgba(0,0,0,0.6)"
typography:
  family: "Inter, sans-serif"
  paragraph: "0.875rem / 1.6, 400"
  h1: "clamp(3rem, 5.6vw, 3.5rem) / 1, 700"
  h2: "clamp(2.25rem, 4.8vw, 3rem) / 1, 700"
  h3: "2rem / 1.1, 700"
  h4: "1.5rem / 1, 700"
rounded:
  buttons: 14px
  inputs: 4px
  pills: 40px
spacing:
  page-width: 90rem (narrow)
  gaps: 0.5 / 0.7 / 0.9 / 1 / 1.25 / 2 / 3 rem
components:
  button-primary: "black fill, white text, 14px radius, 16px 24px"
  input: "white, 1px #dfdfdf ring, 4px radius"
---

# Design — current state

**Character.** Monochrome retail theme: white surfaces, black type, Inter at three weights (400 body, 500 subheadings/menu, 700 headings). Imagery sits on a light-grey (#f2f2f2) square; no shadows on cards; the only colour comes from product photos and the illustrated hero.

**Chrome.** Thin announcement bar ("Welcome to our store") over a white header: wordmark "Mein Shop" + inline menu (Startseite, Katalog, Kontakt) on the left, currency selector (EUR), search, account and cart icons on the right. Below 750px the menu collapses into a drawer. Footer: "Join our email list" newsletter with a pill email field, copyright line "© 2026 Mein Shop, Powered by Shopify" and a policies link.

**Layout.** Page width 90rem (narrow page setting), side gutters from the theme's section grid. Desktop (≥ 990px) scrolls inside `.page-wrapper` (see inconsistency register R1). Source breakpoints: 750px and 990px (plus a 1200/1400 product-grid step).

**Modules.** Full-bleed illustrated hero with centered heading + outlined "Shop all" button; 4-up product grid (2-up mobile) with title + price and a quick-add button; collection list grid with square images; product page two-column (media | buy box) with quantity stepper, black add-to-cart, PayPal button and rich description; empty-state blocks ("Keine Produkte gefunden.", "Dein Warenkorb ist leer").
