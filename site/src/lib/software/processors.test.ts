import { describe, expect, it } from "vitest";
import {cleanCsv,parseCsv,serializeCsv,formatJson,cleanTextLines} from "./processors";
import {isWithinBytes} from "./limits";
describe("software free processors",()=>{
 it("supports quoted comma, double-quote and multiline CSV",()=>{const csv='a,b\n"hello, world","a""b"\n"x\ny",z';expect(parseCsv(serializeCsv(parseCsv(csv)))).toEqual(parseCsv(csv));});
 it("keeps header and removes duplicate and empty CSV data rows",()=>expect(cleanCsv("a,b\n1,2\n1,2\n,\n3,4")).toBe("a,b\r\n1,2\r\n3,4"));
 it("rejects malformed CSV",()=>expect(()=>parseCsv('a,b\n"broken')).toThrow());
 it("formats JSON",()=>expect(formatJson('{"a":1}',false)).toBe('{\n  "a": 1\n}'));
 it("rejects invalid JSON",()=>expect(()=>formatJson("{",true)).toThrow());
 it("deduplicates text lines",()=>expect(cleanTextLines(" A \nB\nA\n\nC")).toBe("A\nB\nC"));
 it("counts UTF-8 bytes",()=>expect(isWithinBytes("あ",2)).toBe(false));
 it("does not alter quoted CSV cells containing newlines",()=>expect(cleanCsv('id,value\\n1,"line 1\\nline 2"\\n2,ok')).toBe('id,value\\r\\n1,"line 1\\nline 2"\\r\\n2,ok'));
 it("preserves quoted CSV fields containing commas",()=>expect(cleanCsv('id,value\\n1,"x,y"')).toBe('id,value\\r\\n1,"x,y"'));
 it("keeps JSON arrays intact",()=>expect(formatJson('[1,2,3]',true)).toBe("[1,2,3]"));
 it("trims CRLF and duplicates in text",()=>expect(cleanTextLines("first\\r\\nsecond\\r\\nfirst")).toBe("first\\nsecond"));
});
