"use client";

import { useEffect, type RefObject } from "react";
import { isShareableField, isSharePayloadWithinLimit, isValidRestoredFieldValue } from "./share-input-policy";
import {
  RESULT_LINK_REQUEST, RESULT_LINK_AVAILABILITY_REQUEST, RESULT_LINK_CAPABILITY_CHANGED,
  type ResultLinkRequest, type ResultLinkAvailabilityRequest,
  clearStaleResultShareState, createResultShareLink,
  migrateLegacyShareQuery, readResultShareState,
} from "./result-share-link";

/**
 * ツール本体の DOM 入力を丸ごと ?s= に載せ、共有リンクから復元する。
 *
 * なぜ DOM 総なめ方式か: useShareableState は (slug, value, restore) を
 * ツール側が手書きする契約で、223本中7本しか採用されていない。残り216本に
 * 個別の restore コールバックを書くのは非現実的で、実装差異による取りこぼしも
 * 避けられない。入力の実体はどれも DOM 上の input/select/textarea なので、
 * ToolInteractionTracker と同じく「バブリングを1箇所で拾う」方が網羅的。
 *
 * キーは「出現位置」ではなく構造キー(type + 同種内の連番)。理由は
 * triangle-calculator のように mode によって表示される input 本数が変わる
 * ツールが35本あり、素の通し番号だと復元先が1つずれて別の項目に値が入るため。
 * 構造キーなら、表示中のフィールド群が変わっても同種フィールドの対応が保たれる。
 *
 * 復元は2パスで行う。select(モード切替)を先に当ててから、それによって
 * 新しく現れた input を次のフレームで埋める。1パスだと「sss モードの共有リンクを
 * right モードの初期表示に流し込む」ことになり、値が入らない/誤った欄に入る。
 *
 * React 19 の制御コンポーネントは el.value への直接代入を無視する(内部の
 * value tracker が「変化なし」と判断して onChange を出さない)ため、
 * ネイティブ setter で書いてから input/change を dispatch する。
 *
 * モード切替が <select> ではなく <button> のツールが14本ある(triangle-calculator の
 * right/sss/sas 等)。ボタンの選択状態は React state にしか無く DOM の値にならないため、
 * 「選択中は bg-brand-600 が付く」という当リポジトリ共通の見た目規約を手掛かりに、
 * 押されているボタンの index を `b` として保存し、復元時に click し直す。
 * これが無いと「sss で共有したリンクが right のまま開き、3辺の値が2欄に入る」事故になる。
 * 規約が当てはまらないツールでは `b` が空になり、従来通り入力値だけが復元される
 * (モードは既定のまま = 壊れるのではなく、共有範囲が狭まるだけ)。
 *
 * 入力中の状態はURLに書き込まない。結果リンクを明示的にコピーする時だけ
 * ハッシュフラグメントに含める。フラグメントも外部JSから参照できるため
 * 機密情報を共有しないよう利用者に注意が必要。
 */

/** 選択中を表す配色クラス。ToolFrame 配下のツール本体に限って探す。 */
const ACTIVE_CLASS = "bg-brand-600";

/** 直列化・復元の対象にするフィールドだけを返す。file は復元不能なので除く。 */
function fields(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("input, select, textarea"),
  ).filter((el) => {
    // Do not share fields explicitly marked private or browser-autofilled as PII.
    const privateField = !!el.closest("[data-private], [data-share=\"off\"]");
    const identifier = `${el.getAttribute("name") ?? ""} ${el.id}`;
    const explicitTextOptIn = el.getAttribute("data-share") === "on";
    if (el instanceof HTMLInputElement) {
      return isShareableField(el.type, el.autocomplete, privateField, identifier, explicitTextOptIn);
    }
    if (el instanceof HTMLTextAreaElement) {
      return isShareableField("textarea", el.autocomplete, privateField, identifier, explicitTextOptIn);
    }
    return isShareableField("select", el.getAttribute("autocomplete") ?? "", privateField, identifier, explicitTextOptIn);
  });
}

/**
 * 構造キー: `${種別}${同種内の連番}`。
 * 表示本数が変わっても同種フィールド同士の対応が崩れにくい。
 */
function keyOf(el: HTMLElement, seen: Map<string, number>): string {
  let kind: string;
  if (el instanceof HTMLInputElement) kind = el.type || "text";
  else if (el instanceof HTMLSelectElement) kind = "select";
  else kind = "textarea";
  // radio は name でグループ化されるので、グループ単位のキーにする。
  if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
    kind = `radio:${el.name}`;
  }
  const n = seen.get(kind) ?? 0;
  seen.set(kind, n + 1);
  return `${kind}${n}`;
}

function readValue(el: HTMLElement): string | boolean | null {
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox") return el.checked;
    if (el.type === "radio") return el.checked ? el.value : null;
    return el.value;
  }
  if (el instanceof HTMLSelectElement) return el.value;
  if (el instanceof HTMLTextAreaElement) return el.value;
  return null;
}

/** React の value tracker を迂回して値を入れ、onChange を発火させる。 */
function writeValue(el: HTMLElement, v: string | boolean): void {
  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
    const next = typeof v === "boolean" ? v : el.value === v;
    if (el.checked === next) return;
    el.click(); // checked 系は click が最も確実に React の状態へ伝わる
    return;
  }
  const str = typeof v === "boolean" ? String(v) : v;
  if ((el as HTMLInputElement).value === str) return;
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, str);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function encodeState(value: object): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeState(raw: string): unknown {
  // Ignore oversized external URLs before base64 decoding and JSON parsing.
  if (!isSharePayloadWithinLimit(raw, MAX_ENCODED)) throw new Error("Share state exceeds size limit");
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** ツール本体内のボタン。選択中(bg-brand-600)の index を後で復元する。 */
function buttons(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
}

/** Only buttons within an active multi-button mode selector may be replayed from a URL. */
function isModeButton(btn: HTMLButtonElement): boolean {
  const parent = btn.parentElement;
  if (!parent || btn.disabled || (btn.type === "submit" && btn.closest("form"))) return false;
  const siblings = Array.from(parent.children).filter(
    (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
  );
  return siblings.length >= 2 && siblings.some((b) => b.className.includes(ACTIVE_CLASS));
}

/** 現在の DOM 状態を構造キー→値のオブジェクトに落とす。 */
function snapshot(root: HTMLElement): Record<string, string | boolean> {
  const seen = new Map<string, number>();
  const out: Record<string, string | boolean> = {};
  for (const el of fields(root)) {
    const k = keyOf(el, seen);
    const v = readValue(el);
    if (v === null) continue;
    out[k] = v;
  }
  // 選択中モードボタンの index 一覧(カンマ区切り)。該当が無ければキー自体を作らない。
  const active = buttons(root)
    .map((b, i) => (isModeButton(b) && b.className.includes(ACTIVE_CLASS) ? i : -1))
    .filter((i) => i >= 0);
  if (active.length > 0) out.b = active.join(",");
  return out;
}

/** URL が長くなりすぎる共有リンクは作らない(ブラウザ/SNS が切る)。 */
const MAX_ENCODED = 1800;

export function useAutoShareableState(
  ref: RefObject<HTMLElement | null>,
  slug: string,
  /** ツール自身が useShareableState を使っている場合は false にして二重書き込みを避ける。 */
  enabled: boolean,
): void {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;

    // --- 復元 (2パス) ---
    let restoring = true;
    let raf: number | undefined;
    try {
      const raw = readResultShareState(window.location.href);
      if (raw) {
        const parsed = decodeState(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const saved = parsed as Record<string, string | boolean>;
          const apply = (only?: (el: HTMLElement) => boolean) => {
            const seen = new Map<string, number>();
            for (const el of fields(root)) {
              const k = keyOf(el, seen);
              const v = saved[k];
              // `k in saved` では index 型が絞れないので値を取って判定する。
              if (typeof v !== "string" && typeof v !== "boolean") continue;
              if (only && !only(el)) continue;
              const kind = el instanceof HTMLInputElement ? el.type : el instanceof HTMLSelectElement ? "select" : "textarea";
              if (!isValidRestoredFieldValue(kind, v)) continue;
              if (el instanceof HTMLSelectElement && !Array.from(el.options).some((option) => option.value === v)) continue;
              if (el instanceof HTMLInputElement && el.type === "radio" && el.value !== v) continue;
              writeValue(el, v);
            }
          };
          // 1st: モード切替(select / radio / ボタン)を先に当てる。
          apply((el) => el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && el.type === "radio"));
          // ボタン式モードは index を click し直す。既に選択中なら押さない
          // (トグル実装のツールで二度押しになり元に戻るのを防ぐ)。
          const b = saved.b;
          if (typeof b === "string" && b.length > 0) {
            const all = buttons(root);
            for (const raw of b.split(",")) {
              const i = Number(raw);
              if (!Number.isSafeInteger(i) || i < 0 || i >= all.length) continue;
              const btn = all[i];
              if (btn && isModeButton(btn) && !btn.className.includes(ACTIVE_CLASS)) btn.click();
            }
          }
          // 2nd: 切替で現れたフィールドを含めて全体を当てる。
          raf = requestAnimationFrame(() => {
            apply();
            restoring = false;
            window.dispatchEvent(new Event(RESULT_LINK_CAPABILITY_CHANGED));
          });
        } else {
          restoring = false;
        }
      } else {
        restoring = false;
      }
    } catch {
      restoring = false; // 壊れた ?s= は無視して既定値のまま動かす
    }

    // Incoming legacy ?s= links can still restore; after hydration their state
    // moves into a URL fragment so subsequent HTTP navigation/referrers omit it.
    const incoming = new URL(window.location.href);
    if (incoming.searchParams.has("s")) {
      const legacy = incoming.searchParams.get("s");
      const safe = legacy && isSharePayloadWithinLimit(legacy, MAX_ENCODED)
        ? migrateLegacyShareQuery(window.location.href)
        : clearStaleResultShareState(window.location.href);
      if (safe) {
        window.history.replaceState(window.history.state, "", safe);
        window.dispatchEvent(new Event("toolify:share-state-change"));
      }
    }

    // Never write user inputs into the page URL on each keystroke.
    // Only a direct "Copy result link" action asks for a snapshot, and the
    // returned fragment URL is copied without changing browser history.
    const captureEncodedState = (): string | null => {
      const current = snapshot(root);
      if (Object.keys(current).length === 0) return null;
      const encoded = encodeState(current);
      return isSharePayloadWithinLimit(encoded, MAX_ENCODED) ? encoded : null;
    };
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<ResultLinkRequest>).detail;
      if (detail?.slug !== slug || typeof detail.respond !== "function") return;
      try {
        const encoded = captureEncodedState();
        detail.respond(encoded ? createResultShareLink(window.location.href, encoded, MAX_ENCODED) : null);
      } catch {
        detail.respond(null);
      }
    };
    const onAvailabilityRequest = (event: Event) => {
      const detail = (event as CustomEvent<ResultLinkAvailabilityRequest>).detail;
      if (detail?.slug !== slug || typeof detail.respond !== "function") return;
      try {
        detail.respond(captureEncodedState() !== null);
      } catch {
        detail.respond(false);
      }
    };
    const notifyAvailability = () =>
      window.dispatchEvent(new Event(RESULT_LINK_CAPABILITY_CHANGED));

    const onChange = () => {
      // Synthetic input after restoration can be a genuine preset change.
      // Restoration itself remains suppressed by the restoring flag.
      if (restoring) return;
      notifyAvailability();
      const clean = clearStaleResultShareState(window.location.href);
      if (!clean) return;
      window.history.replaceState(window.history.state, "", clean);
      window.dispatchEvent(new Event("toolify:share-state-change"));
    };

    // Multi-button tool modes may update React state without emitting
    // input/change. Invalidate a previously restored result on a real mode
    // selection, but never on synthetic replay during hydration.
    let availabilityFrame: number | undefined;
    const onModeClick = (event: MouseEvent) => {
      if (restoring || !event.isTrusted) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (button instanceof HTMLButtonElement && root.contains(button) && isModeButton(button)) {
        onChange();
        // Dynamic input controls may appear only after React commits the mode.
        if (availabilityFrame !== undefined) cancelAnimationFrame(availabilityFrame);
        availabilityFrame = requestAnimationFrame(() => {
          availabilityFrame = undefined;
          notifyAvailability();
        });
      }
    };

    window.addEventListener(RESULT_LINK_REQUEST, onRequest);
    window.addEventListener(RESULT_LINK_AVAILABILITY_REQUEST, onAvailabilityRequest);
    notifyAvailability();
    root.addEventListener("input", onChange);
    root.addEventListener("change", onChange);
    root.addEventListener("click", onModeClick);
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      if (availabilityFrame !== undefined) cancelAnimationFrame(availabilityFrame);
      window.removeEventListener(RESULT_LINK_REQUEST, onRequest);
      window.removeEventListener(RESULT_LINK_AVAILABILITY_REQUEST, onAvailabilityRequest);
      root.removeEventListener("input", onChange);
      root.removeEventListener("change", onChange);
      root.removeEventListener("click", onModeClick);
    };
  }, [ref, slug, enabled]);
}
