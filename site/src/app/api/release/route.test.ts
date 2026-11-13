import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("public release identity endpoint", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("exposes only the public Git SHA as plain text without caching", async () => {
    const sha = "617553e7018322ff97b21440d984f028b1fdb208";
    vi.stubEnv("NEXT_PUBLIC_RELEASE_SHA", sha);
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(sha + "\n");
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("is public for verification yet explicitly excluded from search indexing", () => {
    const response = GET();
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("reports unknown rather than leaking other environment variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_RELEASE_SHA", "");
    const response = GET();
    expect(await response.text()).toBe("unknown\n");
  });
});
