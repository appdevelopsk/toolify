import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error - opencc-js has no types
import { Converter } from "opencc-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.join(__dirname, "..", "src", "tools");

// cn → twp = Mainland Mandarin → Taiwan idioms (proper localization, not just character mapping)
const convert = Converter({ from: "cn", to: "twp" });

let converted = 0;
let skipped = 0;

for (const slug of fs.readdirSync(TOOLS_DIR)) {
  const dir = path.join(TOOLS_DIR, slug, "messages");
  const src = path.join(dir, "zh-CN.json");
  const dst = path.join(dir, "zh-TW.json");
  if (!fs.existsSync(src)) {
    skipped++;
    continue;
  }
  if (fs.existsSync(dst)) {
    skipped++;
    continue;
  }
  const raw = fs.readFileSync(src, "utf-8");
  const obj = JSON.parse(raw);
  const converted_ = JSON.parse(convert(JSON.stringify(obj)));
  fs.writeFileSync(dst, JSON.stringify(converted_, null, 2) + "\n", "utf-8");
  converted++;
}

console.log(`Converted: ${converted}`);
console.log(`Skipped:   ${skipped}`);
