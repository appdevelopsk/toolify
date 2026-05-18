"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type Entity = "owner" | "group" | "other";
type Perm = "read" | "write" | "execute";

interface PermState {
  owner: { read: boolean; write: boolean; execute: boolean };
  group: { read: boolean; write: boolean; execute: boolean };
  other: { read: boolean; write: boolean; execute: boolean };
}

function permToOctalDigit(p: { read: boolean; write: boolean; execute: boolean }): number {
  return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
}

function octalDigitToSymbols(digit: number): string {
  return (digit & 4 ? "r" : "-") + (digit & 2 ? "w" : "-") + (digit & 1 ? "x" : "-");
}

function octalDigitToPerms(digit: number): { read: boolean; write: boolean; execute: boolean } {
  return {
    read: (digit & 4) !== 0,
    write: (digit & 2) !== 0,
    execute: (digit & 1) !== 0,
  };
}

function stateToOctal(s: PermState): string {
  return `${permToOctalDigit(s.owner)}${permToOctalDigit(s.group)}${permToOctalDigit(s.other)}`;
}

function stateToSymbolic(s: PermState): string {
  return octalDigitToSymbols(permToOctalDigit(s.owner)) +
    octalDigitToSymbols(permToOctalDigit(s.group)) +
    octalDigitToSymbols(permToOctalDigit(s.other));
}

function octalStringToState(octal: string): PermState | null {
  if (!/^[0-7]{1,3}$/.test(octal)) return null;
  const padded = octal.padStart(3, "0");
  const ownerDigit = parseInt(padded[0]!, 8);
  const groupDigit = parseInt(padded[1]!, 8);
  const otherDigit = parseInt(padded[2]!, 8);
  return {
    owner: octalDigitToPerms(ownerDigit),
    group: octalDigitToPerms(groupDigit),
    other: octalDigitToPerms(otherDigit),
  };
}

const PRESETS: Array<{ value: string; label: string }> = [
  { value: "755", label: "755" },
  { value: "644", label: "644" },
  { value: "600", label: "600" },
  { value: "700", label: "700" },
  { value: "777", label: "777" },
];

const DEFAULT_STATE: PermState = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  other: { read: true, write: false, execute: true },
};

export default function UnixPermissionsCalculator() {
  const t = useTranslations("tools.unix-permissions-calculator");
  const [perms, setPerms] = useState<PermState>(DEFAULT_STATE);
  const [octalInput, setOctalInput] = useState("755");
  const [octalError, setOctalError] = useState(false);

  const octal = stateToOctal(perms);
  const symbolic = stateToSymbolic(perms);

  const togglePerm = useCallback((entity: Entity, perm: Perm) => {
    setPerms((prev) => {
      const updated = {
        ...prev,
        [entity]: { ...prev[entity], [perm]: !prev[entity][perm] },
      };
      setOctalInput(stateToOctal(updated));
      setOctalError(false);
      return updated;
    });
  }, []);

  const handleOctalInput = useCallback((value: string) => {
    setOctalInput(value);
    if (value === "") {
      setOctalError(false);
      return;
    }
    const newState = octalStringToState(value);
    if (newState) {
      setPerms(newState);
      setOctalError(false);
    } else {
      setOctalError(true);
    }
  }, []);

  const applyPreset = useCallback((value: string) => {
    const newState = octalStringToState(value);
    if (newState) {
      setPerms(newState);
      setOctalInput(value);
      setOctalError(false);
    }
  }, []);

  const entities: Entity[] = ["owner", "group", "other"];
  const permTypes: Perm[] = ["read", "write", "execute"];

  return (
    <div>
      {/* Top display row */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium mb-1">{t("input.octal")}</label>
          <input
            type="text"
            value={octalInput}
            onChange={(e) => handleOctalInput(e.target.value)}
            maxLength={3}
            placeholder="755"
            className={`w-full rounded border px-3 py-2 font-mono text-2xl font-bold text-center dark:bg-slate-900 ${
              octalError
                ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : "border-slate-300 dark:border-slate-700"
            }`}
          />
          {octalError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t("error.invalidOctal")}</p>
          )}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="text-sm font-medium mb-1">{t("input.symbolic")}</div>
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-2xl font-bold tracking-widest dark:border-slate-700 dark:bg-slate-900">
            {symbolic}
          </div>
        </div>
      </div>

      {/* Permission grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-left font-medium text-slate-600 dark:text-slate-400 w-24"></th>
              {permTypes.map((perm) => (
                <th key={perm} className="pb-2 text-center font-medium text-slate-600 dark:text-slate-400">
                  {t(`label.${perm}`)}
                </th>
              ))}
              <th className="pb-2 text-center font-medium text-slate-500 dark:text-slate-500 w-12">
                <span className="text-xs">Oct</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity} className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">{t(`label.${entity}`)}</td>
                {permTypes.map((perm) => (
                  <td key={perm} className="py-3 text-center">
                    <input
                      type="checkbox"
                      checked={perms[entity][perm]}
                      onChange={() => togglePerm(entity, perm)}
                      className="h-5 w-5 cursor-pointer rounded border-slate-400 text-brand-600 accent-blue-600"
                      aria-label={`${t(`label.${entity}`)} ${t(`label.${perm}`)}`}
                    />
                  </td>
                ))}
                <td className="py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {permToOctalDigit(perms[entity])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Octal breakdown */}
      <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-center gap-2 font-mono text-3xl font-bold">
          <span className="rounded bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-blue-800 dark:text-blue-200">
            {permToOctalDigit(perms.owner)}
          </span>
          <span className="rounded bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-emerald-800 dark:text-emerald-200">
            {permToOctalDigit(perms.group)}
          </span>
          <span className="rounded bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-amber-800 dark:text-amber-200">
            {permToOctalDigit(perms.other)}
          </span>
          <span className="ml-2 text-slate-500 dark:text-slate-400 text-xl">= {octal}</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
            {t("label.owner")}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            {t("label.group")}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
            {t("label.other")}
          </span>
        </div>
      </div>

      {/* Common presets */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">{t("presets")}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ value }) => (
            <button
              key={value}
              onClick={() => applyPreset(value)}
              className={`rounded border px-4 py-1.5 font-mono text-sm font-semibold hover:border-brand-500 transition-colors ${
                octal === value
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* chmod command hint */}
      <div className="mt-4 rounded border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <code className="font-mono text-sm text-slate-700 dark:text-slate-300">
          chmod {octal} filename
        </code>
      </div>
    </div>
  );
}
