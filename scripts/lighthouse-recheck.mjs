import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const URLS = [
  "https://tools.appdevelopsk.com/en",
  "https://tools.appdevelopsk.com/en/tools",
  "https://tools.appdevelopsk.com/en/tools/bmi-calculator",
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
    console.log(
      `${formFactor.padEnd(7)} ${url.replace("https://tools.appdevelopsk.com", "").padEnd(30)} ` +
      `P:${Math.round(c.performance.score*100)} A:${Math.round(c.accessibility.score*100)} BP:${Math.round(c["best-practices"].score*100)} S:${Math.round(c.seo.score*100)} | color-contrast violations: ${ccItems}`
    );
  }
}

await chrome.kill();
