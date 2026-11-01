import type { SoftwareSlug } from "./catalog";
export type PurchaseProvider = "stripe" | "apple" | "google" | "microsoft";
export type LicenseKind = "free" | "subscription" | "perpetual";
export type VerifiedLicense = {
  product: SoftwareSlug;
  provider: PurchaseProvider;
  kind: Exclude<LicenseKind,"free">;
  purchaseId: string;
  verifiedAt: string;
  expiresAt: string | null;
  revoked: boolean;
};
/**
 * Server-side only decision. 'verified' MUST only be populated after validation
 * with the billing provider, never from browser state or client-supplied claims.
 */
export function hasProAccess(product: SoftwareSlug, verified: VerifiedLicense | null, now: Date = new Date()): boolean {
  if (!verified || verified.product !== product || verified.revoked || !verified.purchaseId) return false;
  if (!Number.isFinite(Date.parse(verified.verifiedAt))) return false;
  if (verified.kind === "perpetual") return verified.expiresAt === null;
  if (verified.kind === "subscription") {
    if (!verified.expiresAt) return false;
    const expires = Date.parse(verified.expiresAt);
    return Number.isFinite(expires) && expires > now.getTime();
  }
  return false;
}
export type BillingState = "disabled" | "enabled";
/** Fail closed: checkout must stay disabled until a verified production backend exists. */
export const BILLING_STATE: BillingState = "disabled";
