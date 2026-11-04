import { describe, expect, it } from "vitest";
import {cleanCsv,parseCsv,serializeCsv,formatJson,cleanTextLines,prepareSoftwareDownload} from "./processors";
import {isWithinBytes, isWithinSoftwareLimits} from "./limits";
import {softwareCopy} from "./copy";
describe("software free processors",()=>{
 it("provides a local file upload label for all 17 software locales", () => {
   const locales = ["en","ja","de","fr","es","it","pt-BR","ko","zh-CN","zh-TW","ru","ar","hi","id","th","vi","tr"];
   expect(locales).toHaveLength(17);
   for (const locale of locales) {
     expect(softwareCopy(locale).upload.trim().length).toBeGreaterThan(0);
   }
   expect(softwareCopy("ja").upload).toBe("端末のファイルを選択");
 });

 it("supports quoted comma, double-quote and multiline CSV",()=>{const csv='a,b\n"hello, world","a""b"\n"x\ny",z';expect(parseCsv(serializeCsv(parseCsv(csv)))).toEqual(parseCsv(csv));});
 it("keeps header and removes duplicate and empty CSV data rows",()=>expect(cleanCsv("a,b\n1,2\n1,2\n,\n3,4")).toBe("a,b\r\n1,2\r\n3,4"));
 it("rejects malformed CSV",()=>expect(()=>parseCsv('a,b\n"broken')).toThrow());
 it("formats JSON",()=>expect(formatJson('{"a":1}',false)).toBe('{\n  "a": 1\n}'));
 it("rejects invalid JSON",()=>expect(()=>formatJson("{",true)).toThrow());
 it("deduplicates text lines",()=>expect(cleanTextLines(" A \nB\nA\n\nC")).toBe("A\nB\nC"));
 it("handles legacy CR-only and mixed newline styles without losing or merging lines", () => {
   expect(cleanTextLines(" A\rB\rA\r\nC\nB")).toBe("A\nB\nC");
 });
 it("enforces the 5000-line limit for CR-only and mixed newline inputs", () => {
   expect(isWithinSoftwareLimits("text-batch-studio", Array(5000).fill("a").join("\r"))).toBe(true);
   expect(isWithinSoftwareLimits("text-batch-studio", Array(5001).fill("a").join("\r"))).toBe(false);
   expect(isWithinSoftwareLimits("text-batch-studio", Array(5001).fill("a").join("\r\n"))).toBe(false);
 });
 it("counts UTF-8 bytes",()=>expect(isWithinBytes("あ",2)).toBe(false));
 it("does not alter quoted CSV cells containing newlines",()=>expect(cleanCsv('id,value\n1,"line 1\nline 2"\n2,ok')).toBe('id,value\r\n1,"line 1\nline 2"\r\n2,ok'));
 it("preserves quoted CSV fields containing commas",()=>expect(cleanCsv('id,value\n1,"x,y"')).toBe('id,value\r\n1,"x,y"'));
 it("keeps JSON arrays intact",()=>expect(formatJson('[1,2,3]',true)).toBe("[1,2,3]"));
 it("trims CRLF and duplicates in text",()=>expect(cleanTextLines("first\r\nsecond\r\nfirst")).toBe("first\nsecond"));
 it("counts quoted newlines as one CSV record instead of physical lines", () => {
   const csv = 'id,value\n1,"' + Array.from({ length: 1100 }, (_, i) => String(i)).join("\n") + '"';
   expect(isWithinSoftwareLimits("csv-cleaner-pro", csv)).toBe(true);
   expect(cleanCsv(csv)).toContain('"0\n1');
 });
 it("accepts exactly 1000 CSV records and rejects record 1001", () => {
   const records = ["id,value", ...Array.from({ length: 999 }, (_, i) => `${i},ok`)];
   expect(isWithinSoftwareLimits("csv-cleaner-pro", records.join("\n"))).toBe(true);
   expect(isWithinSoftwareLimits("csv-cleaner-pro", [...records, "1000,extra"].join("\n"))).toBe(false);
 });
 it("prefixes international CSV downloads with exactly one UTF-8 BOM", () => {
   const csv = cleanCsv("name,city\n山田,東京");
   const downloaded = prepareSoftwareDownload(csv, "csv");
   expect(downloaded).toBe("\uFEFF" + csv);
   expect(prepareSoftwareDownload(downloaded, "csv")).toBe(downloaded);
   expect(new TextEncoder().encode(downloaded).slice(0, 3)).toEqual(new Uint8Array([0xef, 0xbb, 0xbf]));
 });
 it("does not alter JSON or plain text downloads", () => {
   expect(prepareSoftwareDownload('{"name":"東京"}', "json")).toBe('{"name":"東京"}');
   expect(prepareSoftwareDownload("あ\nい", "txt")).toBe("あ\nい");
 });
 it("enforces text line and JSON byte limits", () => {
   expect(isWithinSoftwareLimits("text-batch-studio", Array(5000).fill("a").join("\n"))).toBe(true);
   expect(isWithinSoftwareLimits("text-batch-studio", Array(5001).fill("a").join("\n"))).toBe(false);
   expect(isWithinSoftwareLimits("json-studio", "x".repeat(100001))).toBe(false);
 });

});
