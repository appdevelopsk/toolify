"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ツールの入力値を URL のクエリ (?s=...) に載せ、計算結果ごと共有・ブックマークできるようにする。
 *
 * useLocalDraft と同じ (slug, value, restore) 契約。違いは保存先だけで、
 * localStorage ではなく現在の URL を書き換える。
 *
 * - 復元はマウント時に一度だけ。?s= が無ければ何もしない（既定値のまま）。
 * - 書き込みは history.replaceState。pushState にすると入力1文字ごとに
 *   履歴が積まれて「戻る」が壊れるため使わない。
 * - 初期レンダーでは書かない（useLocalDraft と同様 prevRef ガード）。
 *   これにより「素の /tools/bmi-calculator」が勝手に ?s= 付き URL に変わらない。
 * - 値は端末を離れない。URL に載るのはユーザー自身が共有した時だけで、
 *   サーバーへの送信はどこにも無い（?s= はクライアントでのみ読まれる）。
 */

/** JSON → base64url。URL に載せても壊れない形にする。 */
function encodeState(value: object): string {
  const json = JSON.stringify(value);
  // btoa は Latin-1 しか受けないため UTF-8 を先にバイト列へ。
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeState(raw: string): unknown {
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export interface ShareableState {
  /** URL から状態を復元した場合 true（「共有リンクを開いた」の判定に使える）。 */
  restored: boolean;
}

export function useShareableState<T extends object>(
  toolSlug: string,
  value: T,
  restore: (saved: T) => void,
): ShareableState {
  const [restored, setRestored] = useState(false);
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  useEffect(() => {
    try {
      const raw = new URLSearchParams(window.location.search).get("s");
      if (!raw) return;
      const parsed = decodeState(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        restoreRef.current(parsed as T);
        setRestored(true);
      }
    } catch {
      /* 壊れた ?s= は無視して既定値のまま動かす */
    }
    // toolSlug はキーではないが、ツールが切り替わったら読み直すため依存に置く。
  }, [toolSlug]);

  const serialized = JSON.stringify(value);
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = serialized;
    if (prev === null || prev === serialized) return;
    try {
      const encoded = encodeState(JSON.parse(serialized) as object);
      const url = new URL(window.location.href);
      url.searchParams.set("s", encoded);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* URL が長すぎる等 — 共有できないだけで計算は続行 */
    }
  }, [serialized]);

  return { restored };
}
