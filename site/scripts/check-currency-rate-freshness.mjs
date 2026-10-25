/** Verify that stale FX fallback cannot ship without visible localized disclosure. */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rates = JSON.parse(readFileSync(join(root, "src/data/rates.json"), "utf8"));
const component = readFileSync(join(root, "src/tools/currency-converter/Component.tsx"), "utf8");
const localeDir = join(root, "src/tools/currency-converter/messages");
const names = readdirSync(localeDir).filter(x => x.endsWith(".json"));
const errors = [];
const updated = Date.parse(String(rates.updatedAt) + "T00:00:00Z");
if (!Number.isFinite(updated) || !/^\d{4}-\d{2}-\d{2}$/.test(rates.updatedAt)) errors.push("Invalid rates date");
if (rates.base !== "USD" || rates.rates?.USD !== 1) errors.push("Unexpected rate base");
if (!rates.rates || Object.values(rates.rates).some(v=>typeof v !== "number" || !Number.isFinite(v) || v<=0)) errors.push("Invalid rate entries");
if (!component.includes('role="alert"') || !component.includes('note.staleWarning') || !component.includes('ageMs >= 7 * 86400000')) errors.push("Missing client stale-rate alert");
for (const file of names) {
  try {
    const msg=JSON.parse(readFileSync(join(localeDir,file),"utf8"));
    const v=msg.note?.staleWarning;
    if (typeof v!=="string" || !v.includes("{date}") || v.length<25) errors.push(file+": missing localized stale warning");
  } catch(e) { errors.push(file+": unreadable translation "+String(e)); }
}
if (errors.length) {
  console.error("[currency-rates] FAIL: "+errors.join(" | "));
  process.exitCode=1;
} else {
  const age = Math.floor((Date.now() - updated)/86400000);
  if (age >= 7 || age < -1) console.warn("[currency-rates] WARNING: cached rate is "+age+" days old. Live page must display warning until refreshed.");
  console.log("[currency-rates] PASS: validated "+names.length+" localized stale warnings and currency base");
}
