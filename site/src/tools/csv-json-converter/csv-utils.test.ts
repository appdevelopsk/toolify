import { describe, expect, it } from "vitest";
import { assertRowWidth, assertUniqueHeaders, escapeCsvField, parseCsv } from "./csv-utils";

describe("CSV import integrity", () => {
  it("parses the default sample and CRLF rows", () => {
    expect(parseCsv("name,age\r\nAlice,30\r\nBob,25\r\n", ",")).toEqual([
      ["name", "age"], ["Alice", "30"], ["Bob", "25"],
    ]);
  });

  it("supports RFC 4180 quoted commas, doubled quotes and multiline fields", () => {
    expect(parseCsv('name,note\r\n"Doe, Jane","line 1\r\nline 2"\r\n"Sam","say ""hello"""', ",")).toEqual([
      ["name", "note"], ["Doe, Jane", "line 1\r\nline 2"], ["Sam", 'say "hello"'],
    ]);
  });

  it("supports the advertised alternative delimiters", () => {
    expect(parseCsv("a;b\n1;2", ";")).toEqual([["a", "b"], ["1", "2"]]);
    expect(parseCsv("a\tb\n1\t2", "\t")).toEqual([["a", "b"], ["1", "2"]]);
    expect(parseCsv("a|b\n1|2", "|")).toEqual([["a", "b"], ["1", "2"]]);
    expect(() => parseCsv("a:b", ":")).toThrow(/Unsupported/);
  });

  it("rejects CSV that would otherwise silently become incorrect JSON", () => {
    expect(() => parseCsv('a,b\n"unfinished', ",")).toThrow(/Unclosed/);
    expect(() => parseCsv('a,b\nx"y",z', ",")).toThrow(/Unexpected quote/);
    expect(() => parseCsv('a,b\n"x"oops,z', ",")).toThrow(/after a closing/);
  });

  it("rejects empty or repeated headers before data can be overwritten", () => {
    expect(() => assertUniqueHeaders(["name", "name"])).toThrow(/Duplicate/);
    expect(() => assertUniqueHeaders(["name", " "])).toThrow(/empty/);
    expect(() => assertUniqueHeaders(["__proto__", "name"])).not.toThrow();
  });

  it("rejects ragged rows before losing or inventing data", () => {
    expect(() => assertRowWidth(["Alice", "30"], 2, 2)).not.toThrow();
    expect(() => assertRowWidth(["Bob", "25", "extra"], 2, 3)).toThrow(/CSV row 3 has 3 fields; expected 2/);
    expect(() => assertRowWidth(["Carol"], 2, 4)).toThrow(/CSV row 4 has 1 fields; expected 2/);
  });

  it("exports quoted cells safely as CSV text", () => {
    expect(escapeCsvField('say "hi", now', ",")).toBe('"say ""hi"", now"');
    expect(escapeCsvField("line1\nline2", ",")).toBe('"line1\nline2"');
  });
});
