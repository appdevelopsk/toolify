"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";

type ErrorLevel = "L" | "M" | "Q" | "H";
type QRSize = 200 | 300 | 400;

export default function QrCodeGenerator() {
  const t = useTranslations("tools.qr-code-generator");
  const [text, setText] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState<QRSize>(300);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setGenerating(true);
    setError(null);

    QRCode.toDataURL(text, {
      errorCorrectionLevel: errorLevel,
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setGenerating(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setDataUrl(null);
          setGenerating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, errorLevel, size]);

  return (
    <div>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">{t("input.text")}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="https://example.com"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.errorLevel")}</span>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="L">{t("errorLevel.L")}</option>
              <option value="M">{t("errorLevel.M")}</option>
              <option value="Q">{t("errorLevel.Q")}</option>
              <option value="H">{t("errorLevel.H")}</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">{t("input.size")}</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value) as QRSize)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value={200}>200 px</option>
              <option value={300}>300 px</option>
              <option value={400}>400 px</option>
            </select>
          </label>
        </div>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          dataUrl
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : generating ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Generating…</p>
        ) : dataUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={dataUrl}
              alt="Generated QR code"
              width={size}
              height={size}
              className="rounded"
              style={{ imageRendering: "pixelated" }}
            />
            <a
              href={dataUrl}
              download="qr-code.png"
              className="inline-flex items-center rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("result.download")}
            </a>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
