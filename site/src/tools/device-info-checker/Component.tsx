"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  platform: string;
  language: string;
  languages: string[];
  timezone: string;
  cookiesEnabled: boolean;
  online: boolean;
  doNotTrack: string;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  windowWidth: number;
  windowHeight: number;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;
  webgl: string;
  storageQuota: number | null;
  storageUsage: number | null;
  connection: { effectiveType: string; downlink: number; rtt: number } | null;
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
  pdfViewer: boolean;
  webdriver: boolean;
}

declare global {
  interface Navigator {
    deviceMemory?: number;
    connection?: { effectiveType: string; downlink: number; rtt: number };
    pdfViewerEnabled?: boolean;
  }
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/MSIE|Trident/.test(ua)) return "Internet Explorer";
  return "Unknown";
}

function detectOS(ua: string): string {
  if (/Windows NT 10\.0/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X (\d+[._]\d+)/.test(ua)) {
    const m = /Mac OS X (\d+[._]\d+(?:[._]\d+)?)/.exec(ua);
    return `macOS ${m ? m[1]!.replace(/_/g, ".") : ""}`;
  }
  if (/Mac/.test(ua)) return "macOS";
  if (/Android (\d+)/.test(ua)) {
    const m = /Android (\d+(?:\.\d+)?)/.exec(ua);
    return `Android ${m ? m[1] : ""}`;
  }
  if (/iPhone|iPad|iPod/.test(ua)) {
    const m = /OS (\d+[._]\d+)/.exec(ua);
    return `iOS/iPadOS ${m ? m[1]!.replace(/_/g, ".") : ""}`;
  }
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectWebGL(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "Not supported";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return String(renderer);
    }
    return gl.getParameter(gl.RENDERER) as string;
  } catch {
    return "Not available";
  }
}

export default function DeviceInfoChecker() {
  const t = useTranslations("tools.device-info-checker");
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function gather() {
      const ua = navigator.userAgent;
      let storageQuota: number | null = null;
      let storageUsage: number | null = null;
      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          storageQuota = est.quota ?? null;
          storageUsage = est.usage ?? null;
        }
      } catch {
        // ignore
      }
      setInfo({
        userAgent: ua,
        browser: detectBrowser(ua),
        os: detectOS(ua),
        platform: navigator.platform,
        language: navigator.language,
        languages: Array.from(navigator.languages),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        doNotTrack: navigator.doNotTrack ?? "(unset)",
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        screenAvailWidth: window.screen.availWidth,
        screenAvailHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
        deviceMemory: navigator.deviceMemory ?? null,
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
        webgl: detectWebGL(),
        storageQuota,
        storageUsage,
        connection: navigator.connection ? { effectiveType: navigator.connection.effectiveType, downlink: navigator.connection.downlink, rtt: navigator.connection.rtt } : null,
        prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        pdfViewer: navigator.pdfViewerEnabled ?? false,
        webdriver: navigator.webdriver ?? false,
      });
    }
    gather();
    const onResize = () => gather();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function fmtBytes(n: number | null): string {
    if (n == null) return t("notAvailable");
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(2)} ${units[i]}`;
  }

  async function copyAll() {
    if (!info) return;
    const text = JSON.stringify(info, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!info) {
    return <div className="text-sm text-slate-500">{t("loading")}</div>;
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-800">
      <dt className="flex-shrink-0 text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-right font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={copyAll} className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
          {copied ? t("copied") : t("copyJson")}
        </button>
      </div>

      <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-slate-500">{t("section.browser")}</h3>
      <dl>
        <Row label={t("field.browser")} value={info.browser} />
        <Row label={t("field.os")} value={info.os} />
        <Row label={t("field.platform")} value={info.platform} />
        <Row label={t("field.language")} value={info.language} />
        <Row label={t("field.languages")} value={info.languages.join(", ")} />
        <Row label={t("field.timezone")} value={info.timezone} />
        <Row label={t("field.cookiesEnabled")} value={info.cookiesEnabled ? "✓" : "✗"} />
        <Row label={t("field.online")} value={info.online ? "✓" : "✗"} />
        <Row label={t("field.doNotTrack")} value={info.doNotTrack} />
        <Row label={t("field.webdriver")} value={info.webdriver ? t("automation") : t("real")} />
      </dl>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">{t("section.display")}</h3>
      <dl>
        <Row label={t("field.screenSize")} value={`${info.screenWidth} × ${info.screenHeight}`} />
        <Row label={t("field.availSize")} value={`${info.screenAvailWidth} × ${info.screenAvailHeight}`} />
        <Row label={t("field.windowSize")} value={`${info.windowWidth} × ${info.windowHeight}`} />
        <Row label={t("field.colorDepth")} value={`${info.colorDepth} bit`} />
        <Row label={t("field.pixelRatio")} value={info.devicePixelRatio} />
        <Row label={t("field.darkMode")} value={info.prefersDarkMode ? "✓" : "✗"} />
        <Row label={t("field.reducedMotion")} value={info.prefersReducedMotion ? "✓" : "✗"} />
      </dl>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">{t("section.hardware")}</h3>
      <dl>
        <Row label={t("field.cpuCores")} value={info.hardwareConcurrency} />
        <Row label={t("field.deviceMemory")} value={info.deviceMemory != null ? `${info.deviceMemory} GB` : t("notAvailable")} />
        <Row label={t("field.touchPoints")} value={info.maxTouchPoints} />
        <Row label={t("field.gpu")} value={info.webgl} />
        <Row label={t("field.storageQuota")} value={fmtBytes(info.storageQuota)} />
        <Row label={t("field.storageUsage")} value={fmtBytes(info.storageUsage)} />
      </dl>

      {info.connection && (
        <>
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">{t("section.network")}</h3>
          <dl>
            <Row label={t("field.connectionType")} value={info.connection.effectiveType} />
            <Row label={t("field.downlink")} value={`${info.connection.downlink} Mbps`} />
            <Row label={t("field.rtt")} value={`${info.connection.rtt} ms`} />
          </dl>
        </>
      )}

      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">{t("section.userAgent")}</h3>
      <pre className="overflow-auto rounded bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">{info.userAgent}</pre>
    </div>
  );
}
