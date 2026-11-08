/**
 * Clarity is disabled by default because private ?s= tool result state can
 * appear in captured URLs even when input DOM is masked. An existing project
 * ID alone does not authorize third-party session recording.
 *
 * Approval must come from a reviewed, build-time deployment setting.
 * The caller still needs consent handling and external Clarity URL QA.
 */
export function canLoadClarity(projectId: string, urlPrivacyApproved: string | undefined): boolean {
  return projectId.trim().length > 0 && urlPrivacyApproved === "confirmed";
}
