"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const EXT: Record<OutputFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageResizer() {
  const t = useTranslations("tools.image-resizer");
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [sourceName, setSourceName] = useState("image");
  const [sourceSize, setSourceSize] = useState(0);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBytes, setResultBytes] = useState(0);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const urlRef = useRef("");

  // 生成済み Blob URL はブラウザが自動解放しないため、差し替えとアンマウントの両方で revoke する。
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const bmp = await createImageBitmap(file);
      setBitmap(bmp);
      setSourceName(file.name.replace(/\.[^.]+$/, "") || "image");
      setSourceSize(file.size);
      setWidth(String(bmp.width));
      setHeight(String(bmp.height));
    } catch {
      setError(t("error.decode"));
    }
  }

  function onWidthChange(v: string) {
    setWidth(v);
    if (lockRatio && bitmap) {
      const w = Number(v);
      if (w > 0) setHeight(String(Math.max(1, Math.round((w * bitmap.height) / bitmap.width))));
    }
  }

  function onHeightChange(v: string) {
    setHeight(v);
    if (lockRatio && bitmap) {
      const h = Number(v);
      if (h > 0) setWidth(String(Math.max(1, Math.round((h * bitmap.width) / bitmap.height))));
    }
  }

  useEffect(() => {
    if (!bitmap) return;
    const w = Math.round(Number(width));
    const h = Math.round(Number(height));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1 || w > 8000 || h > 8000) return;

    let cancelled = false;
    setWorking(true);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setWorking(false);
      setError(t("error.canvas"));
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (format === "image/jpeg") {
      // JPEG は透過を持てず、未塗りのまま書き出すと透明部分が黒く潰れる。
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (cancelled || !blob) {
          setWorking(false);
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setResultUrl(url);
        setResultBytes(blob.size);
        setWorking(false);
      },
      format,
      format === "image/png" ? undefined : quality / 100,
    );

    return () => {
      cancelled = true;
    };
  }, [bitmap, width, height, format, quality, t]);

  return (
    <div>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">{t("input.file")}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0])}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.width")}</span>
            <input
              type="number"
              min={1}
              max={8000}
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              placeholder="1280"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">{t("input.height")}</span>
            <input
              type="number"
              min={1}
              max={8000}
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              placeholder="720"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lockRatio}
            onChange={(e) => setLockRatio(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
          />
          <span className="text-sm font-medium">{t("input.lockRatio")}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.format")}</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="image/png">{t("format.png")}</option>
              <option value="image/jpeg">{t("format.jpeg")}</option>
              <option value="image/webp">{t("format.webp")}</option>
            </select>
          </label>

          {format !== "image/png" && (
            <label className="block">
              <span className="text-sm font-medium">
                {t("input.quality")}: {quality}
              </span>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-3 w-full"
              />
            </label>
          )}
        </div>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          resultUrl
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : working ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Working…</p>
        ) : resultUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={resultUrl}
              alt={t("result.preview")}
              className="max-h-80 max-w-full rounded border border-slate-200 dark:border-slate-800"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {width} × {height} px · {formatBytes(resultBytes)}
              {sourceSize > 0 && ` (${t("result.original")}: ${formatBytes(sourceSize)})`}
            </p>
            <a
              href={resultUrl}
              download={`${sourceName}-${width}x${height}.${EXT[format]}`}
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
