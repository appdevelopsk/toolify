import { describe, expect, it } from "vitest";
import { isSisterSiteUrl, withSisterUtm } from "./utm";

describe("withSisterUtm", () => {
  it("adds toolify365/referral/<campaign> to sister sites", () => {
    expect(withSisterUtm("https://pickly.blog", "footer")).toBe(
      "https://pickly.blog/?utm_source=toolify365&utm_medium=referral&utm_campaign=footer",
    );
    expect(withSisterUtm("https://appdevelopsk.com/apps.html", "footer")).toBe(
      "https://appdevelopsk.com/apps.html?utm_source=toolify365&utm_medium=referral&utm_campaign=footer",
    );
  });
  it("keeps an existing utm_source", () => {
    const u = "https://fxea365.com/?utm_source=x&utm_medium=y";
    expect(withSisterUtm(u, "footer")).toBe(u);
  });
  it("leaves non-sister URLs alone", () => {
    expect(withSisterUtm("https://nordvpn.com/", "footer")).toBe("https://nordvpn.com/");
    expect(isSisterSiteUrl("https://evil-pickly.blog.example.com/")).toBe(false);
    expect(isSisterSiteUrl("https://www.fxea365.com/ja")).toBe(true);
  });
});
