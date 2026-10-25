/**
 * Prevent a misleading claim that numeric unit conversion treats gauge pressure
 * as absolute. This is a unit conversion only; the reference basis is preserved.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "../src/tools/pressure-converter/messages");
const names = readdirSync(root).filter(x => x.endsWith(".json"));
const errors = [];
for (const name of names) {
  try {
    const x = JSON.parse(readFileSync(join(root, name), "utf8"));
    const explanation = x.article?.sections?.[2]?.paragraphs?.[2] ?? "";
    const answer = x.faq?.[5]?.a ?? "";
    if (!explanation.includes("32 psi") || !explanation.includes("1 atm")) {
      errors.push(name + ": missing gauge-to-gauge example or local atmosphere reference");
    }
    if (answer.length < 70) errors.push(name + ": FAQ gauge answer too short");
  } catch (e) { errors.push(name + ": invalid or incomplete translation: " + String(e)); }
}
if (errors.length) {
  console.error("[pressure-reference] FAIL\n" + errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("[pressure-reference] PASS: " + names.length + " translated guides distinguish gauge and absolute pressure");
}
