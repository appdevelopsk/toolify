#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[]) {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npx", ["tsc", "--noEmit"]);
run("npx", ["tsx", "scripts/audit-i18n.ts"]);
run("npx", ["tsx", "scripts/audit-seo.ts"]);
console.log("\n✓ all validations passed");
