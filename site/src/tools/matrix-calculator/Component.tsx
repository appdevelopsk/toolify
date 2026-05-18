"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type MatrixSize = 2 | 3;
type Operation = "add" | "subtract" | "multiply" | "transpose" | "determinant";

type Matrix = number[][];

function emptyMatrix(size: MatrixSize): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
}

function parseMatrix(raw: string[][], size: MatrixSize): Matrix | null {
  const m: Matrix = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const cell = (raw[i] as string[])[j] as string;
      const v = parseFloat(cell);
      if (!isFinite(v)) return null;
      row.push(v);
    }
    m.push(row);
  }
  return m;
}

function get(m: Matrix, i: number, j: number): number {
  return (m[i] as number[])[j] as number;
}

function det2(m: Matrix): number {
  return get(m, 0, 0) * get(m, 1, 1) - get(m, 0, 1) * get(m, 1, 0);
}

function det3(m: Matrix): number {
  return (
    get(m, 0, 0) * (get(m, 1, 1) * get(m, 2, 2) - get(m, 1, 2) * get(m, 2, 1)) -
    get(m, 0, 1) * (get(m, 1, 0) * get(m, 2, 2) - get(m, 1, 2) * get(m, 2, 0)) +
    get(m, 0, 2) * (get(m, 1, 0) * get(m, 2, 1) - get(m, 1, 1) * get(m, 2, 0))
  );
}

function transpose(m: Matrix, size: MatrixSize): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(get(m, j, i));
    }
    result.push(row);
  }
  return result;
}

function addMatrices(a: Matrix, b: Matrix, size: MatrixSize): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(get(a, i, j) + get(b, i, j));
    }
    result.push(row);
  }
  return result;
}

function subtractMatrices(a: Matrix, b: Matrix, size: MatrixSize): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(get(a, i, j) - get(b, i, j));
    }
    result.push(row);
  }
  return result;
}

function multiplyMatrices(a: Matrix, b: Matrix, size: MatrixSize): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) sum += get(a, i, k) * get(b, k, j);
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "–";
  // Avoid ugly floating point tails
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
}

type Result =
  | { type: "matrix"; data: Matrix }
  | { type: "scalar"; label: string; value: number };

function MatrixInput({
  label,
  size,
  values,
  onChange,
}: {
  label: string;
  size: MatrixSize;
  values: string[][];
  onChange: (i: number, j: number, v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: size }, (_, i) =>
          Array.from({ length: size }, (__, j) => (
            <input
              key={`${i}-${j}`}
              type="number"
              value={(values[i] as string[])[j] as string}
              onChange={(e) => onChange(i, j, e.target.value)}
              placeholder="0"
              className="w-16 rounded border border-slate-300 px-2 py-1.5 text-center text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          ))
        )}
      </div>
    </div>
  );
}

function ResultMatrix({ data }: { data: Matrix }) {
  const size = data.length;
  return (
    <div
      className="inline-grid gap-1"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {data.map((row, i) =>
        row.map((val, j) => (
          <div
            key={`${i}-${j}`}
            className="w-20 rounded border border-brand-300 bg-white px-2 py-1.5 text-center text-sm font-mono dark:border-brand-700 dark:bg-slate-900"
          >
            {formatNum(val)}
          </div>
        ))
      )}
    </div>
  );
}

export default function MatrixCalculator() {
  const t = useTranslations("tools.matrix-calculator");
  const [size, setSize] = useState<MatrixSize>(2);
  const [operation, setOperation] = useState<Operation>("multiply");
  const [matA, setMatA] = useState<string[][]>(emptyMatrix(2));
  const [matB, setMatB] = useState<string[][]>(emptyMatrix(2));

  const needsB = operation === "add" || operation === "subtract" || operation === "multiply";

  function handleSizeChange(newSize: MatrixSize) {
    setSize(newSize);
    setMatA(emptyMatrix(newSize));
    setMatB(emptyMatrix(newSize));
  }

  function updateA(i: number, j: number, v: string) {
    setMatA((prev) => {
      const next = prev.map((row) => [...row]) as string[][];
      (next[i] as string[])[j] = v;
      return next;
    });
  }

  function updateB(i: number, j: number, v: string) {
    setMatB((prev) => {
      const next = prev.map((row) => [...row]) as string[][];
      (next[i] as string[])[j] = v;
      return next;
    });
  }

  const result = useMemo((): Result | null => {
    const a = parseMatrix(matA, size);
    if (!a) return null;

    if (operation === "determinant") {
      const d = size === 2 ? det2(a) : det3(a);
      return { type: "scalar", label: t("result.label"), value: d };
    }

    if (operation === "transpose") {
      return { type: "matrix", data: transpose(a, size) };
    }

    // Binary operations need B
    const b = parseMatrix(matB, size);
    if (!b) return null;

    if (operation === "add") {
      return { type: "matrix", data: addMatrices(a, b, size) };
    }
    if (operation === "subtract") {
      return { type: "matrix", data: subtractMatrices(a, b, size) };
    }
    if (operation === "multiply") {
      return { type: "matrix", data: multiplyMatrices(a, b, size) };
    }

    return null;
  }, [matA, matB, size, operation, t]);

  const operations: Operation[] = ["add", "subtract", "multiply", "transpose", "determinant"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <span className="text-sm font-medium">{t("input.size")}: </span>
          <div className="mt-1 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
            {([2, 3] as MatrixSize[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSizeChange(s)}
                className={`px-3 py-1.5 text-sm ${
                  size === s
                    ? "bg-brand-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium">{t("input.operation")}: </span>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as Operation)}
            className="mt-1 rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {operations.map((op) => (
              <option key={op} value={op}>
                {t(`operations.${op}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-8">
        <MatrixInput
          label={t("input.matA")}
          size={size}
          values={matA}
          onChange={updateA}
        />
        {needsB && (
          <MatrixInput
            label={t("input.matB")}
            size={size}
            values={matB}
            onChange={updateB}
          />
        )}
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          result.type === "scalar" ? (
            <dl>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {result.label}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {formatNum(result.value)}
              </dd>
            </dl>
          ) : (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.label")}
              </p>
              <ResultMatrix data={result.data} />
            </div>
          )
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
