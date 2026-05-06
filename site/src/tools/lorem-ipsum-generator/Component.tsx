"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit","voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum",
];

function randInt(max: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]! % max;
}
function randomWord() {
  return LOREM_WORDS[randInt(LOREM_WORDS.length)]!;
}
function caps(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function genSentence(): string {
  const len = 8 + randInt(10);
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(randomWord());
  return caps(words.join(" ")) + ".";
}
function genParagraph(sentencesCount: number, startWithLorem: boolean): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentencesCount; i++) sentences.push(genSentence());
  if (startWithLorem && sentences[0]) {
    sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  }
  return sentences.join(" ");
}

type Mode = "paragraphs" | "sentences" | "words";

export default function LoremIpsumGenerator() {
  const t = useTranslations("tools.lorem-ipsum-generator");
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [startLorem, setStartLorem] = useState(true);
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    void seed;
    if (mode === "paragraphs") {
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const sCount = 4 + randInt(4);
        out.push(genParagraph(sCount, i === 0 && startLorem));
      }
      return out.join("\n\n");
    } else if (mode === "sentences") {
      const out: string[] = [];
      for (let i = 0; i < count; i++) out.push(genSentence());
      if (startLorem && out[0]) out[0] = "Lorem ipsum dolor sit amet.";
      return out.join(" ");
    } else {
      const out: string[] = [];
      for (let i = 0; i < count; i++) out.push(randomWord());
      if (startLorem && out.length >= 2) {
        out[0] = "Lorem";
        out[1] = "ipsum";
      }
      return out.join(" ");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, count, startLorem, seed]);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          {(["paragraphs", "sentences", "words"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 text-sm ${mode === m ? "bg-brand-600 text-white" : ""}`}>
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          {t("count")}:
          <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))} className="w-20 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={startLorem} onChange={(e) => setStartLorem(e.target.checked)} />
          {t("startLorem")}
        </label>
        <button onClick={() => setSeed((s) => s + 1)} className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
          {t("regenerate")}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("output")}</span>
        <button onClick={copy} className="text-xs hover:underline">
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
      <div aria-live="polite" className="mt-1 max-h-[400px] overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
        {text}
      </div>
    </div>
  );
}
