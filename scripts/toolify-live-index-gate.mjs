#!/usr/bin/env node
/**
 * Read-only exact live indexability diagnosis for the fixed 12 URL cohort
 * Google URL Inspection inspected on 2026-10-26.
 * It NEVER submits URLs to Google, updates robots, or touches credentials.
 * Google cached 4 noindex statuses from July; the source's October policy
 * intends all 12 to be indexable. Verify what is really PUBLIC today.
 */
export const targets = [
  ["en", "workdays-calculator", "core"],
  ["en", "date-calculator", "core"],
  ["en", "pressure-converter", "core"],
  ["en", "unit-price-calculator", "core"],
  ["ja", "workdays-calculator", "core"],
  ["ja", "pressure-converter", "core"],
  ["th", "date-calculator", "exception"],
  ["ru", "pressure-converter", "exception"],
  ["tr", "grade-calculator", "exception"],
  ["ar", "length-converter", "exception"],
  ["fr", "speed-converter", "exception"],
  ["es", "due-date-calculator", "exception"],
];
export const base="https://toolify365.com";
export const urlFor=([loc,slug])=>base+"/"+loc+"/tools/"+slug;
export function attr(tag,name){
  const m=tag.match(new RegExp("\\b"+name+"\\s*=\\s*([\"'])(.*?)\\1","i"));
  if(m)return m[2];
  const loose=tag.match(new RegExp("\\b"+name+"\\s*=\\s*([^\\s>]+)","i"));
  return loose?.[1]??null;
}
export function inspectHTML(html,headers,url,status,finalUrl){
  const head=html.split(/<\/head>/i)[0]??"";
  const metaTags=[...head.matchAll(/<meta\b[^>]*>/gi)].map(x=>x[0]);
  const robotsMeta=metaTags.filter(t=>["robots","googlebot"].includes((attr(t,"name")??"").toLowerCase()))
    .map(t=>attr(t,"content")??"").join(",");
  const xRobots=headers?.get?.("x-robots-tag")??null;
  const tags=[...head.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]);
  const canonicals=tags.filter(t=>(attr(t,"rel")??"").toLowerCase().split(/\s+/).includes("canonical"))
    .map(t=>attr(t,"href"));
  const noindex=/(^|[\s,;])noindex($|[\s,;])/i.test(robotsMeta+","+String(xRobots??""));
  const canonical=canonicals[0]??null;
  return {url,httpStatus:status,finalUrl,canonical,canonicalCount:canonicals.length,
    robotsMeta,xRobots,noindex,pass:status===200&&finalUrl===url&&canonicals.length===1&&
    canonical===url&&!noindex&&/<title\b[^>]*>[^<]+<\/title>/i.test(head)};
}
export async function main(){
 const results=await Promise.all(targets.map(async t=>{
   const url=urlFor(t);
   try {
     const r=await fetch(url,{redirect:"follow",
       headers:{"Cache-Control":"no-cache","Pragma":"no-cache","User-Agent":"ToolifyIndexSmoke/1.0"},
       signal:AbortSignal.timeout(20000)});
     return {...inspectHTML(await r.text(),r.headers,url,r.status,r.url),locale:t[0],slug:t[1],indexIntent:t[2]};
   }catch(e){return {url,locale:t[0],slug:t[1],indexIntent:t[2],pass:false,error:String(e.message??e)};}
 }));
 const bad=results.filter(r=>!r.pass);
 const summary={checked:results.length,liveIndexable:results.length-bad.length,problems:bad.length,
   note:"Source intended indexability and live HTML are distinct from Google's cached index verdict. All 12 URL Inspection rows are a selected test cohort, not the whole site.",
   checkedAtUtc:new Date().toISOString(),results};
 console.log(JSON.stringify(summary,null,2));
 if (process.env.GITHUB_STEP_SUMMARY) {
   const {appendFileSync}=await import("node:fs");
   appendFileSync(process.env.GITHUB_STEP_SUMMARY,
     "## Toolify 12URL live indexability\n\n"+
     "- Pass: "+(results.length-bad.length)+"/12\n"+
     "- Live failures: "+bad.length+"\n\n"+
     "| URL | HTTP | canonical | noindex | Result |\n|---|---|---|---|---|\n"+
     results.map(x=>"| "+x.url+" | "+(x.httpStatus??"ERROR")+" | "+(x.canonical??"missing")+
       " | "+(x.noindex??"unknown")+" | "+(x.pass?"PASS":"FAIL")+" |").join("\n")+"\n");
 }
 if(bad.length)process.exitCode=1;
}
if(process.argv[1]?.endsWith("toolify-live-index-gate.mjs"))
  main().catch(e=>{console.error(e);process.exitCode=2});
