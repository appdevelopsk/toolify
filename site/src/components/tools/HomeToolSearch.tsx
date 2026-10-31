"use client";
import { useMemo, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
type ToolIndexItem = {slug:string;title:string;description:string;category:string};
const labels: Record<string,[string,string,string,string]> = {
 en:["Search tools by name or task","Try PDF, image, percentage, JSON…","No matching tools. Try another keyword.","Clear search"],
 ja:["ツール名や用途で検索","PDF、画像、パーセント、JSONなど","一致するツールがありません。別のキーワードをお試しください。","検索を消去"],
 "zh-CN":["搜索工具或用途","搜索 PDF、图像、百分比、JSON…","未找到匹配工具。","清除搜索"],
 "zh-TW":["搜尋工具或用途","搜尋 PDF、圖片、百分比、JSON…","找不到符合的工具。","清除搜尋"],
 ko:["도구 및 기능 검색","PDF, 이미지, 퍼센트, JSON 검색…","일치하는 도구가 없습니다.","검색 지우기"],
 es:["Buscar herramientas","PDF, imagen, porcentajes, JSON…","No se encontraron herramientas.","Borrar búsqueda"],
 "pt-BR":["Buscar ferramentas","PDF, imagem, porcentagem, JSON…","Nenhuma ferramenta encontrada.","Limpar busca"],
 fr:["Rechercher un outil","PDF, image, pourcentage, JSON…","Aucun outil trouvé.","Effacer"],
 de:["Tools durchsuchen","PDF, Bilder, Prozent, JSON…","Keine passenden Tools gefunden.","Suche löschen"],
 it:["Cerca strumenti","PDF, immagini, percentuali, JSON…","Nessuno strumento trovato.","Cancella"],
 ru:["Поиск инструментов","PDF, изображение, проценты, JSON…","Ничего не найдено.","Очистить"],
 ar:["البحث عن الأدوات","PDF، الصور، النسب، JSON…","لم يتم العثور على أدوات.","مسح"],
 hi:["टूल खोजें","PDF, इमेज, प्रतिशत, JSON…","कोई टूल नहीं मिला।","खोज साफ़ करें"],
 id:["Cari alat","PDF, gambar, persentase, JSON…","Tidak ada alat yang cocok.","Hapus pencarian"],
 th:["ค้นหาเครื่องมือ","PDF, รูปภาพ, เปอร์เซ็นต์, JSON…","ไม่พบเครื่องมือ","ล้างการค้นหา"],
 vi:["Tìm công cụ","PDF, ảnh, phần trăm, JSON…","Không tìm thấy công cụ.","Xóa tìm kiếm"],
 tr:["Araçları ara","PDF, görsel, yüzde, JSON…","Eşleşen araç bulunamadı.","Aramayı temizle"],
};
function normalized(v:string) {return v.normalize("NFKD").toLocaleLowerCase().replace(/[\u0300-\u036f]/g,"").trim();}
export function HomeToolSearch({items,locale}:{items:ToolIndexItem[];locale:string}) {
 const [query,setQuery]=useState("");
 const [expanded,setExpanded]=useState(false);
 const l=labels[locale] ?? labels.en;
 const matches=useMemo(()=>{
  const q=normalized(query);
  if(!q) return [];
  return items.filter(item=>normalized(item.title+" "+item.description+" "+item.category+" "+item.slug.replace(/-/g," ")).includes(q)).slice(0,8);
 },[items,query]);
 return <div role="search" className="mx-auto mt-8 max-w-2xl text-start">
  <label htmlFor="home-tool-search" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">{l[0]}</label>
  <div className="relative">
   <span aria-hidden className="pointer-events-none absolute left-4 top-3.5 text-xl text-slate-400">⌕</span>
   <input id="home-tool-search" type="search" autoComplete="off" value={query} onFocus={()=>setExpanded(true)} onChange={e=>{setQuery(e.target.value);setExpanded(true)}} onKeyDown={e=>{if(e.key==="Escape"){setQuery("");setExpanded(false)}}} placeholder={l[1]} className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-5 text-base text-slate-900 shadow-lg shadow-slate-900/5 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"/>
  </div>
  {expanded && query.trim() && <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
   {matches.length ? <ul aria-label={l[0]}>{matches.map(item=><li key={item.slug} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
    <Link href={`/tools/${item.slug}`} prefetch={false} className="block px-4 py-3 transition hover:bg-brand-50 focus:bg-brand-50 focus:outline-none dark:hover:bg-slate-800 dark:focus:bg-slate-800"><span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</span><span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</span></Link>
   </li>)}</ul> : <p role="status" className="px-4 py-4 text-sm text-slate-500">{l[2]}</p>}
   <button type="button" onClick={()=>{setQuery("");setExpanded(false)}} className="w-full border-t border-slate-100 px-4 py-2 text-right text-xs text-brand-700 hover:bg-slate-50 dark:border-slate-700 dark:text-brand-400 dark:hover:bg-slate-800">{l[3]}</button>
  </div>}
 </div>;
}
