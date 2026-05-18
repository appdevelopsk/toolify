"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  charCode: number;
  location: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

const LOCATION_NAMES: Record<number, string> = {
  0: "Standard",
  1: "Left",
  2: "Right",
  3: "Numpad",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
      <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {value}
      </code>
    </div>
  );
}

export default function KeycodeFinder() {
  const t = useTranslations("tools.keycode-finder");
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [history, setHistory] = useState<KeyInfo[]>([]);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const info: KeyInfo = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        charCode: e.charCode,
        location: e.location,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
      };
      setKeyInfo(info);
      setHistory((prev) => [info, ...prev].slice(0, 10));
    };

    const zone = zoneRef.current;
    zone?.addEventListener("keydown", handler);
    return () => zone?.removeEventListener("keydown", handler);
  }, []);

  const modifiers = keyInfo
    ? [
        keyInfo.ctrlKey && "Ctrl",
        keyInfo.altKey && "Alt",
        keyInfo.shiftKey && "Shift",
        keyInfo.metaKey && "Meta",
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div
        ref={zoneRef}
        tabIndex={0}
        className="flex min-h-[120px] cursor-text items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        aria-label={t("zone.label")}
      >
        {keyInfo ? (
          <div>
            <div className="text-5xl font-bold text-brand-600 dark:text-brand-400">
              {keyInfo.key === " " ? t("key.space") : keyInfo.key.length === 1 ? keyInfo.key : ""}
            </div>
            <div className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
              {keyInfo.code}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">{t("zone.prompt")}</p>
        )}
      </div>

      {keyInfo && (
        <div aria-live="polite" className="grid gap-2 sm:grid-cols-2">
          <InfoRow label="key" value={keyInfo.key === " " ? "Space" : keyInfo.key} />
          <InfoRow label="code" value={keyInfo.code} />
          <InfoRow label="keyCode" value={String(keyInfo.keyCode)} />
          <InfoRow label="which" value={String(keyInfo.which)} />
          <InfoRow label="charCode" value={String(keyInfo.charCode)} />
          <InfoRow label="location" value={`${keyInfo.location} (${LOCATION_NAMES[keyInfo.location] ?? ""})`} />
          <InfoRow
            label={t("label.modifiers")}
            value={modifiers.length > 0 ? modifiers.join(" + ") : t("label.none")}
          />
        </div>
      )}

      {history.length > 1 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t("history.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.slice(1).map((k, i) => (
              <span
                key={i}
                className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {k.key === " " ? "Space" : k.key} ({k.keyCode})
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
