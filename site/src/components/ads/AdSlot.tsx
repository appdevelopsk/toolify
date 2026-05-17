"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

interface AdSlotProps {
  /** AdSenseの広告ユニットID */
  slot: string;
  /** "auto" でレスポンシブ、明示的なスタイルが必要なら format="" + style指定 */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  layout?: string;
  layoutKey?: string;
  fullWidthResponsive?: boolean;
  /** Lazy load（fold下で使用） */
  lazy?: boolean;
  /** ラベル（"広告"表示） */
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSlot({
  slot,
  format = "auto",
  layout,
  layoutKey,
  fullWidthResponsive = true,
  lazy = false,
  showLabel = true,
  className,
  style,
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!siteConfig.adsense.client || !slot) return;
    if (pushed.current) return;
    if (lazy) {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              push();
              io.disconnect();
              break;
            }
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(el);
      return () => io.disconnect();
    }
    push();
    function push() {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* AdSense not loaded yet — will retry on next mount */
      }
    }
  }, [slot, lazy]);

  if (!siteConfig.adsense.client || !slot) {
    // In production with no slot configured, render nothing (clean look pre-AdSense approval).
    // In dev, show a labeled placeholder so layout work is visible.
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`flex min-h-[100px] items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400 ${className ?? ""}`}
        style={style}
        aria-hidden
      >
        Ad placeholder
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {showLabel && (
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">Advertisement</div>
      )}
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block", ...style }}
        data-ad-client={siteConfig.adsense.client}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
