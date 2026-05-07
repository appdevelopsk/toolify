"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function formatElapsed(ms: number): string {
  const totalMs = Math.floor(ms);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${mmm}`;
}

export default function Stopwatch() {
  const t = useTranslations("tools.stopwatch");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const baselineRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      const tick = () => {
        const now = performance.now();
        setElapsed(baselineRef.current + (now - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  function startStop() {
    if (running) {
      // pausing: capture current
      baselineRef.current = elapsed;
      setRunning(false);
    } else {
      startRef.current = performance.now();
      setRunning(true);
    }
  }

  function reset() {
    baselineRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }

  function addLap() {
    setLaps((prev) => [elapsed, ...prev]);
  }

  return (
    <div>
      <div aria-live="polite" className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="font-mono text-5xl tabular-nums sm:text-6xl">{formatElapsed(elapsed)}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={startStop}
          className={`rounded px-4 py-2 font-medium ${running ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
        >
          {running ? t("pause") : elapsed > 0 ? t("resume") : t("start")}
        </button>
        <button
          onClick={addLap}
          disabled={!running && elapsed === 0}
          className="rounded border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("lap")}
        </button>
        <button
          onClick={reset}
          disabled={elapsed === 0}
          className="rounded border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("reset")}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold">{t("laps")}</h2>
          <ol className="mt-2 space-y-1 text-sm">
            {laps.map((lap, i) => {
              const idx = laps.length - i;
              const next = laps[i + 1];
              const split = next === undefined ? lap : lap - next;
              return (
                <li key={i} className="flex justify-between gap-3 border-b border-slate-200 py-1 font-mono tabular-nums dark:border-slate-800">
                  <span className="text-slate-500">#{idx}</span>
                  <span>+{formatElapsed(split)}</span>
                  <span className="text-slate-500">{formatElapsed(lap)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
