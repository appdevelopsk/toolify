"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function base64UrlDecode(s: string): string {
  // RFC 4648 §5: replace -→+, _→/, pad to multiple of 4
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  try {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    throw new Error("invalid base64url");
  }
}

interface DecodedJwt {
  header: object;
  payload: object;
  signaturePresent: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
  notBefore?: Date;
}

function decode(token: string): DecodedJwt {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("expected 3 parts separated by '.'");
  const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];
  const header = JSON.parse(base64UrlDecode(headerPart));
  const payload = JSON.parse(base64UrlDecode(payloadPart));
  const signaturePresent = signaturePart.length > 0;
  const result: DecodedJwt = { header, payload, signaturePresent };
  if (typeof (payload as Record<string, unknown>).exp === "number") {
    result.expiresAt = new Date(((payload as Record<string, number>).exp as number) * 1000);
  }
  if (typeof (payload as Record<string, unknown>).iat === "number") {
    result.issuedAt = new Date(((payload as Record<string, number>).iat as number) * 1000);
  }
  if (typeof (payload as Record<string, unknown>).nbf === "number") {
    result.notBefore = new Date(((payload as Record<string, number>).nbf as number) * 1000);
  }
  return result;
}

export default function JwtDecoder() {
  const t = useTranslations("tools.jwt-decoder");
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNzMwMDAwMDAwLCJleHAiOjQ4ODYwMDAwMDB9.signature_here"
  );

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { ok: true as const, value: decode(token.trim()) };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, [token]);

  const now = new Date();
  const expired = result?.ok && result.value.expiresAt && result.value.expiresAt < now;
  const notYetValid = result?.ok && result.value.notBefore && result.value.notBefore > now;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.token")}</span>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          spellCheck={false}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm break-all dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("input.privacyNote")}</p>

      {!result ? null : !result.ok ? (
        <div className="mt-4 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200">
          {t("error.label")}: {result.error}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("result.header")}</h2>
              <button onClick={() => copy(JSON.stringify(result.value.header, null, 2))} className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{t("copy")}</button>
            </div>
            <pre className="mt-1 overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">{JSON.stringify(result.value.header, null, 2)}</pre>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("result.payload")}</h2>
              <button onClick={() => copy(JSON.stringify(result.value.payload, null, 2))} className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{t("copy")}</button>
            </div>
            <pre className="mt-1 overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">{JSON.stringify(result.value.payload, null, 2)}</pre>
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.signaturePresent")}</dt>
              <dd>{result.value.signaturePresent ? "✓" : "✗"}</dd>
            </div>
            {result.value.issuedAt && (
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.issuedAt")}</dt>
                <dd className="font-mono text-xs">{result.value.issuedAt.toISOString()}</dd>
              </div>
            )}
            {result.value.expiresAt && (
              <div className={`flex justify-between border-b py-1 ${expired ? "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-900/20" : "border-slate-200 dark:border-slate-800"}`}>
                <dt>{t("result.expiresAt")}{expired ? " ⚠" : ""}</dt>
                <dd className="font-mono text-xs">{result.value.expiresAt.toISOString()}</dd>
              </div>
            )}
            {result.value.notBefore && (
              <div className={`flex justify-between border-b py-1 ${notYetValid ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20" : "border-slate-200 dark:border-slate-800"}`}>
                <dt>{t("result.notBefore")}</dt>
                <dd className="font-mono text-xs">{result.value.notBefore.toISOString()}</dd>
              </div>
            )}
          </dl>

          {expired && <div className="rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200">{t("warning.expired")}</div>}
          {notYetValid && <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">{t("warning.notYetValid")}</div>}
        </div>
      )}
    </div>
  );
}
