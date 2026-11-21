# Tee Box: Tailored Improvement Programme landing page

Static HTML/CSS/vanilla JS build of the Figma frame **Landing Page - Fitting** (file `TeeBox`, node `8642:688`), for integration into the existing WordPress theme.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup. Sections are commented with their Figma node IDs. |
| `css/teebox-landing.css` | All styles. Every class is prefixed `tb-`; design tokens are CSS custom properties on `:root`. |
| `js/teebox-landing.js` | Mobile nav toggle only (about 30 lines, no dependencies). |
| `js/teebox-grid.js` | Dev only: press **G** on localhost to toggle a layout grid overlay (12/8/4 columns at desktop/tablet/phone, matching the page margins). Safe to delete along with its `<script>` tag. |
| `assets/images/` | Photography exported from Figma (2000px wide JPEGs). |
| `assets/icons/` | SVG logo, social icons, Google G, stars and nav chevrons. |

## Integration notes

- **Fonts:** Poppins (300/400/500/600) and Geist (300/400) from Google Fonts. Poppins is for headings, nav, buttons and labels; Geist is for all paragraph copy (see the "Typography: body copy" block at the end of the CSS). Drop the `<link>` if the theme already enqueues these.
- **Header:** the header is absolutely positioned over the hero with a 243px black-to-transparent fade, which suits this page template. If the theme's global header is used instead, keep the overlay behaviour on this template.
- **Breakpoints:** ≥1500 centred nav (as designed) · 1280–1499 nav flows between logo and buttons · <1280 hamburger menu · <1024 single-column sections · <600 small-phone type and spacing.
- **Base resets** are wrapped in `:where(.tb-page)`, so they have zero specificity and are scoped to `body.tb-page`. Add that class to the template's `<body>` (or change the selector).
- **Primary button hover:** gold buttons (`.tb-btn--gold`, label wrapped in a `<span>`) are a sideways, square-cornered take on Codrops "Button Hover Styles" #1 (Pan), with a 2px gold outline. On hover the gold fill, with its black label, wipes out to the right, leaving a gold label in the outline. On mouse-out it wipes back in from the left, so it always travels left to right. `js/teebox-landing.js` (section 6) adds a black-on-gold copy of the label (`.tb-btn__fill`) and toggles `is-wipe-out` / `is-wipe-in`, and the wipes are CSS keyframes. It also runs on keyboard focus. Without JS, or with reduced motion, it falls back to a plain CSS hover swap.
- **Links:** every `href="#"` is a placeholder (nav, CTAs, pricing, legal and social).
- **Dropdowns:** "Improvement plan" and "Golf lessons" show chevrons in the design but no dropdown content, so they're plain links. Wire them to the theme's existing menus.
- **Images:** the exports are about 3MB each. Upload them to the Media Library so WordPress generates `srcset` sizes, or compress them before use.

## Open items in the design

- Steps 2–5 in "How our programmes work" still use lorem ipsum.
- "Your programme at a glance" isn't designed in Figma yet. It's built here as a 12-week timeline with two pill groups. **Lessons** (6 / 12 / 24) are spread evenly: one every two weeks, one a week, or two a week. **Practice membership** (Silver 5, Gold 8, Platinum 16 sessions a month) gives 15 / 24 / 48 practice sessions, spread evenly across the 12 weeks, matching the pricing brief. `js/teebox-landing.js` section 2 plots the dots from the pills' `data-lessons` and `data-per-month` values. Practice dots shrink slightly when there are more than 30.
- The intro under the hero (`.tb-plan`, #101010) is one centred lockup (headline and a single paragraph). Then one #191919 section (`.tb-pillars-section`) holds the "Structured programmes to keep you focused" subheadline, the three essentials as stacked rows (`.tb-pillars`, Streamline 3.0 icons in brand gold; source SVGs in `assets/icons/streamline/`, so check the Streamline licence or attribution terms for your plan), the "Also part of your programme" subheadline with eight #101010 value-add cards (`.tb-extras`, which fade up one after another the first time they scroll into view via `[data-tb-essentials]` in the JS), and the CTA.
- **Value-add card copy needs sign-off.** From Liam's brief: one purchase, coach-recommended plan, rolling onto membership after week 12, and the workbook/journal (badged "Coming spring 2027"). From the current site but not yet tied to the programme by Liam: data and video after lessons, skills tests/Trackman Combine, guest passes (2 Silver / 4 Gold), member golf days, Order of Merit and two City locations.
- The CSS and JS links in `index.html` carry `?v=` numbers to beat browser caching during review; WordPress's enqueue versioning replaces this.
- A CTA lockup (`.tb-cta`) closes the essentials section, just above the press quote. The headline is from the live site's "Ready to improve" block; the subtext and button label are adapted to point at the free swing evaluation. The button `href` is a placeholder.
- The GolfMagic press quote (Figma 8665:1080) sits between the value-add cards and "How our programmes work". It's trimmed to ~594px tall (Figma: 740px). Its background photo is `assets/images/testimonial-bg.jpg` at 30% opacity over black, with a gentle parallax drift on scroll (`[data-tb-parallax]` in the JS, distance set by `--tb-parallax`), and the GolfMagic logo SVG came from the Figma file.
- **Pricing (`#pricing`, after the 12-week timeline)** follows the updated pricing brief (inc. VAT, standard £100 lesson rate), using card styling from Figma 3770:3843. There are three cards (6 / 12 / 24 lesson plans, with 12 marked "Most popular") and a Silver / Gold / Platinum pill switcher (5 / 8 / 16 practice sessions a month). Each card stores its three tiers' figures in `data-prices` (price, "bought separately" price, monthly instalment), and `js/teebox-landing.js` section 7 swaps them in. Without JS the pills stay hidden and the Silver prices show. All figures were checked against the brief's method: lessons at £120 + 3 months of the tier + the £79 joining fee. Each card lists the plan's benefits. The wording "Free custom fitting worth £100" is intentional, though the brief lists the fitting and the £100 voucher separately. The small print covers VAT, three-instalment payment, six-month lesson validity, the "bought separately" method and rolling onto membership, and a members' line shows lessons-only prices (£600 / £1,200 / £2,400). **Not shown:** coach-specific rates such as Carl at £120/lesson. The hero "See pricing" link jumps here.
- **Pricing CTA band** (`.tb-price-cta`, straight after the pricing): full-width brand gold, "Plans from £315 a month" (the Silver 6-lesson £945 ÷ 3), "Save up to £511…" and a reversed black button (`.tb-btn--gold.tb-btn--dark`). It uses the same left-to-right wipe, with black in place of gold. The button colours are custom properties (`--tb-btn-fill`, `--tb-btn-fill-text`), so further variants only need those two values.
- **Coaches slider removed for now** to keep the page shorter. The review slider (copied from tee-box.co.uk/golf-lessons-london/) stays above the footer. It uses native scroll-snap with prev/next buttons and doesn't autoplay, and its "362 reviews" count is hard-coded. The coach photos (`assets/images/coaches/`) and the `.tb-coach*` styles are kept in case the coaches return.
- **Footer** is rebuilt from the live tee-box.co.uk footer: gold logo (`assets/images/teebox-logo-gold.png`), Play indoor golf / Golf lessons / More at Tee Box link columns, contact details for both sites, the company line, legal links and social icons. It uses the live site's relative URLs. Since it's the site-wide footer, the agency should use the theme's existing footer rather than this copy.
- Large empty areas in the Figma frame (below "three essentials" and above the venue image) have been left out.
- The hero line "Our expert fitters… conduct your fitting" looks carried over from a fitting page. Worth checking with copy.
- Footer reads "© 2023 Tee Box" (same as the live site).
