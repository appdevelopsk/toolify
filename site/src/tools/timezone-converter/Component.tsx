"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useShareableState } from "@/lib/hooks/useShareableState";
import { nowInZone, resolveWallTime } from "./timezone-math";

const WALL_TIME_NOTES: Record<string, { invalid: string; repeated: string }> = {
  en: { invalid: "This local time does not exist in the selected time zone or is invalid.", repeated: "If a local time occurs twice during a clock change, the earlier instant is used." },
  ja: { invalid: "選択したタイムゾーンに存在しない時刻、または無効な日時です。", repeated: "時刻変更で同じ現地時刻が2回ある場合は、早い方の時刻を使用します。" },
  "zh-CN": { invalid: "所选时区中不存在该本地时间，或日期时间无效。", repeated: "时钟调整导致同一本地时间出现两次时，使用较早的时刻。" },
  "zh-TW": { invalid: "所選時區中不存在該本地時間，或日期時間無效。", repeated: "時鐘調整導致同一本地時間出現兩次時，採用較早的時刻。" },
  ko: { invalid: "선택한 시간대에 존재하지 않거나 유효하지 않은 시간입니다.", repeated: "시계 변경으로 같은 현지 시간이 두 번 나타나면 더 이른 시각을 사용합니다." },
  es: { invalid: "Esta hora local no existe en la zona elegida o no es válida.", repeated: "Si una hora local se repite por un cambio de reloj, se usa el instante anterior." },
  "pt-BR": { invalid: "Esse horário local não existe no fuso escolhido ou é inválido.", repeated: "Se um horário local se repetir na mudança do relógio, será usado o primeiro instante." },
  fr: { invalid: "Cette heure locale n’existe pas dans le fuseau choisi ou est invalide.", repeated: "Si une heure locale se répète lors d’un changement d’heure, la première occurrence est utilisée." },
  de: { invalid: "Diese Ortszeit existiert in der gewählten Zeitzone nicht oder ist ungültig.", repeated: "Bei einer doppelt auftretenden Ortszeit wird der frühere Zeitpunkt verwendet." },
  it: { invalid: "Quest’ora locale non esiste nel fuso scelto o non è valida.", repeated: "Se un’ora locale si ripete al cambio dell’ora, viene usata la prima occorrenza." },
  ru: { invalid: "Такое местное время не существует в выбранном часовом поясе или недопустимо.", repeated: "Если при переводе часов местное время повторяется, используется более ранний момент." },
  ar: { invalid: "هذا الوقت المحلي غير موجود في المنطقة الزمنية المحددة أو غير صالح.", repeated: "إذا تكرر الوقت المحلي عند تغيير الساعة، يُستخدم الوقت الأسبق." },
  hi: { invalid: "चुने गए समय क्षेत्र में यह स्थानीय समय मौजूद नहीं है या अमान्य है।", repeated: "घड़ी बदलने पर स्थानीय समय दो बार आए तो पहले वाले समय का उपयोग होता है।" },
  id: { invalid: "Waktu lokal ini tidak ada di zona waktu yang dipilih atau tidak valid.", repeated: "Jika waktu lokal berulang saat jam berubah, waktu yang lebih awal digunakan." },
  th: { invalid: "เวลาท้องถิ่นนี้ไม่มีอยู่ในเขตเวลาที่เลือกหรือไม่ถูกต้อง", repeated: "หากเวลาท้องถิ่นซ้ำเมื่อปรับนาฬิกา จะใช้เวลาที่เกิดขึ้นก่อน" },
  vi: { invalid: "Giờ địa phương này không tồn tại trong múi giờ đã chọn hoặc không hợp lệ.", repeated: "Nếu giờ địa phương lặp lại khi đổi giờ, thời điểm sớm hơn sẽ được dùng." },
  tr: { invalid: "Bu yerel saat seçilen saat diliminde yok veya geçersiz.", repeated: "Saat değişiminde aynı yerel saat iki kez oluşursa daha erken olan an kullanılır." },
};

const COMMON_TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
  "America/Toronto", "America/Mexico_City", "America/Anchorage", "Pacific/Honolulu",
  "Atlantic/Reykjavik", "Europe/Madrid", "Europe/Istanbul", "Africa/Lagos", "Africa/Johannesburg",
  "Asia/Karachi", "Asia/Dhaka", "Asia/Ho_Chi_Minh", "Asia/Jakarta", "Asia/Manila",
  "Asia/Hong_Kong", "Asia/Taipei", "Australia/Perth",
];

function pad(n: number) { return String(n).padStart(2, "0"); }

// UTC offset of `tz` at the given moment, in minutes
function offsetMinutes(date: Date, tz: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date);
    const p: Record<string, string> = {};
    for (const x of parts) p[x.type] = x.value;
    const asUtc = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour! % 24, +p.minute!);
    return Math.round((asUtc - date.getTime()) / 60000);
  } catch {
    return null;
  }
}

const BIZ_START = 9 * 60;
const BIZ_END = 18 * 60;

function hhmm(totalMin: number): string {
  const m = ((totalMin % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

// Overlap of 9:00–18:00 business hours in both zones, at the given moment's offsets.
// Returns intervals expressed in each zone's local time, or null when there is no overlap.
function businessOverlap(
  date: Date,
  sourceTz: string,
  targetTz: string,
): { source: string; target: string } | null {
  const offSource = offsetMinutes(date, sourceTz);
  const offTarget = offsetMinutes(date, targetTz);
  if (offSource === null || offTarget === null) return null;
  const d = offTarget - offSource; // add to source-local time to get target-local time
  let best: { start: number; end: number } | null = null;
  for (const k of [-1440, 0, 1440]) {
    // target's business window expressed in source-local minutes
    const s = Math.max(BIZ_START, BIZ_START - d + k);
    const e = Math.min(BIZ_END, BIZ_END - d + k);
    if (e > s && (!best || e - s > best.end - best.start)) best = { start: s, end: e };
  }
  if (!best) return null;
  return {
    source: `${hhmm(best.start)}–${hhmm(best.end)}`,
    target: `${hhmm(best.start + d)}–${hhmm(best.end + d)}`,
  };
}

function inTzString(date: Date, tz: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return "(invalid)";
  }
}

export default function TimezoneConverter() {
  const t = useTranslations("tools.timezone-converter");
  const locale = useLocale();
  const wallNote = WALL_TIME_NOTES[locale] ?? WALL_TIME_NOTES.en!;
  const [sourceTz, setSourceTz] = useState<string>("");
  const [targetTzs, setTargetTzs] = useState<string[]>(["America/New_York", "Europe/London", "Asia/Tokyo"]);
  const [dt, setDt] = useState<string>("");
  // 「今日」由来の既定値は静的書き出し時とブラウザーで値がズレる(hydration mismatch)ため、
  // useState 初期化ではなくマウント後に入れる。
  useEffect(() => {
    if (sourceTz) setDt((prev) => (prev === "" ? nowInZone(sourceTz) : prev));
  }, [sourceTz]);

  useEffect(() => {
    if (!sourceTz) {
      try {
        const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSourceTz(COMMON_TIMEZONES.includes(browserZone) ? browserZone : "UTC");
      } catch {
        setSourceTz("UTC");
      }
    }
  }, [sourceTz]);

  useShareableState(
    "timezone-converter",
    { sourceTz, targetTzs, dt },
    (d) => {
      if (typeof d.sourceTz === "string" && COMMON_TIMEZONES.includes(d.sourceTz)) setSourceTz(d.sourceTz);
      if (Array.isArray(d.targetTzs)) setTargetTzs([...new Set(d.targetTzs.filter((x: unknown): x is string => typeof x === "string" && COMMON_TIMEZONES.includes(x)))]);
      if (typeof d.dt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(d.dt)) setDt(d.dt);
    },
  );

  // Interpret the entered wall time in the selected IANA zone.
  const sourceDate = useMemo(() => resolveWallTime(dt, sourceTz), [dt, sourceTz]);

  function setNow() { setDt(nowInZone(sourceTz)); }
  function addTz(tz: string) {
    if (COMMON_TIMEZONES.includes(tz) && !targetTzs.includes(tz)) setTargetTzs((arr) => [...arr, tz]);
  }
  function removeTz(tz: string) { setTargetTzs((arr) => arr.filter((x) => x !== tz)); }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.sourceTz")}</span>
          <select value={sourceTz} onChange={(e) => setSourceTz(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.dt")}</span>
          <div className="mt-1 flex gap-2">
            <input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} aria-describedby="timezone-wall-note" aria-invalid={Boolean(dt && sourceTz && !sourceDate)} className="flex-1 rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <button onClick={setNow} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{t("now")}</button>
          </div>
        </label>
      </div>

      <p id="timezone-wall-note" className="mt-2 text-xs text-slate-600 dark:text-slate-400">{wallNote.repeated}</p>
      {dt && sourceTz && !sourceDate && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{wallNote.invalid}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("addTz")}:</span>
        <select onChange={(e) => { addTz(e.target.value); e.target.value = ""; }} className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="">—</option>
          {COMMON_TIMEZONES.filter((tz) => !targetTzs.includes(tz)).map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div aria-live="polite" className="mt-6 space-y-2">
        {targetTzs.map((tz) => {
          const overlap = sourceDate && tz !== sourceTz ? businessOverlap(sourceDate, sourceTz, tz) : null;
          return (
            <div key={tz} className="rounded border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{tz}</div>
                  <div className="font-mono text-lg tabular-nums">
                    {sourceDate ? inTzString(sourceDate, tz, locale) : "—"}
                  </div>
                </div>
                <button onClick={() => removeTz(tz)} aria-label={t("remove")} className="text-slate-400 hover:text-red-600">×</button>
              </div>
              {sourceDate && tz !== sourceTz && (
                <div className="mt-2 border-t border-dashed border-slate-200 pt-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  {overlap ? (
                    <>
                      <span className="font-medium">{t("overlap.label")}: </span>
                      <span className="tabular-nums">{overlap.source} ({sourceTz})</span>
                      {" = "}
                      <span className="tabular-nums">{overlap.target} ({tz})</span>
                    </>
                  ) : (
                    <span>{t("overlap.none")}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {targetTzs.length === 0 && <div className="rounded border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-700">{t("empty")}</div>}
      </div>
    </div>
  );
}
