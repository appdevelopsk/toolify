/**
 * Strict CSV field parser for the browser-only conversion tool.
 * The common RFC 4180 quoting rules are enforced instead of returning
 * plausible-looking but corrupted JSON on malformed CSV input.
 *
 * The delimiter selector also supports TSV, semicolon and pipe.
 */
export function parseCsv(text: string, delimiter: string): string[][] {
  if (![",", ";", "\t", "|"].includes(delimiter)) {
    throw new Error("Unsupported CSV delimiter");
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let state: "start" | "unquoted" | "quoted" | "afterQuote" = "start";

  const pushField = () => {
    row.push(field);
    field = "";
    state = "start";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (state === "quoted") {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          state = "afterQuote";
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === delimiter) {
      pushField();
      continue;
    }
    if (char === "\n" || char === "\r") {
      pushRow();
      if (char === "\r" && text[i + 1] === "\n") i++;
      continue;
    }

    if (char === '"') {
      if (state !== "start") {
        throw new Error("Unexpected quote inside an unquoted CSV field");
      }
      state = "quoted";
      continue;
    }
    if (state === "afterQuote") {
      throw new Error("Unexpected character after a closing CSV quote");
    }
    field += char;
    state = "unquoted";
  }

  if (state === "quoted") {
    throw new Error("Unclosed quoted CSV field");
  }
  if (field !== "" || row.length > 0 || state === "afterQuote") pushRow();

  // Preserve existing behavior for empty physical lines. In particular,
  // do not invent an extra data row for a trailing line break.
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

/** Duplicate / blank columns must fail, not silently overwrite values. */
export function assertUniqueHeaders(headers: string[]): void {
  const seen = new Set<string>();
  for (const name of headers) {
    if (!name.trim()) throw new Error("CSV header must not be empty");
    if (seen.has(name)) throw new Error("Duplicate CSV header: " + name);
    seen.add(name);
  }
}

/** Do not discard surplus cells or invent missing values when headers are used. */
export function assertRowWidth(row: string[], expected: number, line: number): void {
  if (row.length !== expected) {
    throw new Error("CSV row " + line + " has " + row.length + " fields; expected " + expected);
  }
}

/** Escape a cell before placing it in a delimited text export. */
export function escapeCsvField(value: unknown, delimiter: string): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
