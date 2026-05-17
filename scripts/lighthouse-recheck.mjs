import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const URLS = [
  "https://toolify365.com/en",
  "https://toolify365.com/en/tools",
  "https://toolify365.com/en/tools/bmi-calculator",
  "https://toolify365.com/en/tools/mortgage-calculator",
  "https://toolify365.com/en/tools/price-compare",
];

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"] });

for (const url of URLS) {
  for (const formFactor of ["mobile", "desktop"]) {
    const flags = {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor,
      screenEmulation: formFactor === "desktop"
        ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
        : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
      throttlingMethod: "simulate",
      throttling: formFactor === "desktop"
        ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 }
        : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
    };
    const r = await lighthouse(url, flags);
    const c = r.lhr.categories;
    const ccItems = (r.lhr.audits["color-contrast"].details?.items?.length) ?? 0;
    const bpScore = Math.round(c["best-practices"].score*100);
    console.log(
      `${formFactor.padEnd(7)} ${url.replace("https://toolify365.com", "").padEnd(35)} ` +
      `P:${Math.round(c.performance.score*100)} A:${Math.round(c.accessibility.score*100)} BP:${bpScore} S:${Math.round(c.seo.score*100)} | cc:${ccItems}`
    );
    // Show failing best-practices audits if BP < 90
    if (bpScore < 90) {
      const bpAuditRefs = c["best-practices"].auditRefs;
      const failingBP = bpAuditRefs
        .filter(ref => ref.weight > 0)
        .map(ref => ({ id: ref.id, score: r.lhr.audits[ref.id]?.score ?? null, weight: ref.weight }))
        .filter(a => a.score !== null && a.score < 1)
        .sort((a,b) => a.score - b.score);
      for (const a of failingBP) {
        const audit = r.lhr.audits[a.id];
        console.log(`   ❌ ${a.id} (score:${a.score}, w:${a.weight}): ${audit?.displayValue ?? audit?.explanation ?? ""}`);
      }
    }
  }
}

await chrome.kill();
