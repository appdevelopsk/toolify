/**
 * .asp-credentials.local をパースして認証情報を返す
 * このファイル自体はコミットOK (認証情報は含まない)
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDS_FILE = path.join(__dirname, ".asp-credentials.local");

export function loadCreds(section) {
  if (!existsSync(CREDS_FILE)) {
    throw new Error(`認証情報ファイルが見つかりません: ${CREDS_FILE}\n.asp-credentials.local を作成してください。`);
  }
  const content = readFileSync(CREDS_FILE, "utf-8");
  const lines = content.split("\n");
  let inSection = false;
  const result = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`[${section}]`)) { inSection = true; continue; }
    if (trimmed.startsWith("[") && inSection) break;
    if (inSection && trimmed.includes("=")) {
      const [key, ...val] = trimmed.split("=");
      result[key.trim()] = val.join("=").trim();
    }
  }
  if (!result.username) throw new Error(`セクション [${section}] が見つかりません`);
  return result;
}
