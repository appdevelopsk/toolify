/**
 * Toolify Buffer 自動投稿スクリプト（多言語）
 *
 * 設定：
 *   1. https://buffer.com で Twitter/X / Facebook / LinkedIn 等のチャネルを連携
 *   2. https://account.buffer.com/developers/applications で Access Token 取得
 *   3. プロジェクトルートの .env.local に追加：
 *        BUFFER_TOKEN=...
 *        BUFFER_CHANNEL_ID=...
 *   4. node scripts/buffer-post.mjs で実行
 *
 * launchd で2時間ごとに実行する場合のplist例は docs/SNS_AUTOMATION.md 参照
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

let env = {};
if (existsSync(envPath)) {
  env = Object.fromEntries(
    readFileSync(envPath, "utf-8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => {
        const idx = l.indexOf("=");
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
      .filter(([k]) => k)
  );
}

const BUFFER_TOKEN = env.BUFFER_TOKEN || process.env.BUFFER_TOKEN;
const BUFFER_CHANNEL = env.BUFFER_CHANNEL_ID || process.env.BUFFER_CHANNEL_ID;
const STATE_FILE = path.resolve(__dirname, "../.buffer-post-state.json");
const DAILY_CAP = 50;
const POSTS_PER_RUN = 2;

const BASE = "https://toolify365.com";

// ===== 多言語投稿コンテンツ（各言語ごとに人気ツール・カテゴリで複数件）=====
const POSTS = {
  en: [
    `🎯 Free WPM typing speed test — measure your words per minute live, no signup.
👇 ${BASE}/en/tools/wpm-counter
#TypingSpeed #FreeTools #ProductivityTools`,

    `⏳ Free online countdown timer — days/hours/minutes/seconds to any date.
👇 ${BASE}/en/tools/countdown-timer
#OnlineTools #Timer #Productivity`,

    `💪 BMI calculator (with body fat estimate) — free, no signup, results stay on your device.
👇 ${BASE}/en/tools/bmi-calculator
#Fitness #HealthTools #BMI`,

    `🔐 Free password generator — customizable length, symbols, no log of generated values.
👇 ${BASE}/en/tools/password-generator
#Security #Privacy #FreeTools`,

    `💵 Currency converter — live rates for 100+ currencies, no API key required.
👇 ${BASE}/en/tools/currency-converter
#FreeTools #Currency #Travel`,

    `📏 60+ free online calculators & converters in 17 languages. Privacy-first — your data never leaves your browser.
👇 ${BASE}
#FreeTools #PrivacyFirst #OnlineCalculator`,

    `🎲 Random number / dice / password / color — quick generators for any decision.
👇 ${BASE}/en/tools/random-number-generator
#Tools #Random #Productivity`,

    `📝 Word counter & character counter — perfect for essays, social media, SEO copy.
👇 ${BASE}/en/tools/word-counter
#Writing #SEO #Productivity`,

    `🎨 Color converter & palette tools — RGB, HEX, HSL, Pantone. Free.
👇 ${BASE}/en/tools/color-converter
#WebDesign #DesignTools #Color`,

    `📐 Unit converter — length, weight, temperature, volume, area. Metric ⇄ Imperial.
👇 ${BASE}/en/tools/length-converter
#FreeTools #UnitConverter #STEM`,
  ],

  ja: [
    `🎯 無料WPMタイピング速度測定 — 1分あたりの単語数をリアルタイム計測。登録不要。
👇 ${BASE}/ja/tools/wpm-counter
#タイピング #無料ツール #生産性`,

    `⏳ 無料オンラインカウントダウンタイマー — 任意の日時まで秒単位で表示。
👇 ${BASE}/ja/tools/countdown-timer
#オンラインツール #タイマー`,

    `💪 BMI計算機 — 体脂肪率の目安も同時表示。データは端末から出ません。
👇 ${BASE}/ja/tools/bmi-calculator
#健康 #BMI #無料ツール`,

    `🔐 無料パスワード生成器 — 長さ・記号を自由に指定。生成値はサーバーに送りません。
👇 ${BASE}/ja/tools/password-generator
#セキュリティ #プライバシー`,

    `💵 為替コンバーター — 100通貨以上の最新レート。APIキー不要。
👇 ${BASE}/ja/tools/currency-converter
#為替 #海外旅行 #無料ツール`,

    `📏 60以上の無料オンライン電卓・コンバーター（17言語対応）。データは端末で完結。
👇 ${BASE}/ja
#無料ツール #プライバシー優先`,

    `🎲 乱数・サイコロ・パスワード・色 — どんな決断もこれで一発。
👇 ${BASE}/ja/tools/random-number-generator
#ツール #乱数 #生産性`,

    `📝 文字数カウンター — レポート、SNS、SEO文章に最適。
👇 ${BASE}/ja/tools/word-counter
#ライティング #SEO #生産性`,

    `🎨 カラーコンバーター — RGB / HEX / HSL / Pantone を相互変換。無料。
👇 ${BASE}/ja/tools/color-converter
#Webデザイン #デザインツール`,

    `📐 単位変換ツール — 長さ・重さ・温度・体積・面積。メートル⇄ヤード対応。
👇 ${BASE}/ja/tools/length-converter
#無料ツール #単位変換`,
  ],

  ko: [
    `🎯 무료 WPM 타이핑 속도 측정 — 1분당 단어 수를 실시간 측정. 가입 불필요.
👇 ${BASE}/ko/tools/wpm-counter
#타이핑 #무료도구 #생산성`,

    `⏳ 무료 온라인 카운트다운 타이머 — 임의의 날짜까지 초 단위 표시.
👇 ${BASE}/ko/tools/countdown-timer
#온라인도구 #타이머`,

    `💪 BMI 계산기 — 체지방률 추정 포함. 데이터는 기기에서 완결.
👇 ${BASE}/ko/tools/bmi-calculator
#건강 #BMI #무료도구`,

    `🔐 무료 비밀번호 생성기 — 길이·기호 자유 지정. 생성값은 서버로 전송하지 않습니다.
👇 ${BASE}/ko/tools/password-generator
#보안 #프라이버시`,

    `📏 60개 이상의 무료 온라인 계산기·컨버터(17개 언어). 데이터는 브라우저 내 완결.
👇 ${BASE}/ko
#무료도구 #프라이버시`,
  ],

  zh: [
    `🎯 免费 WPM 打字速度测试 — 实时测量每分钟单词数,无需注册。
👇 ${BASE}/zh-CN/tools/wpm-counter
#打字 #免费工具 #效率`,

    `⏳ 免费在线倒计时 — 精确到秒,任意日期。
👇 ${BASE}/zh-CN/tools/countdown-timer
#在线工具 #倒计时`,

    `💪 BMI 计算器 — 体脂率估算同时显示。数据不离开浏览器。
👇 ${BASE}/zh-CN/tools/bmi-calculator
#健康 #BMI #免费工具`,

    `📏 60+ 免费在线计算器和转换器(17 种语言)。隐私优先 — 数据始终留在您的设备上。
👇 ${BASE}/zh-CN
#免费工具 #隐私优先`,
  ],

  id: [
    `🎯 Tes kecepatan mengetik WPM gratis — ukur kata per menit secara langsung, tanpa daftar.
👇 ${BASE}/id/tools/wpm-counter
#TesMengetik #AlatGratis #Produktivitas`,

    `📏 60+ kalkulator & konverter online gratis (17 bahasa). Privasi utama — data Anda tidak meninggalkan perangkat Anda.
👇 ${BASE}/id
#AlatGratis #PrivasiUtama`,
  ],
};

// ===== Buffer 投稿ロジック =====

async function postToBuffer(text) {
  if (!BUFFER_TOKEN || !BUFFER_CHANNEL) {
    console.log(`[DRY] Would post:\n${text}\n`);
    return { dryRun: true };
  }
  const url = "https://api.bufferapp.com/2/updates/create.json";
  const body = new URLSearchParams({
    text,
    "profile_ids[]": BUFFER_CHANNEL,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${BUFFER_TOKEN}`,
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buffer API ${res.status}: ${errText}`);
  }
  return res.json();
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { todayCount: 0, lastDate: "", cursors: {} };
  return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getNextPostsByHour() {
  const hour = new Date().getHours();
  const langByHour = {
    8: "ja", 9: "ko", 10: "zh", 12: "id", 22: "en",
  };
  const fallback = ["en"];
  const lang = langByHour[hour] ?? fallback[Math.floor(Math.random() * fallback.length)];
  return { lang, posts: POSTS[lang] ?? POSTS.en };
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const state = loadState();
  if (state.lastDate !== today) {
    state.todayCount = 0;
    state.lastDate = today;
  }
  if (state.todayCount >= DAILY_CAP) {
    console.log(`Daily cap reached (${DAILY_CAP}). Skip.`);
    return;
  }

  const { lang, posts } = getNextPostsByHour();
  state.cursors = state.cursors ?? {};
  const cursor = state.cursors[lang] ?? 0;
  const slice = [];
  for (let i = 0; i < POSTS_PER_RUN && i < posts.length; i++) {
    slice.push(posts[(cursor + i) % posts.length]);
  }
  state.cursors[lang] = (cursor + slice.length) % posts.length;

  for (const text of slice) {
    try {
      const result = await postToBuffer(text);
      if (!result.dryRun) state.todayCount++;
      console.log(`[${lang}] posted: ${text.slice(0, 60)}…`);
    } catch (e) {
      console.error(`Post error: ${e.message}`);
      break;
    }
  }

  saveState(state);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
