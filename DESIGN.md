# AgroProfit redesign: product and design brief

Status: initial direction, subject to source audit and verification.
Date: 14 November 2026.

## Intent

Help a farmer or family member find relevant commodity prices and understand
where and when those prices were observed. The interface must be comfortable
on an inexpensive phone as well as a desktop, and usable without technical
knowledge. Prioritize clear choices and trustworthy information over decoration.
The historical React/Vite app is the starting point, not a reason to discard
working functionality.

## Boundaries

- This directory is the only writable project location; the original checkout
  and its untracked files remain untouched.
- Do not read or reuse old credentials, connect to production services or assume
  that a new Supabase project exists. Label sample data as sample data and show
  honest unavailable/offline states.
- Do not describe Haversine distance as driving distance or display estimated
  earnings as guaranteed outcomes. A price should show its source, observation
  date, location, unit and variety when known.
- Test accessible focus, contrast, readable text, large touch controls,
  responsive layout, reduced motion and slow/offline states. Do not claim
  validation by actual farmers or a translation reviewer unless performed.
- Keep the existing application stack unless inspection demonstrates a
  concrete reason to change it. No deployment or push without approval.

## Concepts considered

| Direction | Anchor | Signature moment | Originality / fit / feasibility / portability (1–5; lower portability is better) |
| --- | --- | --- | --- |
| Market board | A farmer compares prices at specific mandis | A selected crop reveals a clear, dated comparison row | 3 / 5 / 5 / 2 |
| Selling journey | Choosing a crop, then market, then costs | A step-by-step decision path that maintains context | 3 / 4 / 4 / 3 |
| Harvest ledger | A record of the farmer's crop and costs | A simple, expandable earnings estimate | 3 / 4 / 3 / 3 |

**Selected:** Market board, because the core job is scanning and comparing
actual observations rather than reading a marketing page. Borrow a small
step-by-step explanation for calculations, not as the only path to prices.
This choice is an implementation assumption, not evidence of farmer validation.

## Concept card

- **Idea:** Make a market observation as legible as a familiar market board.
- **Metaphor:** A crop and market notice board, with dates and units in view.
- **Signature:** Selecting a crop updates a simple market comparison without
  losing source or date context.
- **Emotion:** Calm, useful and trustworthy.
- **Motion verb:** Settle, briefly; respect reduced motion.
- **Screenshot:** A mobile-width view where the crop, market, sample label,
  price and observation date are readable without opening a second screen.

## Initial implementation plan

1. Compare candidate versions and audit actual routes, demo state and existing
   languages before selecting files. Preserve the original.
2. Establish safe, clearly labeled no-credentials behavior; preserve genuine
   workflows and explain which existing services cannot be exercised.
3. Design mobile-first price discovery, filtering and clear fallback states,
   then adapt to desktop. Add no invented users, claims or unverified live data.
4. Verify behavior using isolated test data, run existing build/type/lint checks,
   and inspect mobile and desktop views including keyboard and reduced motion.
5. Document the current data contract, mock boundaries, how to add new services
   safely, real test evidence, and remaining gaps.

## Visual system

- Existing light tokens, expressed as approximate hex: ground `#faf8f5`, ink
  `#30261d`, muted `#67594c`, line `#e0ddd1`, primary `#385a16`, highlight
  `#eeb32b`. The existing dark-mode tokens remain available.
- Type: existing locally bundled Nunito for UI and display, with system fallbacks
  for scripts it does not cover. Body text is generally 16–18px; do not shrink
  data or controls to fit.
- Layout: fluid container with a single aligned gutter; at phone width, one
  column and large primary action; desktop pairs a concise introduction with
  a market-information board. Below, steps become a three-column list on wider
  screens and a vertical sequence on phones.
- Shape: use the existing 0.75rem token as the shared starting point; keep
  inputs, controls and surfaces distinguishable rather than nesting cards.
- Motion: quiet at rest by design, with short, meaningful pointer feedback;
  reduced-motion settings suppress nonessential movement. No decorative
  auto-playing loader, smooth-scroll dependency or WebGL on the working tool.

```text
desktop:  brand | language / sign in
          useful headline + action  |  crop / market / date / unit board
          clear three-step guidance
          source reminder and official link

phone:    brand       language / sign in
          headline
          full-width action + sample warning
          crop / market / date / unit board
          clear vertical steps
```

These values are implementation choices, not a claim of accessibility
conformance: contrast and screenshots still need measurement.
