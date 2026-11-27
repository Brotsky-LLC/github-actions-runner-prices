# GitHub Actions runner prices

> Built for [PRLane](https://prlane.com), which uses this data to show what
> every pull request costs in CI.

Current per-minute list prices for GitHub Actions runners from GitHub and the
main third-party runner providers, as one JSON file. Every price carries the
URL it was read from and the date it was last checked.

Maintained by [Brotsky, LLC](https://github.com/Brotsky-LLC) for
[PRLane.com](https://prlane.com). Prices are refreshed
weekly by an automated check that opens a pull request when anything changes.

## Providers

2-vCPU Linux list price per minute, in USD:

| Provider | x64 | arm64 | Runners listed |
|---|---|---|---|
| [GitHub-hosted runners](https://docs.github.com/en/billing/reference/actions-runner-pricing) | $0.006 | $0.005 | 35 |
| [Blacksmith](https://www.blacksmith.sh/pricing) | $0.004 | $0.0025 | 12 |
| [Depot](https://depot.dev/pricing) | $0.006 | $0.006 | 20 |
| [Namespace](https://namespace.so/pricing) | $0.003 | — | 16 |
| [BuildJet](https://buildjet.com/for-github-actions/pricing) | $0.004 | $0.004 | 10 |
| [Ubicloud](https://ubicloud.com/docs/about/pricing) | $0.00125 | $0.00125 | 15 |
| [RunsOn](https://runs-on.com/pricing/) | $0.0007 | — | 9 |
| [WarpBuild](https://www.warpbuild.com/pricing) | $0.004 | $0.003 | 17 |

RunsOn runs in your own AWS account, so its prices are published spot
examples plus a yearly license. Namespace lists overage rates in
`usdPerMinute` and in-plan rates in `usdPerMinutePrepaid`.

## Install

```sh
npm install @brotskyllc/github-actions-runner-prices
```

## Use

```ts
import prices, {
  findRunnerByLabel,
  getProvider,
  usdPerMinute,
} from "@brotskyllc/github-actions-runner-prices";

usdPerMinute({ label: "ubuntu-latest" }); // 0.006
usdPerMinute({ label: "blacksmith-4vcpu-ubuntu-2404" }); // 0.008
usdPerMinute({ providerId: "github", sku: "linux_4_core_arm" }); // 0.008

findRunnerByLabel("depot-ubuntu-24.04-arm-8");
// { provider: { id: "depot", … }, runner: { usdPerMinute: 0.024, sourceUrl: "…", lastChecked: "…" } }

getProvider("ubicloud")?.runners.length;
prices.lastUpdated; // "YYYY-MM-DD"
```

The raw data is also exported as `@brotskyllc/github-actions-runner-prices/prices.json`,
and is available without npm at
`https://raw.githubusercontent.com/Brotsky-LLC/github-actions-runner-prices/main/prices.json`.

## Data format

See [`prices.schema.json`](prices.schema.json). Each runner has:

| Field | Meaning |
|---|---|
| `id` | Stable id, unique within the provider |
| `sku` | Provider billing SKU (GitHub) |
| `labels` | `runs-on` labels that select this runner, where known |
| `os`, `arch`, `vcpu`, `memoryGb` | Machine shape |
| `usdPerMinute` | List price per billed minute (pay-as-you-go or overage) |
| `usdPerMinutePrepaid` | In-plan rate, when it differs |
| `estimate` | `true` when the price is a published example that varies |
| `sourceUrl` | Page the price was read from |
| `lastChecked` | Date the price was last checked against `sourceUrl` |

Prices are list prices before free minutes, plan credits, discounts or
storage add-ons. Each provider's `billing` block describes those in words.

## Contributing

Prices change. If you spot one that is out of date, open a pull request that
edits `prices.json`, updates `lastChecked` and `sourceUrl`, and passes
`npm test`. New providers are welcome. See [REFRESH.md](REFRESH.md) for how
the weekly check works.

## Releases

Merging a pull request that bumps `version` in `package.json` publishes that
version to npm from GitHub Actions with provenance.

## License

MIT. Prices are facts gathered from each provider's public pages; check the
provider before relying on them for billing.
