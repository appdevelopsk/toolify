import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

/**
 * Keep public pages and Open Graph images crawlable while preventing crawler
 * traffic from hitting dynamic API endpoints such as price-search/release.
 * This is a crawl directive, not an access-control or noindex mechanism.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/", "/api/og"],
      disallow: ["/api/"],
    }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
