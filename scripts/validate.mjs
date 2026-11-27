// Checks prices.json against the rules in prices.schema.json plus a few the
// schema cannot express (unique ids and labels, dates not in the future,
// lastUpdated = newest lastChecked). No dependencies.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("prices.json", "utf8"));
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isUrl = (v) => typeof v === "string" && v.startsWith("https://");
const today = new Date().toISOString().slice(0, 10);

const RUNNER_KEYS = new Set([
  "id", "sku", "labels", "os", "arch", "vcpu", "memoryGb", "gpu", "tier", "usdPerMinute",
  "usdPerMinutePrepaid", "estimate", "instanceType", "notes", "sourceUrl", "lastChecked",
]);
const PROVIDER_KEYS = new Set(["id", "name", "website", "pricingUrl", "billing", "runners"]);

if (data.schemaVersion !== 1) fail("root", "schemaVersion must be 1");
if (data.currency !== "USD") fail("root", "currency must be USD");
if (data.unit !== "minute") fail("root", "unit must be minute");
if (!isDate(data.lastUpdated)) fail("root", "lastUpdated must be YYYY-MM-DD");
if (!Array.isArray(data.providers) || data.providers.length === 0) fail("root", "providers must be a non-empty array");

const providerIds = new Set();
let newestCheck = "";
for (const provider of data.providers || []) {
  const p = `providers.${provider.id}`;
  for (const key of Object.keys(provider)) if (!PROVIDER_KEYS.has(key)) fail(p, `unknown key ${key}`);
  if (!/^[a-z0-9-]+$/.test(provider.id || "")) fail(p, "id must be kebab-case");
  if (providerIds.has(provider.id)) fail(p, "duplicate provider id");
  providerIds.add(provider.id);
  if (!provider.name) fail(p, "name is required");
  if (!isUrl(provider.website)) fail(p, "website must be an https URL");
  if (!isUrl(provider.pricingUrl)) fail(p, "pricingUrl must be an https URL");
  if (!Array.isArray(provider.runners) || provider.runners.length === 0) fail(p, "runners must be non-empty");
  const runnerIds = new Set();
  const labels = new Set();
  for (const runner of provider.runners || []) {
    const r = `${p}.runners.${runner.id}`;
    for (const key of Object.keys(runner)) if (!RUNNER_KEYS.has(key)) fail(r, `unknown key ${key}`);
    if (!runner.id) fail(r, "id is required");
    if (runnerIds.has(runner.id)) fail(r, "duplicate runner id");
    runnerIds.add(runner.id);
    if (!["linux", "windows", "macos"].includes(runner.os)) fail(r, "os must be linux, windows or macos");
    if (!["x64", "arm64"].includes(runner.arch)) fail(r, "arch must be x64 or arm64");
    for (const key of ["usdPerMinute", "usdPerMinutePrepaid", "vcpu", "memoryGb"]) {
      if (runner[key] !== undefined && !(typeof runner[key] === "number" && runner[key] > 0)) {
        fail(r, `${key} must be a positive number`);
      }
    }
    if (runner.usdPerMinute === undefined) fail(r, "usdPerMinute is required");
    if (runner.usdPerMinute > 2) fail(r, "usdPerMinute over $2 looks like a typo");
    if (!isUrl(runner.sourceUrl)) fail(r, "sourceUrl must be an https URL");
    if (!isDate(runner.lastChecked)) fail(r, "lastChecked must be YYYY-MM-DD");
    else if (runner.lastChecked > today) fail(r, "lastChecked is in the future");
    if (runner.lastChecked > newestCheck) newestCheck = runner.lastChecked;
    for (const label of runner.labels || []) {
      const key = label.toLowerCase();
      if (labels.has(key)) fail(r, `label ${label} is used twice`);
      labels.add(key);
    }
  }
}
if (data.lastUpdated !== newestCheck) fail("root", `lastUpdated (${data.lastUpdated}) should equal the newest lastChecked (${newestCheck})`);

if (errors.length) {
  console.error(`prices.json has ${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const count = data.providers.reduce((n, p) => n + p.runners.length, 0);
console.log(`prices.json is valid: ${data.providers.length} providers, ${count} runners.`);
