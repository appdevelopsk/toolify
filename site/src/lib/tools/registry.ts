import type { ToolDefinition, ToolMeta } from "./types";

import bmi from "@/tools/bmi-calculator";
import length from "@/tools/length-converter";
import age from "@/tools/age-calculator";
import percentage from "@/tools/percentage-calculator";
import tip from "@/tools/tip-calculator";
import temperature from "@/tools/temperature-converter";
import password from "@/tools/password-generator";
import wordCounter from "@/tools/word-counter";
import countdown from "@/tools/countdown-timer";
import compound from "@/tools/compound-interest-calculator";
import weight from "@/tools/weight-converter";
import area from "@/tools/area-converter";
import time from "@/tools/time-converter";
import dataSize from "@/tools/data-size-converter";
import calorie from "@/tools/calorie-calculator";
import idealWeight from "@/tools/ideal-weight-calculator";
import dueDate from "@/tools/due-date-calculator";
import color from "@/tools/color-converter";
import contrast from "@/tools/contrast-checker";
import caseConv from "@/tools/case-converter";
import base64 from "@/tools/base64-encoder";
import jsonFmt from "@/tools/json-formatter";
import lorem from "@/tools/lorem-ipsum-generator";
import loan from "@/tools/loan-calculator";
import salesTax from "@/tools/sales-tax-calculator";
import discount from "@/tools/discount-calculator";
import gpa from "@/tools/gpa-calculator";
import volume from "@/tools/volume-converter";
import speed from "@/tools/speed-converter";
import fuel from "@/tools/fuel-economy-converter";
import urlEnc from "@/tools/url-encoder";
import water from "@/tools/water-intake-calculator";
import roman from "@/tools/roman-numeral-converter";
import mortgage from "@/tools/mortgage-calculator";
import uuid from "@/tools/uuid-generator";
import timestamp from "@/tools/timestamp-converter";
import numberBase from "@/tools/number-base-converter";
import randomNum from "@/tools/random-number-generator";
import textDiff from "@/tools/text-diff";
import regex from "@/tools/regex-tester";
import paint from "@/tools/paint-calculator";
import markup from "@/tools/markup-calculator";
import pace from "@/tools/pace-calculator";
import macro from "@/tools/macro-calculator";
import charFreq from "@/tools/character-frequency";
import dateCalc from "@/tools/date-calculator";
import timezone from "@/tools/timezone-converter";
import unitPrice from "@/tools/unit-price-calculator";
import hash from "@/tools/hash-generator";
import emailVal from "@/tools/email-validator";
import aspectRatio from "@/tools/aspect-ratio-calculator";
import textReplace from "@/tools/text-replace";
import creditCard from "@/tools/credit-card-validator";
import cron from "@/tools/cron-expression-tester";
import savings from "@/tools/savings-goal-calculator";
import salary from "@/tools/salary-converter";
import pomodoro from "@/tools/pomodoro-timer";
import dice from "@/tools/dice-roller";
import leapYear from "@/tools/leap-year-checker";
import bmr from "@/tools/bmr-calculator";
import ovulation from "@/tools/ovulation-calculator";
import retirement from "@/tools/retirement-calculator";

/**
 * 全ツールの中央レジストリ。新規ツール追加時はここに登録するだけで
 * ルーティング・サイトマップ・i18n loader・関連リンク全てに反映される。
 */
export const TOOLS: ToolDefinition[] = [
  bmi,
  length,
  age,
  percentage,
  tip,
  temperature,
  password,
  wordCounter,
  countdown,
  compound,
  weight,
  area,
  time,
  dataSize,
  calorie,
  idealWeight,
  dueDate,
  color,
  contrast,
  caseConv,
  base64,
  jsonFmt,
  lorem,
  loan,
  salesTax,
  discount,
  gpa,
  volume,
  speed,
  fuel,
  urlEnc,
  water,
  roman,
  mortgage,
  uuid,
  timestamp,
  numberBase,
  randomNum,
  textDiff,
  regex,
  paint,
  markup,
  pace,
  macro,
  charFreq,
  dateCalc,
  timezone,
  unitPrice,
  hash,
  emailVal,
  aspectRatio,
  textReplace,
  creditCard,
  cron,
  savings,
  salary,
  pomodoro,
  dice,
  leapYear,
  bmr,
  ovulation,
  retirement,
];

const SLUG_INDEX = new Map(TOOLS.map((t) => [t.meta.slug, t]));

export function listTools(): ToolMeta[] {
  return TOOLS.map((t) => t.meta);
}

export function getTool(slug: string): ToolDefinition | undefined {
  return SLUG_INDEX.get(slug);
}

export function listByCategory(category: string): ToolMeta[] {
  return TOOLS.map((t) => t.meta).filter((m) => m.category === category);
}

export function getRelated(slug: string, limit = 5): ToolMeta[] {
  const tool = SLUG_INDEX.get(slug);
  if (!tool) return [];
  const related = tool.meta.related
    .map((s) => SLUG_INDEX.get(s)?.meta)
    .filter((m): m is ToolMeta => Boolean(m));
  if (related.length >= limit) return related.slice(0, limit);
  // 不足分は同カテゴリで補完
  const fill = TOOLS.map((t) => t.meta)
    .filter((m) => m.slug !== slug && m.category === tool.meta.category && !related.includes(m))
    .slice(0, limit - related.length);
  return [...related, ...fill];
}
