// Smoke tests for the built package (ESM and CommonJS).
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import prices, { findRunnerByLabel, getProvider, getRunner, usdPerMinute } from "../dist/index.js";

const cjs = createRequire(import.meta.url)("../dist/index.cjs");

for (const api of [{ prices, findRunnerByLabel, getProvider, getRunner, usdPerMinute }, cjs]) {
  assert.equal(api.prices.currency, "USD");
  assert.equal(api.getProvider("github").name, "GitHub-hosted runners");
  assert.equal(api.usdPerMinute({ label: "ubuntu-latest" }), 0.006);
  for (const [label, sku, rate] of [
    ["ubuntu-26.04", "actions_linux", 0.006],
    ["ubuntu-26.04-arm", "actions_linux_arm", 0.005],
    ["windows-2025-vs2026", "actions_windows", 0.01],
    ["windows-11-vs2026-arm", "actions_windows_arm", 0.01],
    ["macos-26", "actions_macos", 0.062],
    ["xcode-27", "actions_macos", 0.062],
  ]) {
    assert.equal(api.findRunnerByLabel(label).runner.sku, sku);
    assert.equal(api.usdPerMinute({ label }), rate);
  }
  assert.equal(api.usdPerMinute({ label: "BLACKSMITH-4VCPU-UBUNTU-2404" }), 0.008);
  assert.equal(api.usdPerMinute({ providerId: "github", sku: "linux_4_core_arm" }), 0.008);
  assert.equal(api.findRunnerByLabel("depot-ubuntu-24.04-arm-8").provider.id, "depot");
  assert.equal(api.usdPerMinute({ label: "no-such-runner" }), undefined);
}
console.log("All package tests passed.");
