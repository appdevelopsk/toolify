import { siteConfig } from "@/lib/config";
import { AdSlot } from "./AdSlot";

export function AdBanner({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={siteConfig.adsense.slots.banner}
      format="auto"
      className={`mx-auto w-full max-w-3xl ${className ?? ""}`}
      style={{ minHeight: 100 }}
    />
  );
}

export function AdInArticle({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={siteConfig.adsense.slots.inArticle}
      format="fluid"
      layout="in-article"
      className={`my-8 ${className ?? ""}`}
      lazy
    />
  );
}

export function AdBelowResult({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={siteConfig.adsense.slots.belowResult}
      format="auto"
      className={`mt-6 ${className ?? ""}`}
      style={{ minHeight: 280 }}
    />
  );
}

export function AdSticky({ className }: { className?: string }) {
  return (
    <div className={`hidden lg:block ${className ?? ""}`}>
      <div className="sticky top-24">
        <AdSlot slot={siteConfig.adsense.slots.sticky} format="vertical" lazy style={{ minHeight: 600 }} />
      </div>
    </div>
  );
}
