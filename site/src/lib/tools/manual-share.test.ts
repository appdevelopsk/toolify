import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { MANUAL_SHARE_SLUGS } from "./manual-share";

const TOOLS_DIR = path.resolve(__dirname, "../../tools");

/** 実ソース上で useShareableState を import しているツール slug。 */
function actualAdopters(): string[] {
  return fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .filter((d) => {
      const f = path.join(TOOLS_DIR, d.name, "Component.tsx");
      return fs.existsSync(f) && /useShareableState/.test(fs.readFileSync(f, "utf8"));
    })
    .map((d) => d.name)
    .sort();
}

describe("MANUAL_SHARE_SLUGS", () => {
  // 汎用の useAutoShareableState と自前の useShareableState が同じ ?s= を
  // 奪い合うと共有リンクが壊れる。この一覧のズレはその事故に直結する。
  it("matches the tools that actually import useShareableState", () => {
    expect([...MANUAL_SHARE_SLUGS].sort()).toEqual(actualAdopters());
  });
});
