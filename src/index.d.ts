export type RunnerOs = "linux" | "windows" | "macos";
export type RunnerArch = "x64" | "arm64";

export interface Runner {
  /** Stable id, unique within its provider. */
  id: string;
  /** Provider billing SKU, where the provider publishes one (GitHub). */
  sku?: string;
  /** `runs-on` labels that select this runner, where known. */
  labels?: string[];
  os: RunnerOs;
  arch: RunnerArch;
  vcpu?: number;
  memoryGb?: number;
  gpu?: boolean;
  /** Pricing tier when a provider sells more than one at the same size. */
  tier?: string;
  /** List price in USD per billed minute (overage / pay-as-you-go rate). */
  usdPerMinute: number;
  /** Effective in-plan rate, when it differs from usdPerMinute. */
  usdPerMinutePrepaid?: number;
  /** True when the price is a published example that varies (e.g. AWS spot). */
  estimate?: boolean;
  instanceType?: string;
  notes?: string;
  /** Page the price was read from. */
  sourceUrl: string;
  /** Date (YYYY-MM-DD) the price was last checked against sourceUrl. */
  lastChecked: string;
}

export interface Provider {
  id: string;
  name: string;
  website: string;
  pricingUrl: string;
  billing?: {
    model?: string;
    rounding?: string;
    freeTier?: string;
    notes?: string;
  };
  runners: Runner[];
}

export interface RunnerPrices {
  schemaVersion: 1;
  currency: "USD";
  unit: "minute";
  /** Date (YYYY-MM-DD) of the latest price check in this file. */
  lastUpdated: string;
  providers: Provider[];
}

declare const prices: RunnerPrices;
export default prices;
export { prices };

export function listProviders(): Provider[];
export function getProvider(providerId: string): Provider | undefined;
export function getRunner(providerId: string, runnerIdOrSku: string): Runner | undefined;
export function findRunnerByLabel(
  label: string,
  providerId?: string
): { provider: Provider; runner: Runner } | undefined;
export function usdPerMinute(query: {
  label?: string;
  providerId?: string;
  runnerId?: string;
  sku?: string;
}): number | undefined;
