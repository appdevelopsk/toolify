"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { trackCalculate, trackCopyResult, trackPresetClick } from "@/lib/analytics/events";

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
export function ToolInteractionTracker({ slug, children }: { slug: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const sent = useRef({ calculate: false, copy: false, preset: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onInput() {
      if (sent.current.calculate) return;
      sent.current.calculate = true;
      trackCalculate({ tool: slug });
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
        trackCopyResult({ tool: slug });
        return;
      }

      // プリセット/サンプル/例示ボタン。文言で判別する。
      // ここを「コピー以外の全ボタン」にすると、モード切替もシェアも
      // preset_click になり指標として使えなくなるため、明示的に絞る。
      if (/preset|sample|example|プリセット|サンプル|例|ejemplo|beispiel|exemple|пример|示例|範例|예시/.test(label)) {
        if (sent.current.preset) return;
        sent.current.preset = true;
        trackPresetClick({ tool: slug });
      }
    }

    el.addEventListener("input", onInput);
    el.addEventListener("change", onInput);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("change", onInput);
      el.removeEventListener("click", onClick);
    };
  }, [slug]);

  return <div ref={ref}>{children}</div>;
}
