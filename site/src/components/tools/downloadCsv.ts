/**
 * Client-side CSV download. Everything is generated in the browser —
 * no data leaves the device (privacy differentiation for finance tools).
 * Prepends a UTF-8 BOM so Excel opens localized headers correctly.
 */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]): void {
  const escapeCell = (v: string | number): string => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header, ...rows].map((r) => r.map(escapeCell).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
