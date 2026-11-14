import test from "node:test";
import assert from "node:assert/strict";
import { TARGETS, inspectWorkdaysHtml, visibleText } from "./check-live-workdays-exclusive.mjs";

const fixture = item => '<!doctype html><html lang="'+item.locale+'"><head>'+
  '<title>Workdays Calculator | Toolify365</title>'+
  '<link href="https://toolify365.com/'+item.locale+'/tools/workdays-calculator" rel="canonical"></head>'+
  '<body><main><button>'+item.mode+'</button><label><input type="checkbox"><span>'+item.label+'</span></label>'+
  '<details><summary>FAQ</summary><p>'+item.faq+'</p></details></main></body></html>';

test("only four representative locales checked, index policy remains locale scoped",()=>{
  assert.deepEqual(TARGETS.map(x=>x.locale),["en","ja","es","ar"]);
  assert.equal(new Set(TARGETS.map(x=>x.locale)).size,4);
});
for(const item of TARGETS) {
 test(item.locale+": rendered and canonical page accepted",()=>assert.equal(inspectWorkdaysHtml(fixture(item),item).ok,true));
 test(item.locale+": stale FAQ or absent checkbox rejected",()=>{
    const x=fixture(item);
    assert.ok(inspectWorkdaysHtml(x.replace(item.faq,"old inaccurate advice"),item).errors.includes("CORRECTED_BOUNDARY_FAQ_NOT_VISIBLE"));
    assert.ok(inspectWorkdaysHtml(x.replace(item.label,"missing label"),item).errors.includes("NEW_CHECKBOX_NOT_VISIBLE"));
    assert.ok(inspectWorkdaysHtml(x.replace('<input type="checkbox">',''),item).errors.includes("CHECKBOX_CONTROL_NOT_RENDERED"));
    assert.ok(inspectWorkdaysHtml(x.replace('rel="canonical"','rel="alternate"'),item).errors.includes("WRONG_CANONICAL"));
    assert.ok(inspectWorkdaysHtml(x.replace('lang="'+item.locale+'"','lang="other"'),item).errors.includes("WRONG_HTML_LANG"));
 });
}
test("script and style contents cannot spoof visible checkbox/FAQ",()=>{
  const item=TARGETS[0],x=fixture(item);
  const bad=x.replace('<span>'+item.label+'</span>','<span>old state</span>')
    .replace('<p>'+item.faq+'</p>','<p>wrong FAQ</p>')
    .replace('</body>','<script>'+item.label+item.faq+'</script><style>'+item.label+'</style></body>');
  assert.ok(!visibleText(bad).includes(item.label));
  assert.ok(inspectWorkdaysHtml(bad,item).errors.includes("NEW_CHECKBOX_NOT_VISIBLE"));
  assert.ok(inspectWorkdaysHtml(bad,item).errors.includes("CORRECTED_BOUNDARY_FAQ_NOT_VISIBLE"));
});
test("noindex cannot pass for an index-eligible core locale",()=>{
 const item=TARGETS[0],html=fixture(item).replace('</head>','<meta name="robots" content="noindex,follow"></head>');
 assert.ok(inspectWorkdaysHtml(html,item).errors.includes("INDEXABLE_LOCALE_UNEXPECTED_NOINDEX"));
});
