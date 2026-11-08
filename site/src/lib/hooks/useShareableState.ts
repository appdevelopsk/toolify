"use client";

import { useEffect, useRef, useState } from "react";
import {
  RESULT_LINK_REQUEST, type ResultLinkRequest,
  clearStaleResultShareState, createResultShareLink,
  migrateLegacyShareQuery, readResultShareState,
} from "./result-share-link";

/**
 * 明示的な「結果リンクをコピー」で現在値を #s= フラグメントにエンコードする。
 *
 * useLocalDraft と同じ (slug, value, restore) 契約。違いは保存先だけで、
 * localStorage ではなく現在の URL を書き換える。
 *
 * - 復元はマウント時に一度だけ。?s= が無ければ何もしない（既定値のまま）。
 * - 入力中はURLを書き換えない。既存 ?s= は引き続き復元し、
 *   復元後に #s= へ移動するため、以降のHTTPリクエストには含まれない。
 * - フラグメントは外部JavaScriptから閲覧可能なため、機密情報の共有は
 *   禁止。初期状態への復元とユーザー操作を区別して処理する。
 */

const MAX_SHARED_STATE_LENGTH = 4096;

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
  if (raw.length > MAX_SHARED_STATE_LENGTH) throw new Error("Share state exceeds size limit");
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
      const raw = readResultShareState(window.location.href);
      if (!raw) return;
      const parsed = decodeState(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        restoreRef.current(parsed as T);
        setRestored(true);
      }
    } catch {
      /* 壊れた ?s= は無視して既定値のまま動かす */
    }
    // Old ?s= URLs remain readable, but are relocated after hydration.
    const legacy = new URL(window.location.href).searchParams.get("s");
    if (legacy !== null) {
      const migrated = legacy.length > 0 && legacy.length <= MAX_SHARED_STATE_LENGTH
        ? migrateLegacyShareQuery(window.location.href)
        : clearStaleResultShareState(window.location.href);
      if (migrated) {
        window.history.replaceState(window.history.state, "", migrated);
        window.dispatchEvent(new Event("toolify:share-state-change"));
      }
    }

    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<ResultLinkRequest>).detail;
      if (detail?.slug !== toolSlug || typeof detail.respond !== "function") return;
      try {
        const encoded = encodeState(JSON.parse(currentSerialized.current) as object);
        detail.respond(createResultShareLink(window.location.href, encoded, MAX_SHARED_STATE_LENGTH));
      } catch {
        detail.respond(null);
      }
    };
    window.addEventListener(RESULT_LINK_REQUEST, onRequest);
    return () => window.removeEventListener(RESULT_LINK_REQUEST, onRequest);
    // Re-register only when the tool slug changes.
  }, [toolSlug]);

  const serialized = JSON.stringify(value);
  const currentSerialized = useRef(serialized);
  currentSerialized.current = serialized;
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = serialized;
    if (prev === null || prev === serialized) return;
    // A restored link becomes stale after the underlying inputs change.
    // Never put the next value in browser history automatically.
    const clean = clearStaleResultShareState(window.location.href);
    if (!clean) return;
    window.history.replaceState(window.history.state, "", clean);
    window.dispatchEvent(new Event("toolify:share-state-change"));
  }, [serialized]);

  return { restored };
}
