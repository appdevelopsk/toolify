"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Key prefix for per-tool drafts. One entry per tool slug, e.g.
 * `toolify.draft.bmi-calculator`.
 */
const STORAGE_PREFIX = "toolify.draft.";

export interface LocalDraft {
  /** True while a draft exists in localStorage (restored on mount or saved since). */
  hasDraft: boolean;
  /** True when inputs were restored from a previous visit (until cleared). */
  restored: boolean;
  /** Delete the stored draft. Current on-screen inputs are kept; the next edit saves again. */
  clearDraft: () => void;
}

/**
 * Persist a tool's input state to the browser's localStorage and restore it on
 * the next visit. Privacy by design: data never leaves the device — there is no
 * network write anywhere in this hook (tools using it must state this in their UI,
 * see `DraftNotice`).
 *
 * Behavior:
 * - On mount, if a draft exists, `restore(saved)` is called once with the parsed value.
 *   The callback must validate fields before applying them (storage can hold stale shapes).
 * - Afterwards, every change of `value` is written back. The untouched initial render
 *   is NOT saved, so merely opening a page never creates a draft.
 * - Storage failures (private mode, quota, disabled) are swallowed: the tool keeps
 *   working, just without persistence.
 */
export function useLocalDraft<T extends object>(
  toolSlug: string,
  value: T,
  restore: (saved: T) => void,
): LocalDraft {
  const storageKey = STORAGE_PREFIX + toolSlug;
  const [hasDraft, setHasDraft] = useState(false);
  const [restored, setRestored] = useState(false);
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  // Restore once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          restoreRef.current(parsed as T);
          setHasDraft(true);
          setRestored(true);
        }
      }
    } catch {
      // Corrupted JSON or storage unavailable — start fresh.
    }
  }, [storageKey]);

  // Save whenever inputs change. `prevRef === null` marks the initial render
  // (default values), which must not be persisted.
  const serialized = JSON.stringify(value);
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = serialized;
    if (prev === null || prev === serialized) return;
    try {
      window.localStorage.setItem(storageKey, serialized);
      setHasDraft(true);
    } catch {
      // Quota exceeded / private mode — persistence is best-effort only.
    }
  }, [storageKey, serialized]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore: nothing to clear if storage is unavailable.
    }
    setHasDraft(false);
    setRestored(false);
  }, [storageKey]);

  return { hasDraft, restored, clearDraft };
}
