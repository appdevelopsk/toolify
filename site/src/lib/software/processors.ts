/** Quote-aware CSV parser; rejects malformed quotes instead of corrupting exports. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closedQuote = false;
  const source = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closedQuote = true; }
      } else { field += ch; }
    } else if (ch === '"' && field === "" && !closedQuote) { quoted = true; }
    else if (ch === "," || ch === "\n" || ch === "\r") {
      row.push(field); field = ""; closedQuote = false;
      if (ch === ",") continue;
      if (ch === "\r" && source[i + 1] === "\n") i++;
      rows.push(row); row = [];
    } else if (closedQuote || ch === '"') { throw new Error("Invalid CSV quoting"); }
    else { field += ch; }
  }
  if (quoted) throw new Error("Unclosed quoted CSV field");
  if (field !== "" || row.length > 0 || closedQuote) { row.push(field); rows.push(row); }
  return rows;
}
export function serializeCsv(rows: string[][]): string {
  return rows.map(row => row.map(cell => /[",\r\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell).join(",")).join("\r\n");
}
export function cleanCsv(input: string): string {
  const rows = parseCsv(input);
  if (!rows.length) return "";
  const width = rows[0].length;
  if (rows.some(row => row.length !== width)) throw new Error("CSV rows have different column counts");
  const seen = new Set<string>();
  const filtered = rows.filter((row, index) => {
    if (index === 0) return true;
    if (row.every(cell => cell.trim() === "")) return false;
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  return serializeCsv(filtered);
}
export function formatJson(input: string, minify: boolean): string {
  return JSON.stringify(JSON.parse(input), null, minify ? undefined : 2);
}
export function cleanTextLines(input: string): string {
  const seen = new Set<string>();
  return input.split(/\r?\n/).map(s => s.trim()).filter(s => {
    if (!s || seen.has(s)) return false;
    seen.add(s); return true;
  }).join("\n");
}
