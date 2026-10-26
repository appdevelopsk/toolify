import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {targets,urlFor,inspectHTML} from "../toolify-live-index-gate.mjs";

const source=readFileSync(fileURLToPath(new URL("../../site/src/lib/tools/registry.ts",import.meta.url)),"utf8");
function sourceBlock(start,end) {
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"registry source declarations absent");
  return source.slice(a,b);
}
test("12 nonduplicated source-indexable official-inspection URLs",()=>{
 assert.equal(targets.length,12);
 assert.equal(new Set(targets.map(urlFor)).size,12);
 const core=sourceBlock("export const CORE_TOOLS_BY_DEMAND =","] as const;");
 const exceptions=sourceBlock("export const INDEX_EXCEPTIONS:", "\n};");
 for(const [loc,slug,type] of targets) {
   if(type==="core") assert.ok(core.includes('"'+slug+'"'),loc+"/"+slug+" missing core");
   else assert.ok(new RegExp("\\b"+loc+":\\s*\\[[^\\]]*\\\""+slug+"\\\"").test(exceptions),
     loc+"/"+slug+" missing locale exception");
 }
});
test("existing old Google noindex status must not override valid current HTTP+canonical",()=>{
 const url=urlFor(targets[6]);
 const html='<html><head><title>Date Calculator</title><link rel="canonical" href="'+url+
   '"><meta name="robots" content="index, follow"></head><body>Tool</body></html>';
 assert.equal(inspectHTML(html,{get:()=>null},url,200,url).pass,true);
});
test("reject noindex, missing canonical, bad HTTP and redirect",()=>{
 const url=urlFor(targets[0]);
 const html='<html><head><title>Workdays</title><link href="'+url+'" rel="canonical"></head></html>';
 assert.ok(inspectHTML(html,{get:()=>null},url,200,url).pass);
 assert.ok(!inspectHTML(html.replace('</head>','<meta content="noindex, follow" name="googlebot"></head>'),{get:()=>null},url,200,url).pass);
 assert.ok(!inspectHTML(html,{get:()=> "noindex"},url,200,url).pass);
 assert.ok(!inspectHTML(html,{get:()=>null},url,404,url).pass);
 assert.ok(!inspectHTML(html,{get:()=>null},url,200,url+"/").pass);
});
