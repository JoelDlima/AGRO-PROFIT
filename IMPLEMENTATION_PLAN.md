# AgroProfit farmer-first redesign plan

**Goal:** Improve the existing app's usability and data honesty in a separate
workspace without connecting to old credentials or presenting sample data as live.

**Architecture:** Retain React 18, Vite 5, TypeScript, existing routes and
Capacitor-aware routing. Prioritize the real market-price and calculator flow.
No-credentials mode must be explicit, safe and usable; integrations remain
unverified until new credentials and service permissions are supplied.

**Design:** `DESIGN.md`; market board, clear observation metadata and large controls.

## Constraints

- Write only inside `C:\PROJECTS\AGRO-PROFIT-REDESIGN`; preserve original checkout.
- Do not print, read from environment files, reuse, or validate old keys.
- Do not call actual market/weather/AI services in demonstrations. Use labeled
  sample data or explicit unavailable states. Never imply agronomic advice is
  verified or prices are guaranteed.
- Parallel work uses distinct files; preserve existing routes and mobile/native
  behavior. Do not deploy or modify a real database. The user has subsequently
  requested a commit and push; identify a safe destination and complete a secret
  review before publishing.
- Before changing behavior, reproduce with a failing focused test where feasible.
  Report any test setup blockers and do not claim unexecuted tests pass.

## Tasks

1. [x] Preserve a tracked-source snapshot from original `f5ef32b` without `.env.example`;
   compare the other variants and record differences, without merging blindly.
2. [x] Diagnose and correct the calculator unit mismatch and stale inputs; exercise
   the exact quintal/kilogram example and invalid quantities through tests.
3. [x] Make the market comparison honest about sample, empty, unavailable and dated
   data; verify sorting independently of the highest price label and distinguish
   straight-line estimates from driving distances.
4. [x] Make the no-credentials path safe: no automatic background sync or external
   service calls by default; clearly label demo state. Inherited server routes
   return 503. Live integration remains unverified and is not claimed.
5. [x] Redesign shared navigation and visual system for farmer use, mobile and
   desktop, keyboard and reduced motion. Browser checks are documented in
   `VERIFICATION.md`; a physical-device and screen-reader audit is still pending.
6. [x] Verify targeted tests, type-check, production build and a nine-route mobile
   browser pass with external requests blocked. Full lint still fails (87 errors,
   13 warnings); this is recorded as an unresolved repository issue.
7. [x] Document setup, sample vs live behavior, provenance, safety limitations,
   fresh credentials needed, remaining tests and project learning resources.
