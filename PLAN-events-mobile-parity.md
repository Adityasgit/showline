# Events page — Mobile/Desktop content parity

## Context
`events.html` was built by adapting `exhibition.html`, and it inherited Exhibition's habit of
serving *different content* to mobile vs desktop via `hide-mobile` / `hide-desktop` spans and
mobile-only / desktop-only sections. The user wants the **desktop content to be the single source
of truth**: every heading, paragraph, and section that exists on desktop must also appear on mobile
(responsively re-laid-out, never dropped), and any section that exists *only* on mobile must be
removed. This is content parity only — the desktop design itself does not change.

Scope: **only `events.html` and `css/events.css`.** Do not touch `exhibition.html`,
`exhibition.css`, shared CSS, or JS. Keep reusing the shared carousel/FAQ JS (`js/exhibition.js`)
and existing class names.

## Divergences found (grep of `hide-mobile`/`hide-desktop` in `events.html`) and resolution

| # | Location | Desktop (keep) | Mobile now (change) | Action |
|---|----------|----------------|---------------------|--------|
| 1 | Hero frame `L71/75` | `.ex-hero__content` = "Events and Experiences" + subtitle "Creating Experiences That Inspire, Engage & Connect" | `.ex-hero__mobile-title` = title only | Show `.ex-hero__content` on all widths; delete `.ex-hero__mobile-title` |
| 2 | Hero body `L81/82/93/94` | `.ex-hero__title` "What do we create" + `.ex-hero__text` (2 paras) | `.ex-hero__mobile-lead` "What do We Provide?" + short D-Alu text | Show desktop title+text on all widths; delete `.ex-hero__mobile-lead` + `.ex-hero__mobile-text` |
| 3 | Who We Serve `L102` | full section (carousel of 5 cards) | hidden | Remove `hide-mobile`; add mobile CSS so the card carousel scrolls on mobile |
| 4 | Benefits `L191` | — (not on desktop) | mobile-only 01/02/03 list | **Delete section** (`.ev-benefits`) + its CSS |
| 5 | Event Management Services `L215` | full section (photo + 01–05 list) | hidden | Remove `hide-mobile` (already stacks ≤992) |
| 6 | Process `L257` vs How We Work `L307` | `.ex-process` "Our Event Delivery Process" + 8 `.ev-step`s | mobile-only `.ex-work` "How We Work" (4 steps) | Remove `hide-mobile` from `.ex-process`; **delete `.ex-work` section**; convert `.ev-steps` to a vertical 8-step list on mobile (below) |
| 7 | Modular `L351–357` | "Why Modular for Events?" + tag "Modern events demand speed…" | "Our Event Expertise" + tag "Smart, scalable…" | Collapse each to the single desktop span/paragraph |
| 8 | Contact `L525/526/528/534` | title "Let's Create Extraordinary Experiences" + 2-para intro | "Have a question? Let's talk." + email/phone block | **Unify to desktop** (per user): show desktop title + 2 paras on all widths; delete the mobile email/phone `<p>` |

**Left intentionally unchanged** (UI controls / decoration, not content): header CTA label
`L48/49` ("Get a free design"/"Get a Quote"), carousel arrows `.ev-modular__nav hide-mobile`
`L394`, decorative `.contact__watermark hide-mobile` `L521`. FAQ already uses one shared content
set — no change.

## The one non-trivial piece: Process steps on mobile (#6)
Desktop keeps the 4-col snake grid (rows: `01 02 03 04` / DOM `08 07 06 05`) with the curved
04→05 connector — **unchanged**. The current `.ev-steps__row { grid-template-columns: repeat(2,1fr) }`
tablet rule produces a broken visual order, so replace the ≤992 behaviour with a **single-column
sequential list** styled like the (now-deleted) How-We-Work rows:

- In `@media (max-width: 992px)` for `.ev-steps`:
  - `.ev-steps { gap: 1.25rem; }`
  - `.ev-steps__row { display: contents; }` — promotes all 8 `.ev-step`s to direct flex children of
    `.ev-steps` so they order in one column.
  - Assign `order` so the sequence is 01→08 despite DOM order `01 02 03 04 08 07 06 05`:
    `.ev-steps__row--line .ev-step:nth-child(1..4) { order: 1..4 }` and
    `.ev-steps__row:not(.ev-steps__row--line) .ev-step:nth-child(1)=order 8, (2)=7, (3)=6, (4)=5`.
  - `.ev-step { flex-direction: row; align-items: center; gap: 1rem; }` (circle left, label right).
  - Shrink circle for mobile: `.ev-step__num { width: 56px; height: 56px; font-size: 1.25rem; }`
    and `.ev-step__label { font-size: 1.125rem; }`.
  - Connectors already hidden via existing `.ev-steps__row .ev-step::after { display:none }`.
- Ensure `.ex-process` gets horizontal padding on mobile (it currently relies on section padding);
  the existing `@media 768` `.ex-faq, .ex-work { padding-inline }` rule references `.ex-work` which
  is being deleted — repoint that to `.ex-process` (and keep `.ex-faq`).

## Other CSS to add (in `css/events.css`, events-specific overrides / mobile queries)
- **Hero mobile (#1/#2):** with the mobile-only variants gone, make the desktop hero legible on
  small screens — in `@media (max-width: 768px)`: reduce `.ex-hero__content` padding, allow
  `.ex-hero__frame-title` to wrap, and drop `.ex-hero__text p` to ~1.05–1.125rem. `.ex-hero__body`
  already collapses to one column at ≤992.
- **Who We Serve mobile (#3):** confirm `.ex-serve` padding and 305px cards scroll cleanly at
  390px (single card + swipe); no structural change, just verify/nudge padding.
- **Event Management Services mobile (#5):** already handled by existing `@media 992`
  `.ev-manage__*` stack rules — verify photo/list stack and spacing.
- Remove now-dead CSS for deleted pieces where it is clearly unused: `.ev-benefits*` and the
  `.ex-work*` rules are Exhibition-inherited; `.ex-work*` must stay in `exhibition.css` (untouched)
  but can be dropped from `events.css`. `.ev-benefits*` (events-only) can be removed.

## HTML edits summary (`events.html`)
- Hero: unwrap desktop `.ex-hero__content`, `.ex-hero__title`, `.ex-hero__text` (remove
  `hide-mobile`); delete `.ex-hero__mobile-title`, `.ex-hero__mobile-lead`, `.ex-hero__mobile-text`.
- Delete `<section class="ev-benefits …">` and `<section class="ex-work …">`.
- Remove `hide-mobile` from `.ex-serve`, `.ev-manage`, `.ex-process` section tags.
- Modular head: replace the two-span `<h2>` with plain "Why Modular for Events?"; delete the
  `hide-desktop` tag `<p>`, keep the desktop tag (remove its `hide-mobile`).
- Contact: replace the two-span title with "Let's Create Extraordinary Experiences"; remove
  `hide-mobile` from the 2-paragraph `.contact__lines`; delete the `hide-desktop` email/phone `<p>`.

## Verification
1. Serve locally: `python3 -m http.server 8099` (already used); open `/events.html`.
2. Headless-Chromium screenshots at **1440** (desktop unchanged — process snake + curve intact,
   all sections present) and **390** (mobile). Crop bands with PIL as before.
3. Mobile checklist: hero shows "Events and Experiences" + subtitle, "What do we create" + both
   desktop paragraphs; Who We Serve carousel visible & swipeable; Event Management Services present;
   Process titled "Our Event Delivery Process" with all **8** steps in order 01→08 as a vertical
   circle+label list; "Why Modular for Events?" heading; Contact shows desktop title + 2 paragraphs;
   no "How We Provide/We create" or "How We Work" or benefits 01/02/03 remnants; no horizontal
   scroll/overflow.
4. Confirm `exhibition.html` still renders identically (its CSS/HTML untouched).
