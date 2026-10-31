import { describe, it, expect } from "vitest";
import { SOFTWARE_PRODUCTS } from "./catalog";
import { DISTRIBUTION, isPublishedTarget } from "./distribution";
import { BILLING_STATE, hasProAccess } from "./entitlements";
describe("software distribution", () => {
 it("has at least one declared target per product", () => {
  for(const product of SOFTWARE_PRODUCTS) expect(DISTRIBUTION[product.slug].length).toBeGreaterThan(0);
 });
 it("only three browser workbenches are marked live, with valid internal routes", () => {
  const live=Object.values(DISTRIBUTION).flat().filter(t=>t.state==="live");
  expect(live).toHaveLength(3);
  expect(live.every(t=>t.platform==="web" && isPublishedTarget(t))).toBe(true);
 });
 it("will not present placeholder or external HTTP links as downloads", () => {
  expect(isPublishedTarget({platform:"windows",state:"live",path:null})).toBe(false);
  expect(isPublishedTarget({platform:"android",state:"live",path:"http://example.com/app"})).toBe(false);
 });
 it("fails closed for paid access until provider verification", () => {
  expect(BILLING_STATE).toBe("disabled");
  expect(hasProAccess("json-studio",null)).toBe(false);
  expect(hasProAccess("json-studio",{product:"json-studio",provider:"stripe",kind:"subscription",purchaseId:"p",verifiedAt:"2026-01-01",expiresAt:"2026-02-01",revoked:false},new Date("2026-03-01"))).toBe(false);
  expect(hasProAccess("json-studio",{product:"json-studio",provider:"stripe",kind:"subscription",purchaseId:"p",verifiedAt:"2026-01-01",expiresAt:"2026-12-01",revoked:true})).toBe(false);
 });
});
