"use client";

import { useEffect } from "react";

/**
 * `/` キーでサイト内検索を開く共通ショートカット。
 *
 * ヘッダー検索(全ページ)と /tools のページ内検索(そのページのみ)が同時に
 * 存在するため、両者が個別に keydown を拾うと二重に反応する。登録制にして
 * 優先度の一番高いもの1つだけを起動する(/tools ではページ内検索が勝つ)。
 */
type Entry = { priority: number; activate: () => void };
const entries = new Set<Entry>();
let bound = false;

function isEditable(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
  if (isEditable(e.target)) return;
  let best: Entry | null = null;
  for (const en of entries) if (!best || en.priority > best.priority) best = en;
  if (!best) return;
  e.preventDefault();
  best.activate();
}

export function useSearchShortcut(activate: () => void, priority = 0) {
  useEffect(() => {
    const entry: Entry = { priority, activate };
    entries.add(entry);
    if (!bound) {
      document.addEventListener("keydown", onKeyDown);
      bound = true;
    }
    return () => {
      entries.delete(entry);
      if (entries.size === 0 && bound) {
        document.removeEventListener("keydown", onKeyDown);
        bound = false;
      }
    };
  }, [activate, priority]);
}
