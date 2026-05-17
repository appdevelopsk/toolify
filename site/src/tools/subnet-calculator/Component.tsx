"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (!Number.isInteger(v) || v < 0 || v > 255 || String(v) !== p) return null;
    n = (n * 256) + v;
  }
  return n >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function maskFromCidr(cidr: number): number {
  if (cidr === 0) return 0;
  return ((-1 << (32 - cidr)) >>> 0);
}

interface SubnetResult {
  ipDec: string;
  ipBin: string;
  cidr: number;
  mask: string;
  network: string;
  broadcast: string;
  hostMin: string;
  hostMax: string;
  totalHosts: number;
  usableHosts: number;
  wildcard: string;
  ipClass: string;
  isPrivate: boolean;
}

function classOf(ip: number): string {
  const first = (ip >>> 24) & 255;
  if (first <= 127) return "A";
  if (first <= 191) return "B";
  if (first <= 223) return "C";
  if (first <= 239) return "D (multicast)";
  return "E (reserved)";
}

function isPrivateIp(ip: number): boolean {
  const first = (ip >>> 24) & 255;
  const second = (ip >>> 16) & 255;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

function ipToBin(ip: number): string {
  return [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255]
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(".");
}

export default function SubnetCalculator() {
  const t = useTranslations("tools.subnet-calculator");
  const [input, setInput] = useState("192.168.1.10/24");

  const result = useMemo<SubnetResult | null>(() => {
    const trimmed = input.trim();
    let ipStr = trimmed;
    let cidrStr: string | null = null;
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      ipStr = parts[0]!.trim();
      cidrStr = parts[1]!.trim();
    }
    const ipInt = ipToInt(ipStr);
    if (ipInt === null) return null;
    const cidr = cidrStr === null ? 24 : parseInt(cidrStr, 10);
    if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) return null;
    const mask = maskFromCidr(cidr);
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : 2 ** (32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;
    const hostMin = cidr >= 31 ? network : network + 1;
    const hostMax = cidr >= 31 ? broadcast : broadcast - 1;
    return {
      ipDec: intToIp(ipInt),
      ipBin: ipToBin(ipInt),
      cidr,
      mask: intToIp(mask),
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      hostMin: intToIp(hostMin >>> 0),
      hostMax: intToIp(hostMax >>> 0),
      totalHosts,
      usableHosts,
      wildcard: intToIp((~mask) >>> 0),
      ipClass: classOf(ipInt),
      isPrivate: isPrivateIp(ipInt),
    };
  }, [input]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.cidr")}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="192.168.1.10/24"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg dark:border-slate-700 dark:bg-slate-900"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.hint")}</span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "192.168.1.0/24", "10.0.0.5/30"].map((v) => (
          <button key={v} onClick={() => setInput(v)} className="rounded border border-slate-300 px-3 py-1 text-xs font-mono hover:border-brand-500 dark:border-slate-700">
            {v}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium">{t("result.network")}</div>
                <div className="font-mono text-lg font-bold">{result.network}/{result.cidr}</div>
              </div>
              <div className="rounded bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="text-xs font-medium">{t("result.usableHosts")}</div>
                <div className="font-mono text-lg font-bold tabular-nums">{result.usableHosts.toLocaleString()}</div>
              </div>
            </div>
            <dl className="mt-4 grid gap-1 font-mono text-sm">
              <Row label={t("result.ip")} value={result.ipDec} />
              <Row label={t("result.netmask")} value={`${result.mask} (/${result.cidr})`} />
              <Row label={t("result.wildcard")} value={result.wildcard} />
              <Row label={t("result.networkAddr")} value={result.network} />
              <Row label={t("result.broadcast")} value={result.broadcast} />
              <Row label={t("result.hostMin")} value={result.hostMin} />
              <Row label={t("result.hostMax")} value={result.hostMax} />
              <Row label={t("result.totalAddresses")} value={result.totalHosts.toLocaleString()} />
              <Row label={t("result.ipClass")} value={result.ipClass} />
              <Row label={t("result.private")} value={result.isPrivate ? "✓" : "✗"} />
            </dl>
            <div className="mt-3">
              <div className="text-xs font-medium">{t("result.binary")}</div>
              <code className="mt-1 block rounded bg-slate-100 p-2 font-mono text-xs dark:bg-slate-800">{result.ipBin}</code>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-1 dark:border-slate-800">
      <dt className="font-sans text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
