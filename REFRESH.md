# Refreshing prices

A scheduled agent runs this checklist daily and opens a pull request
for verified rate, catalog, or source changes. People can follow the same steps by hand.

1. Start from the latest `main` on a new branch named `refresh/YYYY-MM-DD`.
2. For each provider in `prices.json`, open its `pricingUrl` and every distinct
   runner `sourceUrl`. Read the published per-minute USD prices.
3. For every runner whose price you confirmed, set `lastChecked` to today if that runner is edited in the PR.
   Change `usdPerMinute` (and `usdPerMinutePrepaid`, `vcpu`, `memoryGb`) only
   to the number the page publishes. Never estimate or derive a price the page
   does not show, except where the provider documents a formula (Namespace
   unit minutes) and the existing entries already use it.
4. Add runners the provider newly publishes, and remove ones it no longer
   sells. Keep ids stable for runners that still exist.
5. If a page cannot be read, leave that provider's entries and dates as they
   are and say so in the pull request.
6. Set the top-level `lastUpdated` to the newest `lastChecked`.
7. Consider adding a provider only when it sells GitHub Actions runners with
   public per-minute prices.
8. Run `npm test`. It must pass.
9. If any price, runner or provider changed, bump the patch version in
   `package.json` (minor for a new provider or schema addition). If only dates
   changed, record the audit without opening a pull request. Source repairs
   included in a catalog release carry the same version.
10. Open a pull request titled `Refresh runner prices YYYY-MM-DD`. Its body
    lists every price change as `provider runner: old -> new (source URL)`,
    added and removed runners, and pages that could not be read.

Merging a pull request with a new version publishes it to npm.
