import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { WORKFLOWS, getWorkflowContinuation, workflowCopy } from "@/lib/workflows/catalog";
import { WorkflowToolLink } from "@/components/workflows/WorkflowToolLink";

/**
 * A task-focused follow-up after the working tool, before related content and
 * ads. All 12 curated tools get a return-to-guide path, including the four
 * final steps. The hint does NOT claim that the user completed a calculation.
 */
export function WorkflowNextStep({ slug }: { slug: string }) {
  const journey = WORKFLOWS.find((flow) => flow.tools.some((step) => step === slug));
  const locale = useLocale();
  const t = useTranslations();
  if (!journey) return null;

  const followUp = getWorkflowContinuation(slug);
  const currentStep = journey.tools.findIndex((step) => step === slug) + 1;
  const copy = workflowCopy(locale);

  return (
    <aside aria-label={copy.nav}
      className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/20">
      <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">
        {copy.nav} · {copy.title(journey.id)}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        {copy.step} {currentStep} / {journey.tools.length}
      </p>
      {followUp && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            {copy.step} {followUp.nextStep}: {t(`tools.${followUp.nextSlug}.title`)}
          </div>
          <WorkflowToolLink slug={followUp.nextSlug} workflow={followUp.workflow}
            step={followUp.nextStep}>{copy.open} →</WorkflowToolLink>
        </div>
      )}
      <Link href={`/workflows#${journey.id}`}
        className="mt-3 inline-block text-xs text-brand-700 hover:underline dark:text-brand-400">
        {copy.nav} →
      </Link>
    </aside>
  );
}
