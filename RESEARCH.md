# Research and baseline

Checked 13–14 November 2026. This is a product and engineering record, not a
claim that farmers or live services have validated the redesign.

## Source version

The isolated workspace was exported from the tracked files of
`C:\PROJECTS\AGRO-PROFIT` at commit
`f5ef32b89e952e81c6d9486f9e1dc11228375451`. The original checkout, including
its untracked files, was not changed. `.env.example` was excluded from the
export; this does not establish that historical source or Git history is
free of credentials. Do not publish or deploy without a separate secret review.

Another repository, `JoelDlima/agro-profit-pro` at `366ecae`, has the same
non-sensitive tracked paths but 13 differing file blobs. The older `AgroProfit`
snapshot differs more substantially. Commit time alone cannot establish the
best functionality. This workspace retains the local `AGRO-PROFIT` lineage;
no files were blindly merged from other variants.

## Sources and product decisions

- [Government of India: Agmarknet price and arrival reports](https://agmarknet.gov.in/pricearrivalreportlist)
  describe commodity/market price and arrival reports. Display market,
  commodity, unit, date and source where known; an observation is not a
  guaranteed selling price.
- [W3C: target size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
  describes 44-by-44 CSS pixel controls at WCAG AAA, subject to exceptions.
  This is a design target, not proof of conformance.
- [India government e-NAM portal](https://enam.gov.in/web/) offers language
  choices and market information. Multiple languages need human review;
  this project cannot claim farmer-tested or fully translated content yet.
- [IMD district forecast and advisory portal](https://mausam.imd.gov.in/imd_latest/contents/agromet/advisory/indiadistrictforecast.php)
  shows why location, issue time and forecast validity matter. With no current
  credentials or verified source, label weather unavailable rather than
  inventing current conditions.
- [Vite 5 environment documentation](https://github.com/vitejs/vite/blob/v5.4.21/docs/guide/env-and-mode.md)
  notes that `VITE_` values are exposed to client code. Secret keys must not be
  bundled into the browser.

## Existing source observations

Before changes, static inspection identified a ₹/quintal versus ₹/kg calculator
mismatch, potentially unlabeled synthetic market fallback, stale source dates
that could appear live, approximate straight-line distances presented without
precision context, and untrusted chat markup. These were source findings, not
verified user incidents. Detailed tests and fixes must be reported separately.

The former cache review found a client-side 100-record slice and swallowed
history-write errors; it did not establish that every backend path truncates.
The old README's large user and speed claims were not reproduced here.

## Safety

No actual Supabase project, old API keys or paid service should be used for
the demonstration. Synthetic data and unavailable features must be visibly
distinguished from operational data. Supabase authentication, row-level
security and live-source eligibility remain unverified until explicitly set up
and tested against a disposable or newly authorized environment.
