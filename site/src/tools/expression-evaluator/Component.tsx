"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type Token =
  | { kind: "num"; val: number }
  | { kind: "op"; val: string }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "fn"; val: string };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src.charAt(i);
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < src.length && /[0-9.]/.test(src.charAt(i))) num += src.charAt(i++);
      tokens.push({ kind: "num", val: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let name = "";
      while (i < src.length && /[a-zA-Z0-9_]/.test(src.charAt(i))) name += src.charAt(i++);
      const low = name.toLowerCase();
      if (low === "pi" || low === "e") {
        const val = low === "pi" ? Math.PI : Math.E;
        tokens.push({ kind: "num", val });
      } else {
        tokens.push({ kind: "fn", val: low });
      }
      continue;
    }
    if ("+-*/%^".includes(ch)) {
      tokens.push({ kind: "op", val: ch });
      i++;
      continue;
    }
    if (ch === "(") { tokens.push({ kind: "lparen" }); i++; continue; }
    if (ch === ")") { tokens.push({ kind: "rparen" }); i++; continue; }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

function toRadians(deg: number) { return (deg * Math.PI) / 180; }

function applyFn(name: string, arg: number): number {
  switch (name) {
    case "sqrt": return Math.sqrt(arg);
    case "cbrt": return Math.cbrt(arg);
    case "abs": return Math.abs(arg);
    case "sin": return Math.sin(toRadians(arg));
    case "cos": return Math.cos(toRadians(arg));
    case "tan": return Math.tan(toRadians(arg));
    case "log": return Math.log(arg);
    case "log2": return Math.log2(arg);
    case "log10": return Math.log10(arg);
    case "floor": return Math.floor(arg);
    case "ceil": return Math.ceil(arg);
    case "round": return Math.round(arg);
    default: throw new Error(`Unknown function: ${name}`);
  }
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private consume(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error("Unexpected end of expression");
    return t;
  }

  parse(): number {
    const val = this.parseAddSub();
    if (this.pos < this.tokens.length) throw new Error("Unexpected token");
    return val;
  }

  private parseAddSub(): number {
    let left = this.parseMulDiv();
    while (true) {
      const t = this.peek();
      if (!t || t.kind !== "op" || (t.val !== "+" && t.val !== "-")) break;
      this.consume();
      const right = this.parseMulDiv();
      left = t.val === "+" ? left + right : left - right;
    }
    return left;
  }

  private parseMulDiv(): number {
    let left = this.parseMod();
    while (true) {
      const t = this.peek();
      if (!t || t.kind !== "op" || (t.val !== "*" && t.val !== "/")) break;
      this.consume();
      const right = this.parseMod();
      if (t.val === "/") {
        if (right === 0) throw new Error("Division by zero");
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  private parseMod(): number {
    let left = this.parsePower();
    while (true) {
      const t = this.peek();
      if (!t || t.kind !== "op" || t.val !== "%") break;
      this.consume();
      const right = this.parsePower();
      if (right === 0) throw new Error("Modulo by zero");
      left = left % right;
    }
    return left;
  }

  private parsePower(): number {
    const base = this.parseUnary();
    const t = this.peek();
    if (t && t.kind === "op" && t.val === "^") {
      this.consume();
      const exp = this.parsePower();
      return Math.pow(base, exp);
    }
    return base;
  }

  private parseUnary(): number {
    const t = this.peek();
    if (t && t.kind === "op" && t.val === "-") {
      this.consume();
      return -this.parseAtom();
    }
    if (t && t.kind === "op" && t.val === "+") {
      this.consume();
      return this.parseAtom();
    }
    return this.parseAtom();
  }

  private parseAtom(): number {
    const t = this.peek();
    if (!t) throw new Error("Unexpected end of expression");

    if (t.kind === "num") {
      this.consume();
      return t.val;
    }

    if (t.kind === "fn") {
      this.consume();
      const lparen = this.consume();
      if (lparen.kind !== "lparen") throw new Error("Expected '(' after function name");
      const arg = this.parseAddSub();
      const rparen = this.consume();
      if (rparen.kind !== "rparen") throw new Error("Expected ')' after function argument");
      return applyFn(t.val, arg);
    }

    if (t.kind === "lparen") {
      this.consume();
      const val = this.parseAddSub();
      const rparen = this.consume();
      if (rparen.kind !== "rparen") throw new Error("Expected ')'");
      return val;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(t)}`);
  }
}

function evaluate(expr: string): number {
  const trimmed = expr.trim();
  if (!trimmed) throw new Error("Empty expression");
  const tokens = tokenize(trimmed);
  return new Parser(tokens).parse();
}

const EXAMPLE_EXPRESSIONS = [
  "2^10 + sqrt(16)",
  "sin(45) * cos(30)",
  "(3 + 5) * 2^3 / 4",
  "log10(1000) + log2(8)",
  "sqrt(3^2 + 4^2)",
  "floor(pi * 100) / 100",
];

export default function ExpressionEvaluator() {
  const t = useTranslations("tools.expression-evaluator");
  const locale = useLocale();
  const [expr, setExpr] = useState("");

  const result = useMemo(() => {
    if (!expr.trim()) return { kind: "empty" as const };
    try {
      const val = evaluate(expr);
      if (!isFinite(val)) return { kind: "error" as const };
      return { kind: "ok" as const, val };
    } catch {
      return { kind: "error" as const };
    }
  }, [expr]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 10, useGrouping: true }),
    [locale]
  );

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.label")}</span>
        <input
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={t("input.hint")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {t("note.degrees")}
      </div>

      <div
        aria-live="polite"
        className={`mt-4 rounded-lg border p-4 ${
          result.kind === "ok"
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : result.kind === "error"
            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result.kind === "ok" ? (
          <>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</div>
            <div className="mt-1 break-all font-mono text-4xl font-bold tabular-nums">
              {fmt.format(result.val)}
            </div>
          </>
        ) : result.kind === "error" ? (
          <div className="text-sm text-red-700 dark:text-red-400">{t("error.invalid")}</div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">{t("result.empty")}</div>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-sm font-medium">{t("examples.label")}</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_EXPRESSIONS.map((ex) => (
            <button
              key={ex}
              onClick={() => setExpr(ex)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/20"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
