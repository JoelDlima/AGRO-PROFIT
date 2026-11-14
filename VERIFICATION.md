# Verification record

This is an in-progress local record; it is not a release or production approval.

## Environment and isolation

- Windows x64, Node 24.19.0, npm 11.17.0.
- Work is isolated under `C:\PROJECTS\AGRO-PROFIT-REDESIGN`. The original
  project checkout was not intentionally modified.
- Existing npm dependencies were installed locally with `npm ci --ignore-scripts
  --no-audit --no-fund`, with a project-local npm cache. No global installation.
- Old `.env.example` was not exported. Historical source and documentation still
  require a full secret review before any publication or deployment.

## Checks recorded on 14 November 2026

- `npm test`: **77 passed, 0 failed**. Many are source-level regression checks;
  they are not equivalent to React interaction tests or live integration tests.
- `npm run typecheck`: passed.
- Final independent review found three medium issues: offline reverse
  geocoding blocked coordinate-only sorting, empty data produced an invalid PDF
  summary, and trend links queried crop IDs instead of names. Targeted
  regression tests were added for each; the export and trend fixes passed their
  focused suites. The location contract is now explicit: offline reverse
  geocoding returns the coordinates plus `Unknown location` and makes no network
  request.
- `npm run lint`: failed with **87 errors and 13 warnings**. These have not all
  been classified as inherited versus introduced.
- `npm run build`: passed with process `VITE_*` variables cleared. The build
  warned about stale Browserslist data and a chunk larger than 500 kB.
- Local browser preview with external requests blocked: fresh demo login at
  390×844 displayed three crops and a sample-data warning. A final pass visited
  `/`, `/dashboard`, `/prices`, `/trends`, `/export`, `/profile`, `/forum`,
  `/resources` and `/chatbot`: no route had horizontal document overflow, and
  the pass produced no console errors or blocked external requests. The
  calculator displayed ₹2,000 for 1 quintal at ₹20/kg. An empty export attempt
  displayed "No price data available" instead of saving a report. At 1440×900
  the landing page had no document overflow; the keyboard skip link focused
  main content with reduced-motion emulation enabled.
- The Trends screen no longer attempts an offline Supabase history query. A
  regression test verifies it returns an empty series and logs no error.
- Screenshots are in `.qa`. Visual inspection is not an accessibility audit.

## Boundaries

No live government, weather, AI or Supabase integration is claimed verified.
The inherited server routes are disabled in the preview. Historical data
freshness, database RLS, production authorization, translation correctness,
actual farmer usability and a physical Android installation remain unverified.
Price examples and calculations must not be used as market or financial advice.

A credential-like legacy literal was inadvertently included in agent tool output
during inspection. It was not validated or reused. Treat it as potentially
exposed and revoke or rotate it if it is still active; do not put replacement
secrets in chat or client code.
