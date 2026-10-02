"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { trackCalculate, trackCopyResult, trackPresetClick } from "@/lib/analytics/events";
import { useAutoShareableState } from "@/lib/hooks/useAutoShareableState";

/**
 * ツール本体を包み、GA4 の calculate / copy_result / preset_click を一括計装する。
 *
 * なぜラッパ方式か: このリポジトリには 222 本のツールがあり、結果カードの
 * 共通コンポーネント(ResultCard 等)も data 属性も存在しない。個々の
 * Component.tsx に手を入れると 222 ファイルの改変になり、実装差異による
 * 取りこぼしも避けられない。イベントの発火源は結局どれも DOM 上の
 * input/change/click なので、バブリングを1箇所で拾う方が網羅的で安全。
 *
 * calculate の定義: 「着地時に結果が出たか」ではない。2026-08-22 の初期値投入で
 * 全ツールが着地時点で結果を描画するようになったため、それを数えても
 * page_view と同義になり無意味。ここでは「ユーザーが入力を変えて
 * 再計算させた」= 能動的な利用を calculate とする。滞在率改善の効果は
 * まさにこの能動率で測る。
 *
 * 送出は1マウントにつき各1回まで。ツールは1キーストロークごとに再計算する
 * ため、間引かないと1着地で数十イベントになり engagement 指標が壊れる。
 */
export function ToolInteractionTracker({
  slug,
  locale,
  category,
  shareable = true,
  children,
}: {
  slug: string;
  /** ページのロケール。GA4 custom dimension `locale` に載せる。 */
  locale?: string;
  /** ToolMeta.category。GA4 custom dimension `category` に載せる。 */
  category?: string;
  /**
   * 入力値を ?s= に載せる汎用共有リンクを有効にするか。
   * ツール自身が useShareableState を持つ場合は false（二重書き込み回避）。
   */
  shareable?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sent = useRef({ calculate: false, copy: false, preset: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // data-calc-label を持つツール(2026-10-02: pressure-converter / workdays-calculator)は
    // 「何を計算したか」(単位ペア・祝日プリセット等)を calculate の label に載せる。
    // 最初の入力時点では単位がまだ既定値のことが多いため、入力が止まってから
    // (LABEL_SETTLE_MS) またはタブを離れる時に1回だけ送る。新しいイベント名は作らない
    // = 全ツールで calculate は従来どおり1着地1回(重複発火しない)。
    let settle: number | undefined;

    function sendWithLabel() {
      if (sent.current.calculate) return;
      sent.current.calculate = true;
      if (settle !== undefined) window.clearTimeout(settle);
      settle = undefined;
      const root = el as HTMLElement;
      const label = readCalcLabel(root);
      trackCalculate({
        tool: slug,
        locale,
        category,
        ...(label ? { label } : {}),
        input_count: countFilledInputs(root),
        has_result: hasVisibleResult(root),
      });
    }

    function onInput() {
      if (sent.current.calculate) return;
      const root = el as HTMLElement;
      if (root.querySelector("[data-calc-label]")) {
        if (settle !== undefined) window.clearTimeout(settle);
        settle = window.setTimeout(sendWithLabel, LABEL_SETTLE_MS);
        return;
      }
      sent.current.calculate = true;
      // 結果描画はツール側の再レンダー後なので、1 フレーム待ってから DOM を見る。
      window.setTimeout(() => {
        trackCalculate({
          tool: slug,
          locale,
          category,
          input_count: countFilledInputs(root),
          has_result: hasVisibleResult(root),
        });
      }, 50);
    }

    function onHide() {
      if (document.visibilityState === "hidden" && settle !== undefined) sendWithLabel();
    }

    function onClick(e: Event) {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.("button");
      if (!btn) return;

      // コピー系ボタン: ラベル/aria-label に copy を含むもの。
      // 各ツールが独自にクリップボード実装を持つため、文言で判別するしかない。
      const label = `${btn.getAttribute("aria-label") ?? ""} ${btn.textContent ?? ""}`.toLowerCase();
      if (/copy|コピー|copiar|kopieren|copier|копи|复制|複製|복사/.test(label)) {
        if (sent.current.copy) return;
        sent.current.copy = true;
        trackCopyResult({ tool: slug, locale, category });
        return;
      }

      // プリセット/サンプル/例示ボタン。文言で判別する。
      // ここを「コピー以外の全ボタン」にすると、モード切替もシェアも
      // preset_click になり指標として使えなくなるため、明示的に絞る。
      if (/preset|sample|example|プリセット|サンプル|例|ejemplo|beispiel|exemple|пример|示例|範例|예시/.test(label)) {
        if (sent.current.preset) return;
        sent.current.preset = true;
        trackPresetClick({ tool: slug, locale, category });
      }
    }

    el.addEventListener("input", onInput);
    el.addEventListener("change", onInput);
    el.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (settle !== undefined) window.clearTimeout(settle);
      el.removeEventListener("input", onInput);
      el.removeEventListener("change", onInput);
      el.removeEventListener("click", onClick);
    };
  }, [slug, locale, category]);

  useAutoShareableState(ref, slug, shareable);

  return <div ref={ref}>{children}</div>;
}

/** 入力が止まったとみなすまでの待ち時間(data-calc-label を持つツールのみ)。 */
const LABEL_SETTLE_MS = 1500;

/**
 * ツール本体が data-calc-label に出している「計算内容」の短い識別子
 * (例: pressure-converter の "atm>hPa")。GA4 のカーディナリティを抑えるため 40 文字で切る。
 */
function readCalcLabel(root: HTMLElement): string | undefined {
  const v = root.querySelector<HTMLElement>("[data-calc-label]")?.dataset.calcLabel?.trim();
  return v ? v.slice(0, 40) : undefined;
}

/** 値が入っている入力欄の数(空文字/未チェックは数えない)。 */
function countFilledInputs(root: HTMLElement): number {
  let n = 0;
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select").forEach((f) => {
    if (f instanceof HTMLInputElement) {
      const type = f.type;
      if (type === "hidden" || type === "button" || type === "submit" || type === "reset") return;
      if (type === "checkbox" || type === "radio") {
        if (f.checked) n++;
        return;
      }
    }
    if (f.value.trim() !== "") n++;
  });
  return n;
}

/**
 * 結果らしきものが描画されているか。
 * 共通の ResultCard が無いので、aria-live / output / role=status / data-result /
 * class に "result" を含む要素のいずれかに空でないテキストがあれば true とする
 * (223 本中 154 本が aria-live、186 本が result クラスを持つ)。
 */
function hasVisibleResult(root: HTMLElement): boolean {
  const nodes = root.querySelectorAll<HTMLElement>('[aria-live], output, [role="status"], [data-result], [class*="result"]');
  for (const node of nodes) {
    if ((node.textContent ?? "").trim() !== "") return true;
  }
  return false;
}
