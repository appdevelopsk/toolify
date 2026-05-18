"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Shape =
  | "sphere"
  | "cylinder"
  | "cone"
  | "cube"
  | "rectangularPrism"
  | "triangularPrism";

interface ShapeInputs {
  radius: string;
  height: string;
  side: string;
  length: string;
  width: string;
  triangleBase: string;
  triangleHeight: string;
}

interface ShapeResult {
  volume: number;
  surfaceArea: number;
  lateralArea?: number;
  slantHeight?: number;
  diagonal?: number;
  baseArea?: number;
}

const SHAPES: Shape[] = [
  "sphere",
  "cylinder",
  "cone",
  "cube",
  "rectangularPrism",
  "triangularPrism",
];

function calcSphere(radius: number): ShapeResult | null {
  if (!isFinite(radius) || radius <= 0) return null;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
  const baseArea = Math.PI * Math.pow(radius, 2);
  return { volume, surfaceArea, baseArea };
}

function calcCylinder(radius: number, height: number): ShapeResult | null {
  if (!isFinite(radius) || radius <= 0 || !isFinite(height) || height <= 0)
    return null;
  const baseArea = Math.PI * Math.pow(radius, 2);
  const lateralArea = 2 * Math.PI * radius * height;
  const surfaceArea = 2 * baseArea + lateralArea;
  const volume = baseArea * height;
  return { volume, surfaceArea, lateralArea, baseArea };
}

function calcCone(radius: number, height: number): ShapeResult | null {
  if (!isFinite(radius) || radius <= 0 || !isFinite(height) || height <= 0)
    return null;
  const slantHeight = Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
  const baseArea = Math.PI * Math.pow(radius, 2);
  const lateralArea = Math.PI * radius * slantHeight;
  const surfaceArea = baseArea + lateralArea;
  const volume = (1 / 3) * baseArea * height;
  return { volume, surfaceArea, lateralArea, slantHeight, baseArea };
}

function calcCube(side: number): ShapeResult | null {
  if (!isFinite(side) || side <= 0) return null;
  const volume = Math.pow(side, 3);
  const surfaceArea = 6 * Math.pow(side, 2);
  const diagonal = side * Math.sqrt(3);
  const baseArea = Math.pow(side, 2);
  return { volume, surfaceArea, diagonal, baseArea };
}

function calcRectangularPrism(
  length: number,
  width: number,
  height: number
): ShapeResult | null {
  if (
    !isFinite(length) ||
    length <= 0 ||
    !isFinite(width) ||
    width <= 0 ||
    !isFinite(height) ||
    height <= 0
  )
    return null;
  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + length * height + width * height);
  const diagonal = Math.sqrt(
    Math.pow(length, 2) + Math.pow(width, 2) + Math.pow(height, 2)
  );
  const baseArea = length * width;
  return { volume, surfaceArea, diagonal, baseArea };
}

function calcTriangularPrism(
  triangleBase: number,
  triangleHeight: number,
  length: number
): ShapeResult | null {
  if (
    !isFinite(triangleBase) ||
    triangleBase <= 0 ||
    !isFinite(triangleHeight) ||
    triangleHeight <= 0 ||
    !isFinite(length) ||
    length <= 0
  )
    return null;
  const baseArea = 0.5 * triangleBase * triangleHeight;
  const volume = baseArea * length;
  // Lateral surface: 3 rectangular faces (assuming isosceles triangle — two equal sides)
  // Side length of triangle: for a general isosceles triangle, leg = sqrt((b/2)^2 + h^2)
  const leg = Math.sqrt(
    Math.pow(triangleBase / 2, 2) + Math.pow(triangleHeight, 2)
  );
  const lateralArea = (triangleBase + 2 * leg) * length;
  const surfaceArea = lateralArea + 2 * baseArea;
  return { volume, surfaceArea, lateralArea, baseArea };
}

export default function GeometricShapesCalculator() {
  const t = useTranslations("tools.geometric-shapes-calculator");
  const locale = useLocale();

  const [shape, setShape] = useState<Shape>("sphere");
  const [inputs, setInputs] = useState<ShapeInputs>({
    radius: "5",
    height: "10",
    side: "5",
    length: "8",
    width: "5",
    triangleBase: "6",
    triangleHeight: "4",
  });

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  function setField(field: keyof ShapeInputs, val: string) {
    setInputs((prev) => ({ ...prev, [field]: val }));
  }

  const result = useMemo<ShapeResult | null>(() => {
    const r = parseFloat(inputs.radius);
    const h = parseFloat(inputs.height);
    const s = parseFloat(inputs.side);
    const l = parseFloat(inputs.length);
    const w = parseFloat(inputs.width);
    const tb = parseFloat(inputs.triangleBase);
    const th = parseFloat(inputs.triangleHeight);

    switch (shape) {
      case "sphere":
        return calcSphere(r);
      case "cylinder":
        return calcCylinder(r, h);
      case "cone":
        return calcCone(r, h);
      case "cube":
        return calcCube(s);
      case "rectangularPrism":
        return calcRectangularPrism(l, w, h);
      case "triangularPrism":
        return calcTriangularPrism(tb, th, l);
    }
  }, [shape, inputs]);

  function renderInputs() {
    const cls =
      "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";
    const labelCls = "block";
    const spanCls = "text-sm font-medium";

    const numInput = (
      field: keyof ShapeInputs,
      labelKey: string
    ) => (
      <label key={field} className={labelCls}>
        <span className={spanCls}>{t(`input.${labelKey}`)}</span>
        <input
          type="number"
          step="any"
          min="0"
          value={inputs[field]}
          onChange={(e) => setField(field, e.target.value)}
          className={cls}
        />
      </label>
    );

    switch (shape) {
      case "sphere":
        return numInput("radius", "radius");
      case "cylinder":
        return (
          <>
            {numInput("radius", "radius")}
            {numInput("height", "height")}
          </>
        );
      case "cone":
        return (
          <>
            {numInput("radius", "radius")}
            {numInput("height", "height")}
          </>
        );
      case "cube":
        return numInput("side", "side");
      case "rectangularPrism":
        return (
          <>
            {numInput("length", "length")}
            {numInput("width", "width")}
            {numInput("height", "height")}
          </>
        );
      case "triangularPrism":
        return (
          <>
            {numInput("triangleBase", "triangleBase")}
            {numInput("triangleHeight", "triangleHeight")}
            {numInput("length", "length")}
          </>
        );
    }
  }

  function renderResultRow(
    labelKey: string,
    value: number | undefined
  ) {
    if (value === undefined) return null;
    return (
      <div
        key={labelKey}
        className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800"
      >
        <dt>{t(`result.${labelKey}`)}</dt>
        <dd className="tabular-nums font-mono">{fmt.format(value)}</dd>
      </div>
    );
  }

  return (
    <div>
      {/* Shape selector */}
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium">
          {t("shapeLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShape(s)}
              className={`rounded px-3 py-1 text-sm ${
                shape === s
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              {t(`shape.${s}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {renderInputs()}
      </div>

      {/* Results */}
      <div
        aria-live="polite"
        className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
      >
        {!result ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("empty")}
          </div>
        ) : (
          <div>
            {/* Primary highlight: Volume + Surface Area */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  {t("result.volume")}
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {fmt.format(result.volume)}
                </div>
              </div>
              <div className="rounded bg-sky-50 p-3 dark:bg-sky-900/20">
                <div className="text-xs font-medium text-sky-900 dark:text-sky-200">
                  {t("result.surfaceArea")}
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {fmt.format(result.surfaceArea)}
                </div>
              </div>
            </div>

            {/* Secondary results */}
            <dl className="mt-3 grid gap-1 text-sm">
              {renderResultRow("baseArea", result.baseArea)}
              {renderResultRow("lateralArea", result.lateralArea)}
              {renderResultRow("slantHeight", result.slantHeight)}
              {renderResultRow("diagonal", result.diagonal)}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
