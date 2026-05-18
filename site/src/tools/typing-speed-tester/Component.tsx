"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const PASSAGES = [
  "The Amazon rainforest spans nine countries and produces about twenty percent of the world's oxygen. Its canopy shelters millions of species, many still undiscovered. Climate scientists warn that deforestation could push this ecosystem past a tipping point, transforming vast stretches of jungle into dry savanna within decades.",
  "The invention of the printing press in the fifteenth century transformed how knowledge spread across Europe. Johannes Gutenberg's movable type allowed books to be produced faster and at lower cost, ending the monastery's monopoly on literacy. Within fifty years, millions of books circulated ideas that fueled the Renaissance and Reformation.",
  "Modern smartphones pack more computing power than the Apollo mission's entire ground support system. Each tap on a glass screen triggers billions of transistors. Engineers now etch circuits smaller than a virus onto silicon wafers, pushing the physical limits of matter itself to keep pace with Moore's Law.",
  "Deep beneath the ocean surface, hydrothermal vents support entire ecosystems that need no sunlight. Bacteria convert sulfur compounds into energy through chemosynthesis, forming the base of a food chain that includes tube worms, crabs, and shrimp. These communities suggest that life could exist on ice-covered moons like Europa.",
  "The Great Wall of China, built over many centuries by successive dynasties, stretches thousands of miles across mountains and deserts. Contrary to popular belief, it is not visible from space with the naked eye. Its purpose was less a single defensive barrier than a series of regional fortifications managing trade and migration.",
  "Jazz emerged from New Orleans in the early twentieth century, blending African rhythms, blues, and European harmony into something entirely new. Improvisation sits at its heart: musicians converse in real time, responding to each other's phrases. From bebop to fusion, jazz kept reinventing itself, influencing nearly every genre that followed.",
];

type Phase = "idle" | "typing" | "done";

export default function TypingSpeedTester() {
  const t = useTranslations("tools.typing-speed-tester");

  const [passageIndex, setPassageIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [, setTick] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const passage = PASSAGES[passageIndex % PASSAGES.length]!;

  // Live timer refresh every 200 ms while typing
  useEffect(() => {
    if (phase !== "typing") return;
    const id = setInterval(() => setTick((x) => x + 1), 200);
    return () => clearInterval(id);
  }, [phase]);

  const stats = useMemo(() => {
    if (startTime == null) return null;
    const now = endTime ?? Date.now();
    const elapsedMs = Math.max(now - startTime, 1);
    const elapsedSec = elapsedMs / 1000;
    const elapsedMin = elapsedMs / 60000;

    let correctCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correctCount++;
    }
    const accuracy = typed.length === 0 ? 100 : (correctCount / typed.length) * 100;
    // WPM = correctly-typed chars / 5 / elapsed minutes (gross WPM)
    const wpm = typed.length / 5 / elapsedMin;

    return { wpm, accuracy, elapsedSec };
  }, [typed, passage, startTime, endTime]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      // Don't accept input beyond passage length
      if (value.length > passage.length) return;

      if (phase === "idle" && value.length > 0) {
        setStartTime(Date.now());
        setPhase("typing");
      }
      setTyped(value);

      if (value === passage) {
        setEndTime(Date.now());
        setPhase("done");
      }
    },
    [passage, phase]
  );

  const handleReset = useCallback(() => {
    setPassageIndex((i) => (i + 1) % PASSAGES.length);
    setTyped("");
    setStartTime(null);
    setEndTime(null);
    setPhase("idle");
    // Focus after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const fmt1 = (n: number) => Math.round(n).toLocaleString();
  const fmt2 = (n: number) => n.toFixed(1);
  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const progressPct = passage.length > 0 ? Math.round((typed.length / passage.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Sample text display */}
      <div
        className="cursor-text rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-base leading-relaxed dark:border-slate-800 dark:bg-slate-900"
        onClick={() => inputRef.current?.focus()}
        aria-label="Sample passage"
      >
        {Array.from(passage).map((ch, i) => {
          const typedCh = typed[i];
          let cls = "text-slate-400 dark:text-slate-500";
          if (typedCh !== undefined) {
            cls =
              typedCh === ch
                ? "text-emerald-600 dark:text-emerald-400"
                : "bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-200";
          }
          const isCursor = i === typed.length && phase !== "done";
          return (
            <span key={i} className={`${cls}${isCursor ? " border-l-2 border-brand-500 animate-pulse" : ""}`}>
              {ch}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      {phase === "typing" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Input textarea */}
      {phase !== "done" && (
        <textarea
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          rows={4}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={phase === "idle" ? t("start") : undefined}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-base focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Typing input"
        />
      )}

      {/* Live stats during typing */}
      {phase === "typing" && stats && (
        <div
          aria-live="polite"
          className="grid grid-cols-3 gap-3 text-center"
        >
          <StatCard label={t("wpm")} value={fmt1(stats.wpm)} />
          <StatCard label={t("accuracy")} value={`${fmt2(stats.accuracy)}%`} />
          <StatCard label={t("time")} value={fmtTime(stats.elapsedSec)} />
        </div>
      )}

      {/* Results screen */}
      {phase === "done" && stats && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="mb-4 text-xl font-bold text-emerald-800 dark:text-emerald-200">
            {t("result.title")}
          </p>
          <div className="mx-auto mb-6 grid max-w-sm grid-cols-3 gap-4">
            <ResultCard label={t("result.wpm")} value={fmt1(stats.wpm)} unit="WPM" />
            <ResultCard label={t("result.accuracy")} value={`${fmt2(stats.accuracy)}%`} />
            <ResultCard label={t("result.time")} value={fmtTime(stats.elapsedSec)} />
          </div>
          <button
            onClick={handleReset}
            className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {t("restart")}
          </button>
        </div>
      )}

      {/* Try again button while idle/typing */}
      {phase !== "done" && (
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {t("restart")}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function ResultCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-slate-900">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
        {value}
      </div>
      {unit && <div className="text-xs text-slate-400">{unit}</div>}
    </div>
  );
}
