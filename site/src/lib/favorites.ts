"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "toolify:favorites";

/** localStorage-backed favorite tool slugs, synced across components and tabs. */
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full / unavailable — keep in-memory only */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // force re-read from the other tab's write
      cb();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: string[] = [];

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((slug: string) => {
    const current = read();
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current]);
  }, []);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  return { favorites, toggle, isFavorite };
}
