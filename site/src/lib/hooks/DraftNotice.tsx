"use client";

import type { LocalDraft } from "@/lib/hooks/useLocalDraft";

interface DraftNoticeProps {
  draft: LocalDraft;
  /** Always-visible statement that inputs stay on this device only. */
  privacyNote: string;
  /** Shown when a previous session's inputs were restored. */
  restoredLabel: string;
  /** Label of the button that deletes the stored draft. */
  clearLabel: string;
}

/**
 * Standard footer for tools using `useLocalDraft`: permanently states that
 * inputs are stored on-device only (never sent to a server), flags when a
 * previous session was restored, and offers a clear-data button while a
 * draft exists.
 *
 * Lives under lib/hooks (not components/tools) — owned together with the hook.
 */
export function DraftNotice({ draft, privacyNote, restoredLabel, clearLabel }: DraftNoticeProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
      <p className="min-w-0 flex-1 basis-60">
        {privacyNote}
        {draft.restored && (
          <span className="ml-2 font-medium text-emerald-700 dark:text-emerald-400">{restoredLabel}</span>
        )}
      </p>
      {draft.hasDraft && (
        <button
          type="button"
          onClick={draft.clearDraft}
          className="shrink-0 rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
