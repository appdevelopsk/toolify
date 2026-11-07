"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { trackWorkflowStepClick } from "@/lib/analytics/events";
import type { WorkflowId } from "@/lib/workflows/catalog";

/** Counts intentional workflow navigation, never input or result values. */
export function WorkflowToolLink({
  slug, workflow, step, children,
}: {
  slug: string;
  workflow: WorkflowId;
  step: number;
  children: ReactNode;
}) {
  const locale = useLocale();
  return (
    <Link href={`/tools/${slug}`} prefetch={false}
      onClick={() => trackWorkflowStepClick({ workflow, step, destination: slug, locale })}
      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
      {children}
    </Link>
  );
}
