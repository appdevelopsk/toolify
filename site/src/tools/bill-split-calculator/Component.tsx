"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const TIP_PRESETS = [10, 15, 18, 20, 25];
const MIN_PEOPLE = 1;
const MAX_PEOPLE = 20;

interface Person {
  id: number;
  name: string;
  sharePct: string; // stored as string for controlled input
}

function makePeople(count: number): Person[] {
  const pct = (100 / count).toFixed(4);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: "",
    sharePct: pct,
  }));
}

function redistributeEvenly(people: Person[]): Person[] {
  const n = people.length;
  if (n === 0) return people;
  const base = Math.floor((100 / n) * 100) / 100; // 2dp floor
  const remainder = parseFloat((100 - base * n).toFixed(2));
  return people.map((p, i) => ({
    ...p,
    sharePct: i === 0 ? (base + remainder).toFixed(2) : base.toFixed(2),
  }));
}

export default function BillSplitCalculator() {
  const t = useTranslations("tools.bill-split-calculator");
  const locale = useLocale();

  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState("15");
  const [numPeople, setNumPeople] = useState("2");
  const [isUnequal, setIsUnequal] = useState(false);
  const [persons, setPersons] = useState<Person[]>(() => makePeople(2));
  const [nextId, setNextId] = useState(2);

  // Currency formatter
  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "ja" ? "JPY" : "USD",
      }),
    [locale],
  );

  // Parse inputs
  const billVal = parseFloat(bill);
  const tipVal = parseFloat(tipPct);
  const numVal = Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, parseInt(numPeople, 10) || MIN_PEOPLE));

  const isValidBill = isFinite(billVal) && billVal > 0;
  const isValidTip = isFinite(tipVal) && tipVal >= 0;

  // Unequal split validation
  const sharesSum = useMemo(
    () => persons.reduce((acc, p) => acc + (parseFloat(p.sharePct) || 0), 0),
    [persons],
  );
  const sharesValid = Math.abs(sharesSum - 100) < 0.01;

  // Equal-split result
  const equalResult = useMemo(() => {
    if (!isValidBill || !isValidTip) return null;
    const tipAmt = (billVal * tipVal) / 100;
    const total = billVal + tipAmt;
    const perPersonExact = total / numVal;

    // Rounding distribution
    const perPersonFloor = Math.floor(perPersonExact * 100) / 100;
    const totalFloor = perPersonFloor * numVal;
    const extraCents = Math.round((total - totalFloor) * 100);

    return {
      tipAmount: tipAmt,
      totalWithTip: total,
      perPersonBase: perPersonFloor,
      extraCents,
      perPersonTip: tipAmt / numVal,
    };
  }, [billVal, tipVal, numVal, isValidBill, isValidTip]);

  // Unequal-split result per person
  const unequalResult = useMemo(() => {
    if (!isValidBill || !isValidTip || !sharesValid) return null;
    const tipAmt = (billVal * tipVal) / 100;
    const total = billVal + tipAmt;
    return persons.map((p) => {
      const frac = (parseFloat(p.sharePct) || 0) / 100;
      return {
        id: p.id,
        name: p.name,
        sharePct: p.sharePct,
        amount: total * frac,
      };
    });
  }, [billVal, tipVal, persons, sharesValid, isValidBill, isValidTip]);

  // ---- handlers ----

  const handleNumPeopleChange = useCallback(
    (raw: string) => {
      setNumPeople(raw);
      const n = Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, parseInt(raw, 10) || MIN_PEOPLE));
      if (!isNaN(n)) {
        setPersons((prev) => {
          const current = redistributeEvenly(prev);
          if (n > current.length) {
            const added: Person[] = Array.from({ length: n - current.length }, (_, i) => ({
              id: nextId + i,
              name: "",
              sharePct: "0",
            }));
            setNextId((id) => id + added.length);
            return redistributeEvenly([...current, ...added]);
          }
          return redistributeEvenly(current.slice(0, n));
        });
      }
    },
    [nextId],
  );

  const stepPeople = useCallback(
    (delta: number) => {
      const next = Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, numVal + delta));
      handleNumPeopleChange(String(next));
    },
    [numVal, handleNumPeopleChange],
  );

  const updatePersonName = useCallback((id: number, name: string) => {
    setPersons((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const updatePersonShare = useCallback((id: number, val: string) => {
    setPersons((prev) => prev.map((p) => (p.id === id ? { ...p, sharePct: val } : p)));
  }, []);

  const addPerson = useCallback(() => {
    setPersons((prev) => {
      const added: Person = { id: nextId, name: "", sharePct: "0" };
      setNextId((id) => id + 1);
      const updated = redistributeEvenly([...prev, added]);
      setNumPeople(String(updated.length));
      return updated;
    });
  }, [nextId]);

  const removePerson = useCallback((id: number) => {
    setPersons((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((p) => p.id !== id);
      const updated = redistributeEvenly(filtered);
      setNumPeople(String(updated.length));
      return updated;
    });
  }, []);

  const redistributeAll = useCallback(() => {
    setPersons((prev) => redistributeEvenly(prev));
  }, []);

  // ---- render ----

  return (
    <div className="space-y-6">
      {/* ── Inputs ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Bill amount */}
        <label className="block">
          <span className="text-sm font-medium">{t("input.billAmount")}</span>
          <input
            inputMode="decimal"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="50.00"
          />
        </label>

        {/* Tip % */}
        <label className="block">
          <span className="text-sm font-medium">{t("input.tipPercent")}</span>
          <input
            inputMode="decimal"
            value={tipPct}
            onChange={(e) => setTipPct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={isFinite(tipVal) ? tipVal : 15}
            onChange={(e) => setTipPct(e.target.value)}
            className="mt-2 w-full accent-brand-600"
            aria-label={t("input.tipPercent")}
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {TIP_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTipPct(String(p))}
                className={`rounded border px-2 py-1 text-xs ${
                  tipPct === String(p)
                    ? "border-brand-500 bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </label>

        {/* Number of people */}
        <div className="block">
          <span className="text-sm font-medium">{t("input.numPeople")}</span>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepPeople(-1)}
              disabled={numVal <= MIN_PEOPLE}
              className="flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-lg font-bold hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Decrease"
            >
              −
            </button>
            <input
              inputMode="numeric"
              value={numPeople}
              onChange={(e) => handleNumPeopleChange(e.target.value)}
              className="w-16 rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={() => stepPeople(1)}
              disabled={numVal >= MAX_PEOPLE}
              className="flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-lg font-bold hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Split mode toggle ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isUnequal}
          onClick={() => setIsUnequal((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
            isUnequal ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform ${
              isUnequal ? "translate-x-6" : ""
            }`}
          />
        </button>
        <span className="text-sm font-medium">
          {isUnequal ? t("input.splitMode.unequal") : t("input.splitMode.equal")}
        </span>
      </div>

      {/* ── Equal split results ── */}
      {!isUnequal && (
        <div
          aria-live="polite"
          className={`rounded-lg border p-4 ${
            equalResult
              ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          {equalResult ? (
            <>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.tipAmount")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format(equalResult.tipAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.totalWithTip")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format(equalResult.totalWithTip)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.perPerson")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format(
                      equalResult.extraCents > 0
                        ? equalResult.perPersonBase + 0.01
                        : equalResult.perPersonBase,
                    )}
                    {equalResult.extraCents > 1 && (
                      <span className="ml-1 text-base font-normal text-slate-500">
                        / {currency.format(equalResult.perPersonBase)}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.perPersonTip")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format(equalResult.perPersonTip)}
                  </dd>
                </div>
              </dl>
              {equalResult.extraCents > 0 && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {t("result.roundingNote", {
                    cents: equalResult.extraCents,
                    count: equalResult.extraCents,
                  })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {bill === ""
                ? t("empty")
                : t("error.invalidInput")}
            </p>
          )}
        </div>
      )}

      {/* ── Unequal split ── */}
      {isUnequal && (
        <div aria-live="polite" className="space-y-4">
          {/* Shares not 100% warning */}
          {!sharesValid && persons.length > 0 && (
            <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {t("error.sharesNotEqual", { total: sharesSum.toFixed(2) })}
            </p>
          )}

          {/* Person table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">{t("table.person")}</th>
                  <th className="px-4 py-2 text-right">{t("table.sharePercent")}</th>
                  <th className="px-4 py-2 text-right">{t("table.shareAmount")}</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {persons.map((person, idx) => {
                  const amountRow = unequalResult?.find((r) => r.id === person.id);
                  return (
                    <tr key={person.id} className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePersonName(person.id, e.target.value)}
                          placeholder={`${t("input.personName")} ${idx + 1}`}
                          className="w-full rounded border border-slate-200 bg-transparent px-2 py-1 focus:border-brand-400 focus:outline-none dark:border-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            inputMode="decimal"
                            value={person.sharePct}
                            onChange={(e) => updatePersonShare(person.id, e.target.value)}
                            className="w-20 rounded border border-slate-200 bg-transparent px-2 py-1 text-right focus:border-brand-400 focus:outline-none dark:border-slate-700"
                            aria-label={t("input.personShare")}
                          />
                          <span className="text-slate-500">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums">
                        {amountRow && isValidBill
                          ? currency.format(amountRow.amount)
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removePerson(person.id)}
                          disabled={persons.length <= 1}
                          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-red-400"
                          aria-label={t("table.removePerson")}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <td className="px-4 py-2 text-xs font-medium text-slate-500">
                    {/* share sum indicator */}
                    <span
                      className={
                        sharesValid
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }
                    >
                      {sharesSum.toFixed(2)}% / 100%
                    </span>
                  </td>
                  <td colSpan={3} className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={redistributeAll}
                      className="mr-2 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      ↺ Even
                    </button>
                    <button
                      type="button"
                      onClick={addPerson}
                      disabled={persons.length >= MAX_PEOPLE}
                      className="rounded border border-brand-400 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20"
                    >
                      + {t("table.addPerson")}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Unequal summary */}
          {unequalResult && isValidBill && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-900/20">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.tipAmount")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format((billVal * tipVal) / 100)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.totalWithTip")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {currency.format(billVal + (billVal * tipVal) / 100)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {!isValidBill && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("empty")}</p>
          )}
        </div>
      )}
    </div>
  );
}
