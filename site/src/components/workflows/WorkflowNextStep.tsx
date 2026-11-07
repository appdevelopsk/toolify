import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { getWorkflowContinuation, workflowCopy } from "@/lib/workflows/catalog";
import { WorkflowToolLink } from "@/components/workflows/WorkflowToolLink";

/**
 * A light next-action hint, rendered after the working tool — never before the
 * primary result and never in an advertisement placement.
 */
export function WorkflowNextStep({ slug }: { slug: string }) {
  const followUp = getWorkflowContinuation(slug);
  const locale = useLocale();
  const t = useTranslations();
  if (!followUp) return null;
  const copy = workflowCopy(locale);
  const destinationTitle = t(`tools.${followUp.nextSlug}.title`);
  return (
    <aside aria-label={copy.nav}
      className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/20">
      <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">
        {copy.nav} · {copy.title(followUp.workflow)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {copy.step} {followUp.nextStep}: {destinationTitle}
        </div>
        <WorkflowToolLink slug={followUp.nextSlug} workflow={followUp.workflow}
          step={followUp.nextStep}>{copy.open} →</WorkflowToolLink>
      </div>
      <Link href={`/workflows#${followUp.workflow}`}
        className="mt-2 inline-block text-xs text-brand-700 hover:underline dark:text-brand-400">
        {copy.nav} →
      </Link>
    </aside>
  );
}
