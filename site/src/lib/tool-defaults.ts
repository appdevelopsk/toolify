/**
 * 入力欄の初期値(言語別)。2026-10-13
 *
 * 表示通貨を言語ごとに変えると、米ドル前提の初期値(例: 250000)は
 * 円やルピアでは桁が合わず、最初に見える結果が現実離れする。
 * 各ツールの例文の額に合わせ、副項目は英語版の比率で決めた。
 * ここに無い言語・項目は各 Component の既定値(米ドル/ユーロの桁)を使う。
 */
type Defaults = Record<string, string>;

export const TOOL_DEFAULTS: Record<string, Record<string, Defaults>> = {
  "salary-converter": {
    de: { amount: "60000" },
    fr: { amount: "50000" },
    it: { amount: "30000" },
    tr: { amount: "100000" },
    hi: { amount: "750000" },
    id: { amount: "120000000" },
    ja: { amount: "10000000" },
    "pt-BR": { amount: "120000" },
    ru: { amount: "1440000" },
    vi: { amount: "240000000" },
  },
  // 金利と年数も例文に合わせる(例文は言語ごとに金利・年数が違う)。
  "loan-calculator": {
    de: { ratePct: "3.5", years: "20" },
    fr: { principal: "200000", ratePct: "3.5", years: "20" },
    hi: { principal: "3000000", ratePct: "8.5", years: "20" },
    id: { principal: "500000000", ratePct: "9", years: "20" },
    ja: { principal: "25000000", ratePct: "1.5", years: "35" },
    "pt-BR": { principal: "300000", ratePct: "10", years: "30" },
    ru: { principal: "5000000", ratePct: "8", years: "20" },
    th: { principal: "5000000" },
    tr: { principal: "1000000", ratePct: "18", years: "30" },
    vi: { principal: "2000000000", ratePct: "8", years: "20" },
    "zh-CN": { principal: "1000000" },
    "zh-TW": { principal: "1000000" },
  },
  "savings-goal-calculator": {
    hi: { goal: "2000000", monthly: "10000" },
    id: { goal: "400000000", monthly: "2000000" },
    ja: { goal: "10000000", monthly: "50000" },
    ru: { goal: "4000000", monthly: "20000" },
    th: { goal: "1000000", monthly: "5000" },
    tr: { goal: "1000000", monthly: "5000" },
    vi: { goal: "1000000000", monthly: "5000000" },
  },
  "compound-interest-calculator": {
    hi: { principal: "100000" },
    id: { principal: "10000000" },
    ja: { principal: "1000000" },
    ko: { principal: "10000000" },
    ru: { principal: "1000000" },
    th: { principal: "350000" },
    tr: { principal: "100000" },
    vi: { principal: "200000000" },
  },
  "mortgage-calculator": {
    de: { ratePct: "3.5", years: "25" },
    fr: { price: "300000", taxAnnual: "3600", insuranceAnnual: "900", ratePct: "4", years: "25" },
    hi: { price: "5000000", taxAnnual: "60000", insuranceAnnual: "15000" },
    id: { price: "500000000", taxAnnual: "6000000", insuranceAnnual: "1500000", ratePct: "9", years: "20" },
    ja: { price: "40000000", taxAnnual: "480000", insuranceAnnual: "120000" },
    "pt-BR": { price: "500000", taxAnnual: "6000", insuranceAnnual: "1500", ratePct: "10", years: "30" },
    ru: { price: "10000000", taxAnnual: "120000", insuranceAnnual: "30000", ratePct: "9", years: "20" },
    th: { price: "5000000", taxAnnual: "60000", insuranceAnnual: "15000", ratePct: "4", years: "30" },
    tr: { price: "2000000", taxAnnual: "24000", insuranceAnnual: "6000" },
    vi: { price: "5000000000", taxAnnual: "60000000", insuranceAnnual: "15000000", ratePct: "8", years: "25" },
  },
  "mortgage-refinance-calculator": {
    hi: { currentBalance: "2500000", closingCosts: "200000" },
    id: { currentBalance: "250000000", closingCosts: "4000000" },
    ja: { currentBalance: "25000000", closingCosts: "600000" },
    ru: { currentBalance: "4000000", closingCosts: "200000" },
    th: { currentBalance: "5000000", closingCosts: "100000" },
    tr: { currentBalance: "1000000", closingCosts: "15000" },
    vi: { currentBalance: "2500000000", closingCosts: "40000000" },
  },
  "investment-fee-impact-calculator": {
    hi: { initial: "100000", monthlyContribution: "5000" },
    id: { initial: "10000000", monthlyContribution: "500000" },
    ja: { initial: "1000000", monthlyContribution: "50000" },
    ru: { initial: "100000", monthlyContribution: "5000" },
    th: { initial: "350000", monthlyContribution: "15000" },
    vi: { initial: "10000000", monthlyContribution: "500000" },
  },
  "lease-vs-buy-calculator": {
    id: { carPrice: "350000000", downPayment: "50000000", leaseMonthly: "4500000" },
    ja: { carPrice: "3500000", downPayment: "500000", leaseMonthly: "45000" },
    "pt-BR": { carPrice: "140000", downPayment: "20000", leaseMonthly: "1800" },
    ru: { carPrice: "3500000", downPayment: "500000", leaseMonthly: "45000" },
    th: { carPrice: "1200000", downPayment: "175000", leaseMonthly: "15000" },
    tr: { carPrice: "350000", downPayment: "50000", leaseMonthly: "4500" },
    vi: { carPrice: "350000000", downPayment: "50000000", leaseMonthly: "4500000" },
  },
  "fire-number-calculator": {
    hi: { expenses: "400000", savings: "1000000", annualSavings: "200000" },
    id: { expenses: "40000000", savings: "100000000", annualSavings: "20000000" },
    ja: { expenses: "4000000", savings: "10000000", annualSavings: "2000000" },
    ko: { expenses: "40000000", savings: "100000000", annualSavings: "20000000" },
    ru: { expenses: "2000000", savings: "5000000", annualSavings: "1000000" },
    th: { expenses: "400000", savings: "1000000", annualSavings: "200000" },
    vi: { expenses: "40000000", savings: "100000000", annualSavings: "20000000" },
    "zh-CN": { expenses: "400000", savings: "1000000", annualSavings: "200000" },
    "zh-TW": { expenses: "1000000", savings: "2500000", annualSavings: "500000" },
  },
  "debt-payoff-calculator": {
    ar: { balance: "20000", monthlyPayment: "600" },
    hi: { balance: "500000", monthlyPayment: "15000" },
    id: { balance: "50000000", monthlyPayment: "1500000" },
    ja: { balance: "500000", monthlyPayment: "15000" },
    ko: { balance: "5000000", monthlyPayment: "150000" },
    "pt-BR": { balance: "20000", monthlyPayment: "600" },
    ru: { balance: "300000", monthlyPayment: "9000" },
    th: { balance: "200000", monthlyPayment: "6000" },
    tr: { balance: "50000", monthlyPayment: "1500" },
    vi: { balance: "50000000", monthlyPayment: "1500000" },
    "zh-CN": { balance: "30000", monthlyPayment: "900" },
    "zh-TW": { balance: "150000", monthlyPayment: "4500" },
  },
  "unit-price-calculator": {
    ja: { price1: "500", price2: "900" },
    id: { price1: "50000", price2: "90000" },
    vi: { price1: "200000", price2: "360000" },
    th: { price1: "300", price2: "540" },
    ru: { price1: "600", price2: "1080" },
    hi: { price1: "300", price2: "540" },
    tr: { price1: "150", price2: "270" },
  },
  "bill-split-calculator": {
    ja: { bill: "10000" },
    ko: { bill: "100000" },
    id: { bill: "500000" },
    vi: { bill: "1000000" },
    th: { bill: "2000" },
    ru: { bill: "5000" },
    hi: { bill: "2000" },
    tr: { bill: "1000" },
    "zh-CN": { bill: "500" },
    "zh-TW": { bill: "2000" },
    "pt-BR": { bill: "200" },
  },
  "markup-calculator": {
    id: { cost: "10000" },
    ja: { cost: "10000" },
    ru: { cost: "1000" },
    vi: { cost: "100000" },
  },
  "tip-calculator": {
    ar: { bill: "200" },
    hi: { bill: "1000" },
    id: { bill: "200000" },
    ja: { bill: "5000" },
    ru: { bill: "2000" },
    th: { bill: "500" },
    tr: { bill: "100" },
    vi: { bill: "500000" },
  },
  "sales-tax-calculator": {
    hi: { amount: "1000" },
    id: { amount: "100000" },
    ja: { amount: "1000" },
    vi: { amount: "100000" },
  },
  "discount-calculator": {
    hi: { original: "1000" },
    id: { original: "100000" },
    ja: { original: "10000" },
    ru: { original: "1000" },
    th: { original: "1000" },
    vi: { original: "100000" },
  },
};

const EMPTY: Defaults = {};

/** ツールと言語の初期値。無ければ空(各 Component の既定値に落ちる)。 */
export function toolDefaults(tool: string, locale: string): Defaults {
  return TOOL_DEFAULTS[tool]?.[locale] ?? EMPTY;
}
