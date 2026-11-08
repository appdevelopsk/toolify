import { WORKFLOWS } from "../src/lib/workflows/steps.ts";
import {
  hasNoindex, canonicalHref, hasSitemapLocation,
  hasWorkflowStepAnchor, hasWorkflowGuideAnchor,
} from "./growth-html-checks.mjs";

/**
 * READ-ONLY postdeployment smoke for the goal-based navigation pilot.
 * This must run only after the reviewed SHA is publicly deployed.
 * No indexing requests, analytics events, mutations or external actions.
 */
const base = new URL(process.env.SITE_URL || "https://toolify365.com");
if ((base.protocol !== "https:" && base.hostname !== "localhost")
    || base.pathname !== "/" || base.search || base.hash) {
  throw Error("SITE_URL must be a clean HTTPS site origin (except localhost)");
}
const errors = [];
const pathOnly = (value) => value.replace(/\/$/, "");

async function fetchPage(path) {
  const response = await fetch(new URL(path, base), {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "Toolify365-workflow-postdeploy-smoke/1.0" },
  });
  const html = await response.text();
  const final = new URL(response.url);
  if (response.status !== 200) errors.push(`${path}: HTTP ${response.status}`);
  if (pathOnly(final.pathname) !== path || final.origin !== base.origin || final.search || final.hash) {
    errors.push(`${path}: redirect target differs (${response.url})`);
  }
  if (!response.headers.get("content-type")?.includes("text/html")) {
    errors.push(`${path}: not an HTML response`);
  }
  return { html, response, path };
}
function assertCanonical(html, path) {
  const value = canonicalHref(html);
  if (!value) {
    errors.push(`${path}: canonical missing`);
    return;
  }
  try {
    const url = new URL(value, base);
    if (url.origin !== base.origin || pathOnly(url.pathname) !== path || url.search || url.hash) {
      errors.push(`${path}: noncanonical destination ${url.href}`);
    }
  } catch { errors.push(`${path}: malformed canonical`); }
}

for (const locale of ["en", "ja", "ar"]) {
  const path = `/${locale}/workflows`;
  try {
    const { html, response } = await fetchPage(path);
    assertCanonical(html, path);
    if (!hasNoindex(html, response.headers.get("x-robots-tag") || "")) {
      errors.push(`${path}: guide must remain noindex during pilot`);
    }
    for (const flow of WORKFLOWS) {
      for (const [index, slug] of flow.tools.entries()) {
        if (!hasWorkflowStepAnchor(html, { locale, workflow: flow.id, step: index + 1, slug }, base.origin)) {
          errors.push(`${path}: missing/unsafe step ${flow.id} ${index + 1} -> ${slug}`);
        }
      }
    }
    console.log(`Checked ${path}`);
  } catch (error) { errors.push(`${path}: ${String(error)}`); }
}

// Real tool pages should preserve an actionable second step, and terminal
// steps should always permit returning to the guide to choose another task.
for (const flow of WORKFLOWS) {
  const [first, second, last] = flow.tools;
  for (const [slug, terminal] of [[first, false], [last, true]]) {
    const path = `/en/tools/${slug}`;
    try {
      const { html } = await fetchPage(path);
      assertCanonical(html, path);
      if (terminal) {
        if (!hasWorkflowGuideAnchor(html, { locale: "en", workflow: flow.id }, base.origin)) {
          errors.push(`${path}: missing final-step guide return`);
        }
      } else if (!hasWorkflowStepAnchor(html, { locale: "en", workflow: flow.id, slug: second, step: 2 }, base.origin)) {
        errors.push(`${path}: missing next-step link`);
      }
      console.log(`Checked ${path}`);
    } catch (error) { errors.push(`${path}: ${String(error)}`); }
  }
}
try {
  const sitemap = await fetch(new URL("/sitemap.xml", base), {
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "Toolify365-workflow-postdeploy-smoke/1.0" },
  });
  const xml = await sitemap.text();
  if (sitemap.status !== 200) errors.push(`/sitemap.xml: HTTP ${sitemap.status}`);
  for (const locale of ["en", "ja", "ar"]) {
    if (hasSitemapLocation(xml, `${base.origin}/${locale}/workflows`)) {
      errors.push(`sitemap unexpectedly indexes /${locale}/workflows`);
    }
  }
} catch (error) { errors.push(`sitemap: ${String(error)}`); }

if (errors.length) {
  console.error(`Workflow live smoke failed (${errors.length}):`);
  errors.forEach((value) => console.error("- " + value));
  process.exitCode = 1;
} else {
  console.log("Workflow live smoke PASS: route, real links, canonical, noindex and sitemap parity.");
}
