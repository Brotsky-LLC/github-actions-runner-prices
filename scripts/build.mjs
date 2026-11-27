// Builds dist/ from prices.json and src/helpers.js. No dependencies.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("prices.json", "utf8"));
delete data.$schema;
const helpers = readFileSync("src/helpers.js", "utf8");
const names = ["listProviders", "getProvider", "getRunner", "findRunnerByLabel", "usdPerMinute"];
const body = `const data = ${JSON.stringify(data, null, 2)};\n\n${helpers}`;

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
writeFileSync(
  "dist/index.js",
  `${body}\nexport default data;\nexport { data as prices, ${names.join(", ")} };\n`
);
writeFileSync(
  "dist/index.cjs",
  `"use strict";\n${body}\nmodule.exports = { default: data, prices: data, ${names.join(", ")} };\n`
);
copyFileSync("src/index.d.ts", "dist/index.d.ts");
copyFileSync("src/index.d.ts", "dist/index.d.cts");
console.log("Built dist/ from prices.json");
