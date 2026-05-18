"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// Volume units — all expressed in ml
const VOLUME_UNITS = [
  { code: "cup", toMl: 236.588 },
  { code: "tbsp", toMl: 14.787 },
  { code: "tsp", toMl: 4.929 },
  { code: "floz", toMl: 29.574 },
  { code: "ml", toMl: 1 },
  { code: "l", toMl: 1000 },
] as const;

type VolumeCode = (typeof VOLUME_UNITS)[number]["code"];

// Weight units — all expressed in grams
const WEIGHT_UNITS = [
  { code: "g", toG: 1 },
  { code: "oz", toG: 28.3495 },
  { code: "lb", toG: 453.592 },
] as const;

type WeightCode = (typeof WEIGHT_UNITS)[number]["code"];

// All ingredient units
const INGREDIENT_VOLUME_UNITS = [
  { code: "cup", toMl: 236.588 },
  { code: "tbsp", toMl: 14.787 },
  { code: "tsp", toMl: 4.929 },
] as const;

type IngredientUnit = WeightCode | (typeof INGREDIENT_VOLUME_UNITS)[number]["code"];

// Ingredient densities in g per cup (1 cup = 236.588 ml)
const INGREDIENTS = [
  { code: "all-purpose-flour", gPerCup: 125 },
  { code: "bread-flour", gPerCup: 127 },
  { code: "white-sugar", gPerCup: 200 },
  { code: "brown-sugar", gPerCup: 220 },
  { code: "powdered-sugar", gPerCup: 120 },
  { code: "butter", gPerCup: 227 },
  { code: "water", gPerCup: 237 },
  { code: "milk", gPerCup: 245 },
  { code: "honey", gPerCup: 340 },
  { code: "rice", gPerCup: 185 },
] as const;

type IngredientCode = (typeof INGREDIENTS)[number]["code"];

function convertVolume(value: number, from: VolumeCode, to: VolumeCode): number {
  const fromMl = VOLUME_UNITS.find((u) => u.code === from)!.toMl;
  const toMl = VOLUME_UNITS.find((u) => u.code === to)!.toMl;
  return (value * fromMl) / toMl;
}

/** Convert ingredient amount between weight and volume units.
 *  gPerCup is the ingredient density. */
function convertIngredient(
  value: number,
  from: IngredientUnit,
  to: IngredientUnit,
  gPerCup: number,
): number {
  if (value <= 0) return 0;
  // Convert 'from' to grams first
  let grams: number;
  const wFrom = WEIGHT_UNITS.find((u) => u.code === from);
  const vFrom = INGREDIENT_VOLUME_UNITS.find((u) => u.code === from);
  if (wFrom) {
    grams = value * wFrom.toG;
  } else if (vFrom) {
    // volume → grams: grams = value(ml) * (gPerCup / 236.588)
    const ml = value * vFrom.toMl;
    grams = ml * (gPerCup / 236.588);
  } else {
    return 0;
  }

  // Convert grams to 'to' unit
  const wTo = WEIGHT_UNITS.find((u) => u.code === to);
  const vTo = INGREDIENT_VOLUME_UNITS.find((u) => u.code === to);
  if (wTo) {
    return grams / wTo.toG;
  } else if (vTo) {
    // grams → volume: ml = grams / (gPerCup / 236.588)
    const ml = grams / (gPerCup / 236.588);
    return ml / vTo.toMl;
  }
  return 0;
}

function sig4(n: number): number {
  if (!isFinite(n) || n === 0) return 0;
  const factor = Math.pow(10, 4 - Math.floor(Math.log10(Math.abs(n))) - 1);
  return Math.round(n * factor) / factor;
}

export default function CookingUnitConverter() {
  const t = useTranslations("tools.cooking-unit-converter");
  const locale = useLocale();

  // Volume section state
  const [volValue, setVolValue] = useState("1");
  const [volFrom, setVolFrom] = useState<VolumeCode>("cup");

  // Ingredient section state
  const [ingValue, setIngValue] = useState("1");
  const [ingFrom, setIngFrom] = useState<IngredientUnit>("cup");
  const [ingredient, setIngredient] = useState<IngredientCode>("all-purpose-flour");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 4, useGrouping: true }),
    [locale],
  );

  const volParsed = parseFloat(volValue);
  const ingParsed = parseFloat(ingValue);

  const selectedIngredient = INGREDIENTS.find((i) => i.code === ingredient)!;

  // All ingredient units combined
  const allIngredientUnits: IngredientUnit[] = [
    ...WEIGHT_UNITS.map((u) => u.code as WeightCode),
    ...INGREDIENT_VOLUME_UNITS.map((u) => u.code as (typeof INGREDIENT_VOLUME_UNITS)[number]["code"]),
  ];

  return (
    <div className="space-y-10">
      {/* Volume Converter Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("section.volume")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.value")}</span>
            <input
              inputMode="decimal"
              value={volValue}
              onChange={(e) => setVolValue(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.from")}</span>
            <select
              value={volFrom}
              onChange={(e) => setVolFrom(e.target.value as VolumeCode)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {VOLUME_UNITS.map((u) => (
                <option key={u.code} value={u.code}>
                  {t(`unit.${u.code}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div aria-live="polite" className="mt-4 grid gap-2 sm:grid-cols-2">
          {VOLUME_UNITS.filter((u) => u.code !== volFrom).map((u) => {
            const conv =
              isFinite(volParsed) && volParsed >= 0
                ? sig4(convertVolume(volParsed, volFrom, u.code))
                : null;
            return (
              <div
                key={u.code}
                className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
              >
                <span className="text-slate-600 dark:text-slate-400">{t(`unit.${u.code}`)}</span>
                <span className="tabular-nums font-medium">
                  {conv !== null ? fmt.format(conv) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ingredient-Aware Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("section.ingredient")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">{t("input.ingredient")}</span>
            <select
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value as IngredientCode)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {INGREDIENTS.map((i) => (
                <option key={i.code} value={i.code}>
                  {t(`ingredient.${i.code}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.value")}</span>
            <input
              inputMode="decimal"
              value={ingValue}
              onChange={(e) => setIngValue(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.from")}</span>
            <select
              value={ingFrom}
              onChange={(e) => setIngFrom(e.target.value as IngredientUnit)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {allIngredientUnits.map((code) => (
                <option key={code} value={code}>
                  {t(`unit.${code}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div aria-live="polite" className="mt-4 grid gap-2 sm:grid-cols-2">
          {allIngredientUnits
            .filter((code) => code !== ingFrom)
            .map((code) => {
              const conv =
                isFinite(ingParsed) && ingParsed >= 0
                  ? sig4(
                      convertIngredient(
                        ingParsed,
                        ingFrom,
                        code,
                        selectedIngredient.gPerCup,
                      ),
                    )
                  : null;
              return (
                <div
                  key={code}
                  className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {t(`unit.${code}`)}
                  </span>
                  <span className="tabular-nums font-medium">
                    {conv !== null ? fmt.format(conv) : "—"}
                  </span>
                </div>
              );
            })}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t("densityNote", {
            ingredient: t(`ingredient.${ingredient}`),
            gPerCup: selectedIngredient.gPerCup,
          })}
        </p>
      </section>
    </div>
  );
}
