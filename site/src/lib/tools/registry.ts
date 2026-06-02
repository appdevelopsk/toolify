import type { ToolMeta } from "./types";

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
import simpleInterest from "@/tools/simple-interest-calculator";
import carLoan from "@/tools/car-loan-calculator";
import bodyFat from "@/tools/body-fat-calculator";
import statistics from "@/tools/statistics-calculator";
import workdays from "@/tools/workdays-calculator";
import gradient from "@/tools/gradient-generator";
import pregnancyWeek from "@/tools/pregnancy-week-calculator";
import cryptoProfit from "@/tools/crypto-profit-calculator";
import stockProfit from "@/tools/stock-profit-calculator";
import inflation from "@/tools/inflation-calculator";
import pressure from "@/tools/pressure-converter";
import oneRepMax from "@/tools/one-rep-max-calculator";
import targetHr from "@/tools/target-heart-rate-calculator";
import weightLoss from "@/tools/weight-loss-calculator";
import mdToHtml from "@/tools/markdown-to-html";
import htmlToMd from "@/tools/html-to-markdown";
import colorPalette from "@/tools/color-palette-generator";
import colorBlindness from "@/tools/color-blindness-simulator";
import angle from "@/tools/angle-converter";
import deviceInfo from "@/tools/device-info-checker";
import primeChecker from "@/tools/prime-checker";
import quadratic from "@/tools/quadratic-equation-solver";
import fraction from "@/tools/fraction-calculator";
import wpm from "@/tools/wpm-counter";
import gcdLcm from "@/tools/gcd-lcm-calculator";
import shadow from "@/tools/shadow-generator";
import slug from "@/tools/slug-generator";
import emergencyFund from "@/tools/emergency-fund-calculator";
import isoWeek from "@/tools/iso-week-calculator";
import triangle from "@/tools/triangle-calculator";
import taxBracket from "@/tools/tax-bracket-calculator";
import subnet from "@/tools/subnet-calculator";
import ageDiff from "@/tools/age-difference-calculator";
import vat from "@/tools/vat-calculator";
import roi from "@/tools/roi-calculator";
import sciNot from "@/tools/scientific-notation-converter";
import fuelCost from "@/tools/fuel-cost-calculator";
import pwStrength from "@/tools/password-strength-tester";
import netWorth from "@/tools/net-worth-calculator";
import factorial from "@/tools/factorial-calculator";
import power from "@/tools/power-converter";
import moonPhase from "@/tools/moon-phase-calculator";
import whrCalc from "@/tools/waist-hip-ratio-calculator";
import ruleOf72 from "@/tools/rule-of-72-calculator";
import cagr from "@/tools/cagr-calculator";
import stopwatch from "@/tools/stopwatch";
import caesar from "@/tools/caesar-cipher";
import jwtDec from "@/tools/jwt-decoder";
import csvJson from "@/tools/csv-json-converter";
import jsonToYaml from "@/tools/json-to-yaml-converter";
import amortization from "@/tools/loan-amortization-schedule";
import dti from "@/tools/debt-to-income-ratio-calculator";
import lifeInsurance from "@/tools/life-insurance-needs-calculator";
import roas from "@/tools/roas-calculator";
import creditUtil from "@/tools/credit-utilization-calculator";
import annuity from "@/tools/annuity-payout-calculator";
import mortgageRefi from "@/tools/mortgage-refinance-calculator";
import leaseVsBuy from "@/tools/lease-vs-buy-calculator";
import costOfLiving from "@/tools/cost-of-living-comparison";
import investmentFee from "@/tools/investment-fee-impact-calculator";
import priceCompare from "@/tools/price-compare";
import sleep from "@/tools/sleep-calculator";
import numberToWords from "@/tools/number-to-words";
import cookingUnit from "@/tools/cooking-unit-converter";
import readingLevel from "@/tools/reading-level-checker";
import typingSpeed from "@/tools/typing-speed-tester";
import unixPermissions from "@/tools/unix-permissions-calculator";
import keycodeFind from "@/tools/keycode-finder";
import asciiTable from "@/tools/ascii-table";
import textToBinary from "@/tools/text-to-binary";
import htmlEntity from "@/tools/html-entity-encoder";
import colorShades from "@/tools/color-shades-generator";
import primeFactorization from "@/tools/prime-factorization";
import cssUnit from "@/tools/css-unit-converter";
import morseCode from "@/tools/morse-code-translator";
import colorName from "@/tools/color-name-finder";
import fireNumber from "@/tools/fire-number-calculator";
import breakEven from "@/tools/break-even-calculator";
import textSorter from "@/tools/text-sorter";
import bloodPressure from "@/tools/blood-pressure-checker";
import exerciseCalorie from "@/tools/exercise-calorie-calculator";
import expressionEval from "@/tools/expression-evaluator";
import resistorColorCode from "@/tools/resistor-color-code";
import numberSequenceGen from "@/tools/number-sequence-generator";
import circleCalc from "@/tools/circle-calculator";
import probabilityCalc from "@/tools/probability-calculator";
import electricityCost from "@/tools/electricity-cost-calculator";
import percentError from "@/tools/percent-error-calculator";
import qrCode from "@/tools/qr-code-generator";
import fibonacci from "@/tools/fibonacci-calculator";
import matrix from "@/tools/matrix-calculator";
import dupLineRemover from "@/tools/duplicate-line-remover";
import reverseText from "@/tools/reverse-text-generator";
import stepsToDistance from "@/tools/steps-to-distance-calculator";
import pixelDensity from "@/tools/pixel-density-calculator";
import meetingCost from "@/tools/meeting-cost-calculator";
import paycheck from "@/tools/paycheck-calculator";
import currencyConv from "@/tools/currency-converter";
import gradeCalc from "@/tools/grade-calculator";
import pythagorean from "@/tools/pythagorean-theorem-calculator";
import ohmLaw from "@/tools/ohm-law-calculator";
import debtPayoff from "@/tools/debt-payoff-calculator";
import calorieDeficit from "@/tools/calorie-deficit-calculator";
import windChill from "@/tools/wind-chill-calculator";
import heatIndex from "@/tools/heat-index-calculator";
import billSplit from "@/tools/bill-split-calculator";
import sigFigs from "@/tools/significant-figures-calculator";
import geoShapes from "@/tools/geometric-shapes-calculator";
import percentageChange from "@/tools/percentage-change-calculator";
import hoursCalc from "@/tools/hours-calculator";
import houseAffordability from "@/tools/house-affordability-calculator";
import coffeeRatioCalculator from "@/tools/coffee-ratio-calculator";
import readingTimeCalculator from "@/tools/reading-time-calculator";
import profitMarginCalculator from "@/tools/profit-margin-calculator";
import slopeCalculator from "@/tools/slope-calculator";
import squareFootageCalculator from "@/tools/square-footage-calculator";
import midpointCalculator from "@/tools/midpoint-calculator";
import concreteCalculator from "@/tools/concrete-calculator";
import proteinIntakeCalculator from "@/tools/protein-intake-calculator";
import zScoreCalculator from "@/tools/z-score-calculator";
import gravelCalculator from "@/tools/gravel-calculator";
import cylinderVolumeCalculator from "@/tools/cylinder-volume-calculator";
import kineticEnergyCalculator from "@/tools/kinetic-energy-calculator";
import densityCalculator from "@/tools/density-calculator";
import salesCommissionCalculator from "@/tools/sales-commission-calculator";
import boardFeetCalculator from "@/tools/board-feet-calculator";
import waistToHeightRatioCalculator from "@/tools/waist-to-height-ratio-calculator";
import downPaymentCalculator from "@/tools/down-payment-calculator";
import boxVolumeCalculator from "@/tools/box-volume-calculator";
import tileCalculator from "@/tools/tile-calculator";
import molarityCalculator from "@/tools/molarity-calculator";
import averageSpeedCalculator from "@/tools/average-speed-calculator";
import dayOfWeekCalculator from "@/tools/day-of-week-calculator";
import bodySurfaceAreaCalculator from "@/tools/body-surface-area-calculator";
import a1cCalculator from "@/tools/a1c-calculator";
import effectiveAnnualRateCalculator from "@/tools/effective-annual-rate-calculator";
import costPerUseCalculator from "@/tools/cost-per-use-calculator";
import proportionCalculator from "@/tools/proportion-calculator";
import sphereVolumeCalculator from "@/tools/sphere-volume-calculator";
import coneVolumeCalculator from "@/tools/cone-volume-calculator";
import logarithmCalculator from "@/tools/logarithm-calculator";
import combinationCalculator from "@/tools/combination-calculator";
import ponderalIndexCalculator from "@/tools/ponderal-index-calculator";
import futureValueCalculator from "@/tools/future-value-calculator";
import presentValueCalculator from "@/tools/present-value-calculator";
import permutationCalculator from "@/tools/permutation-calculator";
import exponentCalculator from "@/tools/exponent-calculator";
import moduloCalculator from "@/tools/modulo-calculator";
import maxHeartRateCalculator from "@/tools/max-heart-rate-calculator";
import overtimePayCalculator from "@/tools/overtime-pay-calculator";
import squareRootCalculator from "@/tools/square-root-calculator";
import halfLifeCalculator from "@/tools/half-life-calculator";
import ratioSimplifier from "@/tools/ratio-simplifier";
import dogAgeCalculator from "@/tools/dog-age-calculator";
import catAgeCalculator from "@/tools/cat-age-calculator";
import sipCalculator from "@/tools/sip-calculator";

/**
 * 全ツールの中央レジストリ。新規ツール追加時はここに登録するだけで
 * ルーティング・サイトマップ・i18n loader・関連リンク全てに反映される。
 */
export const TOOLS: ToolMeta[] = [
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
  numberToWords,
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
  simpleInterest,
  carLoan,
  bodyFat,
  statistics,
  workdays,
  gradient,
  pregnancyWeek,
  cryptoProfit,
  stockProfit,
  inflation,
  pressure,
  oneRepMax,
  targetHr,
  weightLoss,
  mdToHtml,
  htmlToMd,
  colorPalette,
  colorBlindness,
  angle,
  deviceInfo,
  primeChecker,
  quadratic,
  fraction,
  wpm,
  gcdLcm,
  shadow,
  slug,
  emergencyFund,
  isoWeek,
  triangle,
  taxBracket,
  subnet,
  ageDiff,
  vat,
  roi,
  sciNot,
  fuelCost,
  pwStrength,
  netWorth,
  factorial,
  power,
  moonPhase,
  whrCalc,
  ruleOf72,
  cagr,
  stopwatch,
  caesar,
  jwtDec,
  csvJson,
  jsonToYaml,
  amortization,
  dti,
  lifeInsurance,
  roas,
  creditUtil,
  annuity,
  mortgageRefi,
  leaseVsBuy,
  costOfLiving,
  investmentFee,
  priceCompare,
  sleep,
  cookingUnit,
  readingLevel,
  typingSpeed,
  unixPermissions,
  keycodeFind,
  cssUnit,
  morseCode,
  colorName,
  fireNumber,
  breakEven,
  asciiTable,
  textToBinary,
  htmlEntity,
  colorShades,
  primeFactorization,
  textSorter,
  bloodPressure,
  exerciseCalorie,
  expressionEval,
  resistorColorCode,
  numberSequenceGen,
  circleCalc,
  probabilityCalc,
  electricityCost,
  percentError,
  qrCode,
  fibonacci,
  matrix,
  dupLineRemover,
  reverseText,
  stepsToDistance,
  pixelDensity,
  meetingCost,
  paycheck,
  currencyConv,
  gradeCalc,
  pythagorean,
  ohmLaw,
  debtPayoff,
  calorieDeficit,
  windChill,
  heatIndex,
  billSplit,
  sigFigs,
  geoShapes,
  percentageChange,
  hoursCalc,
  houseAffordability,
  coffeeRatioCalculator,
  readingTimeCalculator,
  profitMarginCalculator,
  slopeCalculator,
  squareFootageCalculator,
  midpointCalculator,
  concreteCalculator,
  proteinIntakeCalculator,
  zScoreCalculator,
  gravelCalculator,
  cylinderVolumeCalculator,
  kineticEnergyCalculator,
  densityCalculator,
  salesCommissionCalculator,
  boardFeetCalculator,
  waistToHeightRatioCalculator,
  downPaymentCalculator,
  boxVolumeCalculator,
  tileCalculator,
  molarityCalculator,
  averageSpeedCalculator,
  dayOfWeekCalculator,
  bodySurfaceAreaCalculator,
  a1cCalculator,
  effectiveAnnualRateCalculator,
  costPerUseCalculator,
  proportionCalculator,
  sphereVolumeCalculator,
  coneVolumeCalculator,
  logarithmCalculator,
  combinationCalculator,
  ponderalIndexCalculator,
  futureValueCalculator,
  presentValueCalculator,
  permutationCalculator,
  exponentCalculator,
  moduloCalculator,
  maxHeartRateCalculator,
  overtimePayCalculator,
  squareRootCalculator,
  halfLifeCalculator,
  ratioSimplifier,
  dogAgeCalculator,
  catAgeCalculator,
  sipCalculator,
];

const SLUG_INDEX = new Map(TOOLS.map((m) => [m.slug, m]));

/**
 * 再審査用 noindex リスト（AdSense「有用性の低いコンテンツ」対策 / docs/ADSENSE_RECOVERY_PLAN.md フェーズ2）。
 * ここに入れた slug はページ自体は存在し続けるが、
 *   - robots: { index: false }（generateMetadata 経由）
 *   - sitemap から除外
 * の両方が同時に適用され、新規ドメインの scaled-content 署名を下げる。
 * 承認後、各ツールに本物の差別化機能を入れてから「段階的に」リストから外して index 復帰させる。
 * ※ 面積を絞る最重要レバー。より攻めるならここを増やす（目標: index コア 40〜60 本）。
 */
export const NOINDEX_SLUGS = new Set<string>([
  // ノベルティ / コンテンツ上限が低い
  "dice-roller", "random-number-generator", "countdown-timer", "stopwatch",
  "pomodoro-timer", "reverse-text-generator", "lorem-ipsum-generator",
  "coffee-ratio-calculator", "cat-age-calculator", "dog-age-calculator", "moon-phase-calculator",
  // 幾何ボリュームの重複（geometric-shapes / circle / triangle を代表として残す）
  "box-volume-calculator", "cone-volume-calculator", "cylinder-volume-calculator", "sphere-volume-calculator",
  // 単一単位コンバータの重複（length/weight/temperature/volume/speed/data-size/time/currency/cooking を残す）
  "angle-converter", "power-converter", "pressure-converter", "density-calculator",
  "fuel-economy-converter", "css-unit-converter", "scientific-notation-converter", "board-feet-calculator",
  // 健康系の近似重複（bmi/bmr/body-fat/ideal-weight/target-heart-rate/waist-to-height を残す）
  "waist-hip-ratio-calculator", "ponderal-index-calculator", "body-surface-area-calculator", "max-heart-rate-calculator",
  // 数学系の近似重複（core を残す）
  "modulo-calculator", "exponent-calculator", "factorial-calculator", "logarithm-calculator",
  "midpoint-calculator", "percent-error-calculator", "significant-figures-calculator",
  "number-sequence-generator", "proportion-calculator",
  // テキスト系の近似重複（word-counter / text-diff / case-converter を残す）
  "character-frequency", "duplicate-line-remover", "text-sorter", "text-replace", "text-to-binary",
  // その他ノベルティ / 飽和コモディティ
  "caesar-cipher", "morse-code-translator", "ascii-table", "keycode-finder",
  "resistor-color-code", "number-to-words", "roman-numeral-converter",
]);

export function isIndexable(slug: string): boolean {
  return !NOINDEX_SLUGS.has(slug);
}

export function listTools(): ToolMeta[] {
  return TOOLS;
}

/** sitemap / 内部リンクのうち index 対象だけを返す（noindex ツールを除外）。 */
export function listIndexableTools(): ToolMeta[] {
  return TOOLS.filter((m) => !NOINDEX_SLUGS.has(m.slug));
}

export function getTool(slug: string): ToolMeta | undefined {
  return SLUG_INDEX.get(slug);
}

export function listByCategory(category: string): ToolMeta[] {
  return TOOLS.filter((m) => m.category === category);
}

export function getRelated(slug: string, limit = 5): ToolMeta[] {
  const tool = SLUG_INDEX.get(slug);
  if (!tool) return [];
  const related = tool.related
    .map((s) => SLUG_INDEX.get(s))
    .filter((m): m is ToolMeta => Boolean(m));
  if (related.length >= limit) return related.slice(0, limit);
  const fill = TOOLS
    .filter((m) => m.slug !== slug && m.category === tool.category && !related.includes(m))
    .slice(0, limit - related.length);
  return [...related, ...fill];
}
