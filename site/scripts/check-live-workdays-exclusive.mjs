#!/usr/bin/env node
/**
 * Public, read-only release proof for the new inclusive/exclusive Workdays UX.
 * Merging source files is not proof the content is actually served.
 * Usage: node scripts/check-live-workdays-exclusive.mjs [https://toolify365.com]
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TARGETS = [
  { locale:"en", label:"Exclude start and end dates", mode:"N workdays from a date", faq:"not always 2" },
  { locale:"ja", label:"開始日・終了日を除いて数える", mode:"○営業日後の日付", faq:"一律に2日" },
  { locale:"es", label:"Excluir fechas inicial y final", mode:"N días hábiles desde una fecha", faq:"no siempre 2" },
  { locale:"ar", label:"استبعاد تاريخي البداية والنهاية", mode:"N يوم عمل بعد تاريخ", faq:"ولا تطرح 2" },
];

export function attr(tag, name) {
  const match = [...tag.matchAll(/\b([A-Za-z_:][-A-Za-z0-9_:]*)\s*=\s*(["'])(.*?)\2/gs)]
    .find(m => m[1].toLowerCase() === name.toLowerCase());
  return match?.[3] ?? "";
}

export function visibleText(html) {
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")
    .replace(/<!--[\s\S]*?-->/g,"")
    .match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
  return text.replace(/<[^>]+>/g," ")
    .replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">")
    .replace(/&quot;/gi,'"').replace(/&#(?:39|x27);/gi,"'")
    .replace(/\s+/g," ").trim();
}

export function inspectWorkdaysHtml(html, item, origin="https://toolify365.com") {
  const errors = [];
  const path = "/" + item.locale + "/tools/workdays-calculator";
  const body = visibleText(html);
  if (!body) errors.push("VISIBLE_BODY_MISSING");
  for (const [code,phrase] of [
    ["NEW_CHECKBOX_NOT_VISIBLE",item.label],
    ["EXISTING_ADD_MODE_NOT_VISIBLE",item.mode],
    ["CORRECTED_BOUNDARY_FAQ_NOT_VISIBLE",item.faq],
  ]) if (!body.includes(phrase)) errors.push(code);
  const htmlTag=html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  if (attr(htmlTag,"lang").toLowerCase()!==item.locale.toLowerCase()) errors.push("WRONG_HTML_LANG");
  const canonicalTags=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).filter(tag=>attr(tag,"rel").toLowerCase()==="canonical");
  const canonical = attr(canonicalTags[0]??"","href");
  try {
    const value = new URL(canonical,origin);
    if (canonicalTags.length!==1 || value.origin!==origin || value.pathname.replace(/\/$/,"")!==path)
      errors.push("WRONG_CANONICAL");
  } catch { errors.push("INVALID_CANONICAL"); }
  const title=[...html.matchAll(/<title\b[^>]*>[\s\S]*?<\/title>/gi)];
  if (title.length!==1) errors.push("TITLE_MISSING_OR_DUPLICATE");
  if (item.locale==="en" || item.locale==="ja") {
    const robots=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).filter(tag=>attr(tag,"name").toLowerCase()==="robots");
    if (robots.some(tag=>/(?:^|[,;\s])noindex(?:$|[,;\s])/i.test(attr(tag,"content"))))
      errors.push("INDEXABLE_LOCALE_UNEXPECTED_NOINDEX");
  }
  return {ok:errors.length===0,errors,canonical};
}

export async function run(url=process.argv[2]||"https://toolify365.com") {
  const root=new URL(url);
  if (root.pathname!=="/" || root.search || root.hash || root.username || root.password) throw Error("Origin only");
  if (root.hostname!=="toolify365.com" && root.hostname!=="localhost") throw Error("Unexpected host");
  if(root.protocol!=="https:" && root.hostname!=="localhost") throw Error("HTTPS is required");
  const results=[];
  for(const item of TARGETS){
    const path="/" + item.locale + "/tools/workdays-calculator",url=root.origin+path;
    try{
      const response=await fetch(url,{redirect:"follow",headers:{"Cache-Control":"no-cache","User-Agent":"Toolify365WorkdayReleaseVerifier/1.0","Accept-Language":item.locale},signal:AbortSignal.timeout(16000)});
      if(!response.ok)throw Error("HTTP "+response.status);
      const actual=new URL(response.url);
      if(actual.origin!==root.origin || actual.pathname.replace(/\/$/,"")!==path)throw Error("UNEXPECTED_REDIRECT: "+response.url);
      const proof=inspectWorkdaysHtml(await response.text(),item,root.origin);
      results.push({url,status:response.status,...proof});
    }catch(e){results.push({url,ok:false,errors:[e.message||String(e)]});}
  }
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),kind:"read_only_public_release_proof",results},null,2));
  if(results.some(x=>!x.ok))process.exitCode=1;
  return results;
}
if (process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) run().catch(e=>{console.error(e);process.exitCode=1;});
