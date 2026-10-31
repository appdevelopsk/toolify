export type SoftwareSlug = "csv-cleaner-pro" | "json-studio" | "text-batch-studio" | "pdf-toolkit-pro" | "bulk-image-studio" | "file-organizer-pro" | "excel-formula-ai" | "seo-audit-pro" | "website-monitor" | "invoice-maker-pro";
export type SoftwareProduct = {
  slug: SoftwareSlug;
  name: string;
  description: string;
  category: "Data" | "Documents" | "Images" | "Productivity" | "AI" | "Web";
  mode: "available" | "planned";
  free: string;
  pro: string;
  oneTimeEligible: boolean;
};
export const SOFTWARE_PRODUCTS: readonly SoftwareProduct[] = [
  {slug:"csv-cleaner-pro",name:"CSV Cleaner Pro",description:"Clean duplicate and empty CSV rows locally in your browser.",category:"Data",mode:"available",free:"Up to 1,000 rows per run",pro:"Larger batches and saved presets",oneTimeEligible:true},
  {slug:"json-studio",name:"JSON Studio",description:"Validate, format and minify JSON locally.",category:"Data",mode:"available",free:"Up to 100 KB per run",pro:"Large files and advanced validation",oneTimeEligible:true},
  {slug:"text-batch-studio",name:"Text Batch Studio",description:"Clean, deduplicate and transform text lines locally.",category:"Productivity",mode:"available",free:"Up to 5,000 lines per run",pro:"Larger batches and automation",oneTimeEligible:true},
  {slug:"pdf-toolkit-pro",name:"PDF Toolkit Pro",description:"Merge, split, compress and convert PDF documents.",category:"Documents",mode:"planned",free:"Basic processing with limits",pro:"Larger batches",oneTimeEligible:true},
  {slug:"bulk-image-studio",name:"Bulk Image Studio",description:"Resize, compress and convert image collections.",category:"Images",mode:"planned",free:"Small batches",pro:"Larger batches and presets",oneTimeEligible:true},
  {slug:"file-organizer-pro",name:"File Organizer Pro",description:"Organize folders with configurable rules.",category:"Productivity",mode:"planned",free:"Manual organization",pro:"Automatic schedules",oneTimeEligible:true},
  {slug:"excel-formula-ai",name:"Excel Formula AI",description:"Generate and explain spreadsheet formulas.",category:"AI",mode:"planned",free:"Limited AI requests",pro:"Larger AI allowance",oneTimeEligible:false},
  {slug:"seo-audit-pro",name:"SEO Audit Pro",description:"Check website SEO and track improvements.",category:"Web",mode:"planned",free:"Limited scans",pro:"Scheduled scans and history",oneTimeEligible:false},
  {slug:"website-monitor",name:"Website Monitor",description:"Monitor uptime and receive change notifications.",category:"Web",mode:"planned",free:"One monitored site",pro:"Multiple sites and notifications",oneTimeEligible:false},
  {slug:"invoice-maker-pro",name:"Invoice Maker Pro",description:"Manage invoices, quotes and exports.",category:"Documents",mode:"planned",free:"Basic invoice creation",pro:"Templates and recurring workflows",oneTimeEligible:false},
] as const;
export const AVAILABLE_SOFTWARE = SOFTWARE_PRODUCTS.filter(p => p.mode === "available");
export function findSoftware(slug: string) { return SOFTWARE_PRODUCTS.find(p => p.slug === slug); }
