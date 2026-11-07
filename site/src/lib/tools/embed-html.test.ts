import { describe, expect, it } from "vitest";
import { buildToolEmbedSnippet, escapeHtml } from "./embed-html";

describe("safe tool embed HTML", () => {
  it("escapes all HTML-special characters in localized titles", () => {
    expect(escapeHtml(`A&B <"C"> 'D'`))
      .toBe("A&amp;B &lt;&quot;C&quot;&gt; &#39;D&#39;");
  });
  it("escapes attribute values without double-escaping titles", () => {
    const snippet = buildToolEmbedSnippet('A&B "Calculator"', 'https://toolify365.com/en/embed?a=1&b=2', 'https://toolify365.com/en/tools?a=1&b=2');
    expect(snippet).toContain('title="A&amp;B &quot;Calculator&quot;"');
    expect(snippet).toContain('src="https://toolify365.com/en/embed?a=1&amp;b=2"');
    expect(snippet).toContain('href="https://toolify365.com/en/tools?a=1&amp;b=2"');
    expect(snippet).toContain('>A&amp;B &quot;Calculator&quot;</a>');
  });
  it("cannot inject markup through title or a quoted attribute", () => {
    const snippet = buildToolEmbedSnippet('"><script>alert(1)</script>', 'https://toolify365.com/embed" onload="alert(1)', "https://toolify365.com/tool' onclick='evil()");
    expect(snippet).not.toContain('<script>');
    expect(snippet).not.toContain('src="https://toolify365.com/embed" onload=');
    expect(snippet).not.toContain("href=\"https://toolify365.com/tool' onclick=");
    expect(snippet).toContain('&lt;script&gt;');
  });
  it("blocks active schemes and relative embed URLs but permits HTTPS and local development", () => {
    for (const source of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "/relative/embed", "http://evil.example/iframe"]) {
      const snippet = buildToolEmbedSnippet("Safe", source, source);
      expect(snippet).toContain('src="about:blank"');
      expect(snippet).toContain('href="https://toolify365.com"');
      expect(snippet).not.toContain('src="javascript:');
      expect(snippet).not.toContain('href="javascript:');
    }
    expect(buildToolEmbedSnippet("Safe", "https://toolify365.com/en/embed", "https://toolify365.com/en/tools"))
      .toContain('src="https://toolify365.com/en/embed"');
    expect(buildToolEmbedSnippet("Safe", "http://localhost:3000/en/embed", "http://127.0.0.1:3000/en/tools"))
      .toContain('src="http://localhost:3000/en/embed"');
    for (const source of [
      "https://username:password@toolify365.com/en/embed",
      "https://username@toolify365.com/en/embed",
      "\nhttps://toolify365.com/en/embed",
      "https://toolify365.com/en/embed\t",
      " https://toolify365.com/en/embed",
    ]) {
      const snippet = buildToolEmbedSnippet("Safe", source, source);
      expect(snippet).toContain('src="about:blank"');
      expect(snippet).toContain('href="https://toolify365.com"');
    }
  });

});
