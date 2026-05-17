"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Phase = "focus" | "shortBreak" | "longBreak";
const DURATIONS: Record<Phase, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function PomodoroTimer() {
  const t = useTranslations("tools.pomodoro-timer");
  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          beep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      if (phase === "focus") {
        const newCount = completedFocus + 1;
        setCompletedFocus(newCount);
        const next: Phase = newCount % 4 === 0 ? "longBreak" : "shortBreak";
        setPhase(next);
        setRemaining(DURATIONS[next]);
      } else {
        setPhase("focus");
        setRemaining(DURATIONS.focus);
      }
    }
  }, [remaining, running, phase, completedFocus]);

  function beep() {
    try {
      if (!audioCtxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch { /* audio not available */ }
  }

  function toggle() { setRunning((r) => !r); }
  function reset() {
    setRunning(false);
    setRemaining(DURATIONS[phase]);
  }
  function switchPhase(p: Phase) {
    setRunning(false);
    setPhase(p);
    setRemaining(DURATIONS[p]);
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const phaseColor = phase === "focus" ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-900/20" :
                    phase === "shortBreak" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" :
                    "border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-900/20";

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        {(["focus", "shortBreak", "longBreak"] as Phase[]).map((p) => (
          <button key={p} onClick={() => switchPhase(p)} className={`px-3 py-1.5 text-sm ${phase === p ? "bg-brand-600 text-white" : ""}`}>
            {t(`phase.${p}`)}
          </button>
        ))}
      </div>

      <div aria-live="polite" className={`rounded-lg border-2 p-8 text-center ${phaseColor}`}>
        <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t(`phase.${phase}`)}</div>
        <div className="mt-2 font-mono text-7xl font-bold tabular-nums sm:text-8xl">
          {pad(minutes)}:{pad(seconds)}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button onClick={toggle} className="rounded bg-brand-600 px-6 py-2 text-base font-medium text-white hover:bg-brand-700">
            {running ? t("pause") : t("start")}
          </button>
          <button onClick={reset} className="rounded border border-slate-300 px-6 py-2 text-base font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            {t("reset")}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("stat.completedFocus")}</div>
          <div className="text-2xl font-bold tabular-nums">{completedFocus}</div>
        </div>
        <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("stat.totalFocusMinutes")}</div>
          <div className="text-2xl font-bold tabular-nums">{completedFocus * 25}</div>
        </div>
      </div>
    </div>
  );
}
