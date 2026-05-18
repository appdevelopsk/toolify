"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type SolveFor = "voltage" | "current" | "resistance" | "power";
type CurrentUnit = "A" | "mA" | "uA";
type ResistanceUnit = "Ω" | "kΩ" | "MΩ";
type PowerUnit = "W" | "mW" | "kW";

interface CalcResult {
  V: number;
  I: number;
  R: number;
  P: number;
  formula: string;
}

interface ErrorResult {
  error: "invalidInput" | "divisionByZero" | "needTwoValues";
}

function toAmperes(value: number, unit: CurrentUnit): number {
  if (unit === "mA") return value / 1000;
  if (unit === "uA") return value / 1_000_000;
  return value;
}

function toOhms(value: number, unit: ResistanceUnit): number {
  if (unit === "kΩ") return value * 1000;
  if (unit === "MΩ") return value * 1_000_000;
  return value;
}

function toWatts(value: number, unit: PowerUnit): number {
  if (unit === "mW") return value / 1000;
  if (unit === "kW") return value * 1000;
  return value;
}

function formatSmart(value: number, locale: string): string {
  const fmt = (v: number, digits: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v);
  const abs = Math.abs(value);
  if (abs === 0) return fmt(0, 6);
  if (abs < 1e-6) return fmt(value * 1e9, 6) + " n";
  if (abs < 1e-3) return fmt(value * 1e6, 6) + " µ";
  if (abs < 1) return fmt(value * 1e3, 6) + " m";
  return fmt(value, 6);
}

export default function OhmLawCalculator() {
  const t = useTranslations("tools.ohm-law-calculator");
  const locale = useLocale();

  const [solveFor, setSolveFor] = useState<SolveFor>("voltage");

  // Voltage inputs
  const [voltageInput, setVoltageInput] = useState("");

  // Current inputs
  const [currentInput, setCurrentInput] = useState("");
  const [currentUnit, setCurrentUnit] = useState<CurrentUnit>("A");

  // Resistance inputs
  const [resistanceInput, setResistanceInput] = useState("");
  const [resistanceUnit, setResistanceUnit] = useState<ResistanceUnit>("Ω");

  // Power inputs (for solving power, can pick two of V/I/R)
  const [powerInput, setPowerInput] = useState("");
  const [powerUnit, setPowerUnit] = useState<PowerUnit>("W");
  // For power mode: which pair to use
  const [powerPair, setPowerPair] = useState<"VI" | "VR" | "IR">("VI");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const result = useMemo((): CalcResult | ErrorResult | null => {
    const parseV = parseFloat(voltageInput);
    const parseI = parseFloat(currentInput);
    const parseR = parseFloat(resistanceInput);
    const parseP = parseFloat(powerInput);

    const V_raw = isFinite(parseV) ? parseV : null;
    const I_raw = isFinite(parseI) ? toAmperes(parseI, currentUnit) : null;
    const R_raw = isFinite(parseR) ? toOhms(parseR, resistanceUnit) : null;
    const P_raw = isFinite(parseP) ? toWatts(parseP, powerUnit) : null;

    if (solveFor === "voltage") {
      if (I_raw === null || R_raw === null) return { error: "needTwoValues" };
      if (!isFinite(I_raw * R_raw)) return { error: "invalidInput" };
      const V = I_raw * R_raw;
      const P = V * I_raw;
      return { V, I: I_raw, R: R_raw, P, formula: "V = I × R" };
    }

    if (solveFor === "current") {
      if (V_raw === null || R_raw === null) return { error: "needTwoValues" };
      if (R_raw === 0) return { error: "divisionByZero" };
      const I = V_raw / R_raw;
      const P = V_raw * I;
      return { V: V_raw, I, R: R_raw, P, formula: "I = V / R" };
    }

    if (solveFor === "resistance") {
      if (V_raw === null || I_raw === null) return { error: "needTwoValues" };
      if (I_raw === 0) return { error: "divisionByZero" };
      const R = V_raw / I_raw;
      const P = V_raw * I_raw;
      return { V: V_raw, I: I_raw, R, P, formula: "R = V / I" };
    }

    if (solveFor === "power") {
      if (powerPair === "VI") {
        if (V_raw === null || I_raw === null) return { error: "needTwoValues" };
        const P = V_raw * I_raw;
        const R = I_raw === 0 ? Infinity : V_raw / I_raw;
        return { V: V_raw, I: I_raw, R, P, formula: "P = V × I" };
      }
      if (powerPair === "VR") {
        if (V_raw === null || R_raw === null) return { error: "needTwoValues" };
        if (R_raw === 0) return { error: "divisionByZero" };
        const P = (V_raw * V_raw) / R_raw;
        const I = V_raw / R_raw;
        return { V: V_raw, I, R: R_raw, P, formula: "P = V² / R" };
      }
      // IR
      if (I_raw === null || R_raw === null) return { error: "needTwoValues" };
      const P = I_raw * I_raw * R_raw;
      const V = I_raw * R_raw;
      return { V, I: I_raw, R: R_raw, P, formula: "P = I² × R" };
    }

    return null;
  }, [solveFor, voltageInput, currentInput, currentUnit, resistanceInput, resistanceUnit, powerInput, powerUnit, powerPair]);

  const isError = result && "error" in result;
  const calc = result && !("error" in result) ? (result as CalcResult) : null;

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";
  const selectClass =
    "rounded border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  function InputWithUnit({
    label,
    value,
    onChange,
    placeholder,
    unitValue,
    unitOptions,
    onUnitChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    unitValue: string;
    unitOptions: string[];
    onUnitChange: (v: string) => void;
  }) {
    return (
      <label className="block">
        <span className="text-sm font-medium">{label}</span>
        <div className="mt-1 flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={unitValue}
            onChange={(e) => onUnitChange(e.target.value)}
            className={selectClass}
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </label>
    );
  }

  function VoltageInput() {
    return (
      <label className="block">
        <span className="text-sm font-medium">{t("input.voltage")} (V)</span>
        <input
          type="number"
          value={voltageInput}
          onChange={(e) => setVoltageInput(e.target.value)}
          placeholder={t("input.voltagePlaceholder")}
          className={inputClass}
        />
      </label>
    );
  }

  function CurrentInput() {
    return (
      <InputWithUnit
        label={`${t("input.current")} (I)`}
        value={currentInput}
        onChange={setCurrentInput}
        placeholder={t("input.currentPlaceholder")}
        unitValue={currentUnit}
        unitOptions={["A", "mA", "uA"]}
        onUnitChange={(v) => setCurrentUnit(v as CurrentUnit)}
      />
    );
  }

  function ResistanceInput() {
    return (
      <InputWithUnit
        label={`${t("input.resistance")} (R)`}
        value={resistanceInput}
        onChange={setResistanceInput}
        placeholder={t("input.resistancePlaceholder")}
        unitValue={resistanceUnit}
        unitOptions={["Ω", "kΩ", "MΩ"]}
        onUnitChange={(v) => setResistanceUnit(v as ResistanceUnit)}
      />
    );
  }

  function renderInputs() {
    if (solveFor === "voltage") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <CurrentInput />
          <ResistanceInput />
        </div>
      );
    }
    if (solveFor === "current") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <VoltageInput />
          <ResistanceInput />
        </div>
      );
    }
    if (solveFor === "resistance") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <VoltageInput />
          <CurrentInput />
        </div>
      );
    }
    // power
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {(["VI", "VR", "IR"] as const).map((pair) => (
            <label key={pair} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="power-pair"
                value={pair}
                checked={powerPair === pair}
                onChange={() => setPowerPair(pair)}
              />
              {pair === "VI" && t("input.pairVI")}
              {pair === "VR" && t("input.pairVR")}
              {pair === "IR" && t("input.pairIR")}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(powerPair === "VI" || powerPair === "VR") && <VoltageInput />}
          {(powerPair === "VI" || powerPair === "IR") && <CurrentInput />}
          {(powerPair === "VR" || powerPair === "IR") && <ResistanceInput />}
        </div>
      </div>
    );
  }

  function ResultCard({
    label,
    symbol,
    value,
    unit,
    highlight,
  }: {
    label: string;
    symbol: string;
    value: number;
    unit: string;
    highlight?: boolean;
  }) {
    const smart = formatSmart(value, locale);
    return (
      <div
        className={`rounded-lg border px-4 py-3 ${
          highlight
            ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <dt className={`text-xs font-medium ${highlight ? "text-blue-700 dark:text-blue-300" : "text-slate-500"}`}>
          {symbol} — {label}
        </dt>
        <dd className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? "text-blue-700 dark:text-blue-200" : ""}`}>
          {smart}{unit}
        </dd>
        {!isNaN(value) && isFinite(value) && (
          <dd className="mt-0.5 text-xs tabular-nums text-slate-400">
            = {fmt.format(value)} {unit.trim()}
          </dd>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Solve-for selector */}
      <div className="mb-5">
        <span className="mb-2 block text-sm font-medium">{t("input.solveLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {(["voltage", "current", "resistance", "power"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSolveFor(opt)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                solveFor === opt
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 text-slate-700 hover:border-blue-400 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {opt === "voltage" && `V — ${t("input.voltage")}`}
              {opt === "current" && `I — ${t("input.current")}`}
              {opt === "resistance" && `R — ${t("input.resistance")}`}
              {opt === "power" && `P — ${t("input.power")}`}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic inputs */}
      {renderInputs()}

      {/* Results */}
      <div aria-live="polite" className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-center text-slate-400">{t("empty")}</p>
        ) : isError ? (
          <p className="text-center text-red-500">
            {t(`error.${(result as ErrorResult).error}`)}
          </p>
        ) : calc ? (
          <div className="space-y-4">
            {/* Formula badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">{t("result.formula")}:</span>
              <span className="rounded bg-amber-100 px-3 py-1 font-mono text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {calc.formula}
              </span>
            </div>

            {/* Result grid */}
            <dl className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label={t("result.voltage")}
                symbol="V"
                value={calc.V}
                unit=" V"
                highlight={solveFor === "voltage"}
              />
              <ResultCard
                label={t("result.current")}
                symbol="I"
                value={calc.I}
                unit=" A"
                highlight={solveFor === "current"}
              />
              <ResultCard
                label={t("result.resistance")}
                symbol="R"
                value={calc.R}
                unit=" Ω"
                highlight={solveFor === "resistance"}
              />
              <ResultCard
                label={t("result.power")}
                symbol="P"
                value={calc.P}
                unit=" W"
                highlight={solveFor === "power"}
              />
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
