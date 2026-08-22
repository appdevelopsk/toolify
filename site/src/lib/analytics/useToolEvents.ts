"use client";

import { useCallback, useRef } from "react";
import { trackCalculate, trackCopyResult, trackPresetClick } from "./events";

/**
 * ツールコンポーネントから GA4 イベントを送るためのフック。
 *
 * calculate は「有効な結果が初めて出たとき」1回だけ送る。
 * このサイトのツールは submit ボタンを持たず入力のたびに再計算するため、
 * 素朴に送ると1着地で数十イベントになり engagement 指標が壊れる。
 * useRef のフラグでツール1マウントにつき1回へ間引く。
 */
export function useToolEvents(slug: string) {
  const calculated = useRef(false);

  const calculate = useCallback(
    (label?: string) => {
      if (calculated.current) return;
      calculated.current = true;
      trackCalculate({ tool: slug, ...(label ? { label } : {}) });
    },
    [slug],
  );

  const copyResult = useCallback(
    (label?: string) => trackCopyResult({ tool: slug, ...(label ? { label } : {}) }),
    [slug],
  );

  const presetClick = useCallback(
    (label?: string) => trackPresetClick({ tool: slug, ...(label ? { label } : {}) }),
    [slug],
  );

  return { calculate, copyResult, presetClick };
}
