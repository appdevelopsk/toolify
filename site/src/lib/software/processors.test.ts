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
});
