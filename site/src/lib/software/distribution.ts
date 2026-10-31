import type { SoftwareSlug } from "./catalog";
export type Platform = "web" | "windows" | "macos" | "ios" | "android";
export type ReleaseState = "live" | "planned";
export type DistributionTarget = { platform: Platform; state: ReleaseState; path: string | null };
const native = (): Omit<DistributionTarget, "platform"> => ({ state: "planned", path: null });
/**
 * Never add a fake store/download URL. A target can only be live with a verified
 * absolute HTTPS URL or an actual first-party route.
 */
export const DISTRIBUTION: Record<SoftwareSlug, readonly DistributionTarget[]> = {
  "csv-cleaner-pro": [{platform:"web",state:"live",path:"/software/csv-cleaner-pro"},{platform:"windows",...native()},{platform:"macos",...native()}],
  "json-studio": [{platform:"web",state:"live",path:"/software/json-studio"},{platform:"windows",...native()},{platform:"macos",...native()}],
  "text-batch-studio": [{platform:"web",state:"live",path:"/software/text-batch-studio"},{platform:"windows",...native()},{platform:"macos",...native()}],
  "pdf-toolkit-pro": [{platform:"web",...native()},{platform:"windows",...native()},{platform:"macos",...native()},{platform:"ios",...native()},{platform:"android",...native()}],
  "bulk-image-studio": [{platform:"web",...native()},{platform:"windows",...native()},{platform:"macos",...native()},{platform:"ios",...native()},{platform:"android",...native()}],
  "file-organizer-pro": [{platform:"windows",...native()},{platform:"macos",...native()}],
  "excel-formula-ai": [{platform:"web",...native()},{platform:"ios",...native()},{platform:"android",...native()}],
  "seo-audit-pro": [{platform:"web",...native()}],
  "website-monitor": [{platform:"web",...native()},{platform:"ios",...native()},{platform:"android",...native()}],
  "invoice-maker-pro": [{platform:"web",...native()},{platform:"ios",...native()},{platform:"android",...native()}]
};
export function isPublishedTarget(target: DistributionTarget): boolean {
  return target.state === "live" && !!target.path &&
    (target.path.startsWith("/software/") || /^https:\/\/[^\s/]+\//.test(target.path));
}
export function getDownloadTargets(slug: SoftwareSlug) {
  return DISTRIBUTION[slug].filter(isPublishedTarget);
}
