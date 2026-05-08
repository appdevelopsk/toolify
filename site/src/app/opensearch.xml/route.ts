import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

// OpenSearch descriptor — signals to browsers/crawlers that this site is search-enabled.
// Helps with Chrome/Firefox "Add as search engine" UI and is a small ranking signal.
export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteConfig.name}</ShortName>
  <Description>Free browser-based calculators and converters in 6 languages.</Description>
  <Tags>calculator converter tools</Tags>
  <InputEncoding>UTF-8</InputEncoding>
  <Image height="32" width="32" type="image/png">${siteConfig.url}/icon.png</Image>
  <Url type="text/html" template="${siteConfig.url}/en/tools?q={searchTerms}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${siteConfig.url}/opensearch.xml"/>
  <moz:SearchForm xmlns:moz="http://www.mozilla.org/2006/browser/search/">${siteConfig.url}/en/tools</moz:SearchForm>
</OpenSearchDescription>`;

  return new Response(xml, {
    headers: {
      "cache-control": "public, max-age=86400, s-maxage=604800",
      "content-type": "application/opensearchdescription+xml; charset=utf-8",
    },
  });
}
