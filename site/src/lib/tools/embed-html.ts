/** Escape text embedded into HTML markup, including quoted attributes. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

/** Keep snippet assembly isolated and testable outside React. */
export function buildToolEmbedSnippet(title: string, embedUrl: string, toolUrl: string): string {
  const safeTitle = escapeHtml(title);
  const safeEmbedUrl = escapeHtml(embedUrl);
  const safeToolUrl = escapeHtml(toolUrl);
  return `<iframe src="${safeEmbedUrl}" width="100%" height="520" style="border:1px solid #e2e8f0;border-radius:12px" loading="lazy" title="${safeTitle}"></iframe>\n<p style="font:13px/1.6 system-ui,-apple-system,sans-serif;text-align:center;margin:6px 0;color:#64748b">Free <a href="${safeToolUrl}" target="_blank" rel="noopener">${safeTitle}</a> by <a href="https://toolify365.com" target="_blank" rel="noopener">toolify365</a></p>`;
}
