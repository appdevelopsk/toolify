import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const c = await chromeLauncher.launch({ chromeFlags: ["--headless=new","--no-sandbox","--disable-gpu"] });
const r = await lighthouse("https://tools.appdevelopsk.com/en/tools/bmi-calculator", {
  port: c.port, output: "json", onlyCategories: ["accessibility"],
  formFactor: "desktop",
  screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
  throttlingMethod: "simulate",
  throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 }
});
console.log(JSON.stringify(r.lhr.audits["color-contrast"].details?.items?.map(it => ({
  selector: it.node?.selector?.slice(0,100), explanation: it.node?.explanation?.split("\n")[1]?.trim()
})), null, 2));
await c.kill();
