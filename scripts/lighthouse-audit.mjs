import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const ORIGIN = "https://toolify365.com";
const URLS = [
  { name: "home-en", url: `${ORIGIN}/en` },
  { name: "tools-index-en", url: `${ORIGIN}/en/tools` },
  { name: "bmi-en", url: `${ORIGIN}/en/tools/bmi-calculator` },
  { name: "bmi-ja", url: `${ORIGIN}/ja/tools/bmi-calculator` },
  { name: "bmi-zh-TW", url: `${ORIGIN}/zh-TW/tools/bmi-calculator` },
  { name: "bmi-ko", url: `${ORIGIN}/ko/tools/bmi-calculator` },
  { name: "bmi-es", url: `${ORIGIN}/es/tools/bmi-calculator` },
  { name: "rule-of-72-en", url: `${ORIGIN}/en/tools/rule-of-72-calculator` },
  { name: "stopwatch-en", url: `${ORIGIN}/en/tools/stopwatch` },
  { name: "json-formatter-en", url: `${ORIGIN}/en/tools/json-formatter` },
];

const PRESETS = ["mobile", "desktop"];

const outDir = path.join(process.cwd(), "scripts/lighthouse-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

console.log(`[lighthouse] Auditing ${URLS.length} URLs × ${PRESETS.length} presets = ${URLS.length * PRESETS.length} runs`);
console.log(`[lighthouse] Output: ${outDir}\n`);

const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const results = [];

for (const preset of PRESETS) {
  for (const target of URLS) {
    const label = `${target.name}/${preset}`;
    process.stdout.write(`[lighthouse] ${label.padEnd(35)} `);
    try {
      const flags = {
        port: chrome.port,
        output: ["html", "json"],
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        formFactor: preset,
        screenEmulation: preset === "desktop"
          ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
          : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
        throttlingMethod: "simulate",
        throttling: preset === "desktop"
          ? { rttMs: 40, throughputKbps: 10240, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0, cpuSlowdownMultiplier: 1 }
          : { rttMs: 150, throughputKbps: 1638.4, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0, cpuSlowdownMultiplier: 4 },
      };
      const runnerResult = await lighthouse(target.url, flags);
      if (!runnerResult) {
        console.log("✗ no result");
        continue;
      }
      const lhr = runnerResult.lhr;
      const scores = {
        performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
        seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
      };
      const fcp = lhr.audits["first-contentful-paint"]?.numericValue;
      const lcp = lhr.audits["largest-contentful-paint"]?.numericValue;
      const cls = lhr.audits["cumulative-layout-shift"]?.numericValue;
      const tbt = lhr.audits["total-blocking-time"]?.numericValue;

      console.log(`P:${scores.performance} A:${scores.accessibility} BP:${scores.bestPractices} S:${scores.seo}  | LCP:${(lcp/1000).toFixed(1)}s CLS:${cls?.toFixed(3)} TBT:${tbt?.toFixed(0)}ms`);

      results.push({ ...target, preset, scores, lcp, fcp, cls, tbt });

      // Write HTML report
      const reports = Array.isArray(runnerResult.report) ? runnerResult.report : [runnerResult.report];
      const htmlReport = reports.find((r) => typeof r === "string" && r.startsWith("<!doctype")) ?? reports[0];
      const jsonReport = reports.find((r) => typeof r === "string" && r.startsWith("{"));
      writeFileSync(path.join(outDir, `${label.replace("/", "-")}.html`), htmlReport);
      if (jsonReport) writeFileSync(path.join(outDir, `${label.replace("/", "-")}.json`), jsonReport);
    } catch (err) {
      console.log("✗ " + err.message);
    }
  }
}

await chrome.kill();

// Aggregate summary
console.log("\n=== Summary by preset ===\n");
for (const preset of PRESETS) {
  const subset = results.filter((r) => r.preset === preset);
  if (!subset.length) continue;
  const avg = (key) => Math.round(subset.reduce((s, r) => s + r.scores[key], 0) / subset.length);
  console.log(`${preset.toUpperCase()}: avg P:${avg("performance")} A:${avg("accessibility")} BP:${avg("bestPractices")} S:${avg("seo")}`);
  // Worst page per category
  const worst = (key) => subset.slice().sort((a, b) => a.scores[key] - b.scores[key])[0];
  for (const k of ["performance", "accessibility", "bestPractices", "seo"]) {
    const w = worst(k);
    console.log(`  worst ${k}: ${w.name} (${w.scores[k]})`);
  }
  console.log();
}

writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(results, null, 2));
console.log(`Reports saved to ${outDir}`);
