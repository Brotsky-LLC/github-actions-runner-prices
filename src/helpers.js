// Helper bodies. scripts/build.mjs wraps this file with the data from
// prices.json and the ESM / CommonJS exports. `data` is defined by the wrapper.

const normalizeLabel = (label) => String(label).trim().toLowerCase();

/** Every provider, in file order. */
function listProviders() {
  return data.providers;
}

/** One provider by id ("github", "blacksmith", …), or undefined. */
function getProvider(providerId) {
  return data.providers.find((provider) => provider.id === providerId);
}

/**
 * The runner a `runs-on` label selects, across all providers (or one, when
 * `providerId` is given). Case-insensitive. Returns { provider, runner } or
 * undefined.
 */
function findRunnerByLabel(label, providerId) {
  const wanted = normalizeLabel(label);
  for (const provider of data.providers) {
    if (providerId && provider.id !== providerId) continue;
    for (const runner of provider.runners) {
      if ((runner.labels || []).some((l) => normalizeLabel(l) === wanted)) {
        return { provider, runner };
      }
    }
  }
  return undefined;
}

/** A runner by provider and runner id (or GitHub billing SKU), or undefined. */
function getRunner(providerId, runnerIdOrSku) {
  const provider = getProvider(providerId);
  if (!provider) return undefined;
  const wanted = normalizeLabel(runnerIdOrSku);
  return provider.runners.find(
    (runner) =>
      normalizeLabel(runner.id) === wanted ||
      (runner.sku !== undefined && normalizeLabel(runner.sku) === wanted)
  );
}

/**
 * USD per minute for a runner, looked up by `label`, or by `providerId` plus
 * `runnerId` / `sku`. Returns undefined when nothing matches.
 */
function usdPerMinute(query) {
  if (query.label) {
    const hit = findRunnerByLabel(query.label, query.providerId);
    if (hit) return hit.runner.usdPerMinute;
  }
  const key = query.runnerId || query.sku;
  if (query.providerId && key) {
    const runner = getRunner(query.providerId, key);
    if (runner) return runner.usdPerMinute;
  }
  return undefined;
}
