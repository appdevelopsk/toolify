import { loadHistory, loadRevenue, type HistoryBusiness, type RevenueSource } from "./revenue";

export const dynamic = "force-dynamic";

type BizKey = "toolify365" | "nattzy" | "apps";

const BIZ: Record<BizKey, { label: string; site: string; links: { label: string; url: string }[] }> = {
  toolify365: {
    label: "Toolify365",
    site: "https://toolify365.com",
    links: [
      { label: "Google AdSense", url: "https://www.google.com/adsense/" },
      { label: "A8.net", url: "https://pub.a8.net/" },
      { label: "AWIN", url: "https://ui.awin.com/" },
      { label: "Search Console", url: "https://search.google.com/search-console" },
      { label: "GA4", url: "https://analytics.google.com/" },
    ],
  },
  nattzy: {
    label: "Nattzy",
    site: "https://nattzy.com",
    links: [
      { label: "Discourse 管理画面", url: "https://nattzy.com/admin" },
      { label: "Impact", url: "https://app.impact.com/" },
      { label: "Search Console", url: "https://search.google.com/search-console" },
    ],
  },
  apps: {
    label: "アプリ群",
    site: "https://appdevelopsk.github.io",
    links: [
      { label: "App Store Connect", url: "https://appstoreconnect.apple.com/" },
      { label: "Google Play Console", url: "https://play.google.com/console" },
      { label: "LevelPlay(ironSource)", url: "https://platform.ironsrc.com/" },
      { label: "Firebase", url: "https://console.firebase.google.com/" },
    ],
  },
};

const yen = (n: number | null | undefined) => (n == null ? "—" : `¥${Math.round(n).toLocaleString("ja-JP")}`);
const WINDOW_LABEL = { mtd: "今月", last30d: "直近30日", unknown: "期間不明" } as const;
const STATUS_LABEL = { ok: "取得済", zero: "0円確定", missing: "取得失敗", unmeasured: "未計測" } as const;
const STATUS_COLOR = { ok: "#1f7a46", zero: "#5b6575", missing: "#b42318", unmeasured: "#b54708" } as const;

/** 月末までの残り日数(今日を含む・JST)。スナップショット日から数える。 */
function remainingDays(date: string): number {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.max(1, last - d + 1);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}


const sgn = (n: number) => `${n >= 0 ? "+" : "−"}¥${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;

function Delta({ now, prev }: { now: number | null; prev: number | null | undefined }) {
  if (now == null || prev == null) return <span style={{ color: "#5b6575" }}>—</span>;
  const d = now - prev;
  return <span style={{ color: d > 0 ? "#1f7a46" : d < 0 ? "#b42318" : "#5b6575" }}>{d === 0 ? "±¥0" : sgn(d)}</span>;
}

function Spark({ series }: { series: HistoryBusiness["series"] }) {
  const pts = series.filter((s) => s.last30d != null);
  if (pts.length < 2) return <p style={{ color: "#5b6575", fontSize: 13 }}>履歴がまだ少なく、推移は描けません。</p>;
  const W = 600, H = 110, P = 8;
  const max = Math.max(1, ...pts.map((s) => s.last30d as number));
  const d = pts.map((s, i) => `${i ? "L" : "M"}${(P + (i * (W - 2 * P)) / (pts.length - 1)).toFixed(1)} ${(H - P - ((s.last30d as number) / max) * (H - 2 * P)).toFixed(1)}`).join(" ");
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 110, background: "#f5f7fa", borderRadius: 8 }}>
        <path d={d} fill="none" stroke="#2a78d6" strokeWidth={2} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5b6575" }}>
        <span>{pts[0]!.date.slice(5)} {yen(pts[0]!.last30d)}</span>
        <span>最大 {yen(max)}</span>
        <span>{pts[pts.length - 1]!.date.slice(5)} {yen(pts[pts.length - 1]!.last30d)}</span>
      </div>
    </>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ biz?: string }> }) {
  const { biz } = await searchParams;
  const key: BizKey = biz === "nattzy" || biz === "apps" ? biz : "toolify365";
  const meta = BIZ[key];
  const snap = await loadRevenue();
  const hist = (await loadHistory())?.businesses[key] ?? null;

  const card = { background: "#fff", border: "1px solid #dfe3ea", borderRadius: 10, padding: "14px 16px" } as const;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px 48px" }}>
      <h1 style={{ fontSize: 20, margin: "0 0 4px" }}>事業の収益確認</h1>
      <p style={{ margin: "0 0 16px", color: "#5b6575", fontSize: 13 }}>
        Toolify365 / Nattzy / アプリ群の売上。Pickly と FXEA365 は各サイトの /admin で見ます。
      </p>

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(Object.keys(BIZ) as BizKey[]).map((k) => (
          <a
            key={k}
            href={`/admin?biz=${k}`}
            style={{
              padding: "7px 14px", borderRadius: 999, textDecoration: "none", fontSize: 14,
              background: k === key ? "#1c2330" : "#fff", color: k === key ? "#fff" : "#1c2330",
              border: "1px solid #1c2330",
            }}
          >
            {BIZ[k].label}
          </a>
        ))}
        <a href="https://pickly.blog/admin" style={{ padding: "7px 14px", fontSize: 14, color: "#5b6575" }}>Pickly ↗</a>
        <a href="https://fxea365.com/admin" style={{ padding: "7px 14px", fontSize: 14, color: "#5b6575" }}>FXEA365 ↗</a>
      </nav>

      {!snap ? (
        <div style={{ ...card, borderColor: "#b42318" }}>
          収益データがまだ届いていません(ADMIN_REVENUE_FILE)。配信ジョブが未設定の可能性があります。
        </div>
      ) : (
        (() => {
          const t = snap.businesses[key];
          const goal = snap.goal.jpyPerBusinessPerMonth;
          const rem = remainingDays(snap.date);
          const need = Math.max(0, goal - (t?.mtdJpy ?? 0)) / rem;
          const age = daysBetween(snap.date, new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10));
          const rows: RevenueSource[] = snap.sources.filter((s) => s.business === key);
          const pct = Math.min(100, ((t?.mtdJpy ?? 0) / goal) * 100);
          return (
            <>
              {age >= 2 && (
                <div style={{ ...card, borderColor: "#b54708", marginBottom: 12 }}>
                  データは {snap.date} 分です({age}日前)。収集ジョブが止まっている可能性があります。
                </div>
              )}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 12 }}>
                <div style={card}><div style={{ fontSize: 12, color: "#5b6575" }}>今月の確認額({snap.month})</div><div style={{ fontSize: 26, fontWeight: 700 }}>{yen(t?.mtdJpy)}</div></div>
                <div style={card}><div style={{ fontSize: 12, color: "#5b6575" }}>直近30日</div><div style={{ fontSize: 26, fontWeight: 700 }}>{yen(t?.last30dJpy)}</div></div>
                <div style={card}><div style={{ fontSize: 12, color: "#5b6575" }}>月間目標 {yen(goal)} まで</div><div style={{ fontSize: 26, fontWeight: 700 }}>{yen(need)}<span style={{ fontSize: 13, fontWeight: 400 }}> /日 × 残り{rem}日</span></div></div>
              </section>
              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#5b6575", marginBottom: 6 }}>目標比 {pct.toFixed(1)}%</div>
                <div style={{ height: 8, background: "#e8ebf0", borderRadius: 4 }}>
                  <div style={{ width: `${pct}%`, height: 8, background: "#2a78d6", borderRadius: 4 }} />
                </div>
              </div>

              {hist && (
                <>
                  <section style={{ ...card, marginBottom: 12, background: "#f5f7fa" }}>
                    <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>所見(前回との比較・履歴 {hist.series.length} 日分)</h2>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
                      {hist.findings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </section>
                  <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 12 }}>
                    {(["d7", "d14"] as const).map((k) => {
                      const c = hist.compare[k];
                      return c ? (
                        <div key={k} style={card}>
                          <div style={{ fontSize: 12, color: "#5b6575" }}>{k === "d7" ? "7日前" : "14日前"}({c.date.slice(5)})の直近30日</div>
                          <div style={{ fontSize: 20, fontWeight: 700 }}>{yen(c.last30d)}</div>
                          <div style={{ fontSize: 13 }}>現在との差 <Delta now={hist.now.last30d} prev={c.last30d} /></div>
                        </div>
                      ) : null;
                    })}
                    <div style={card}>
                      <div style={{ fontSize: 12, color: "#5b6575" }}>今月の着地予測</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{yen(hist.projection.landing)}</div>
                      <div style={{ fontSize: 13 }}>目標の {hist.projection.goalPct ?? "—"}%(前日までの{hist.projection.elapsedDays}日で日割り)</div>
                    </div>
                  </section>
                  <section style={{ ...card, marginBottom: 12 }}>
                    <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>直近30日の推移(日次スナップショット)</h2>
                    <Spark series={hist.series} />
                  </section>
                </>
              )}
              {t && t.notCollected.length > 0 && (
                <div style={{ ...card, borderColor: "#b54708", marginBottom: 12, fontSize: 14 }}>
                  未収集の源があります: {t.notCollected.join(" / ")}。売上0円と確定したわけではありません。
                </div>
              )}

              <section style={{ ...card, marginBottom: 12, overflowX: "auto" }}>
                <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>収益源の内訳</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#5b6575", fontSize: 12 }}>
                      <th style={{ padding: "6px 8px" }}>源</th><th style={{ padding: "6px 8px" }}>期間</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>現在(円換算)</th><th style={{ padding: "6px 8px", textAlign: "right" }}>7日前</th><th style={{ padding: "6px 8px", textAlign: "right" }}>差</th><th style={{ padding: "6px 8px" }}>指標(7日前→現在)</th>
                      <th style={{ padding: "6px 8px" }}>状態</th><th style={{ padding: "6px 8px" }}>メモ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => (
                      <tr key={s.source} style={{ borderTop: "1px solid #e8ebf0", verticalAlign: "top" }}>
                        <td style={{ padding: "8px" }}>{s.source}</td>
                        <td style={{ padding: "8px" }}>{WINDOW_LABEL[s.window]}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{yen(s.jpy)}</td>
                        {(() => {
                          const h = hist?.sources.find((x) => x.source === s.source && x.window === s.window);
                          const m = h ? Object.entries(h.metrics).filter(([, v]) => v.now != null).map(([k, v]) => `${k} ${v.prev7 ?? "—"}→${v.now}`).join(" / ") : "";
                          return (
                            <>
                              <td style={{ padding: "8px", textAlign: "right" }}>{yen(h?.prev7)}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}><Delta now={s.jpy} prev={h?.prev7} /></td>
                              <td style={{ padding: "8px", color: "#5b6575", fontSize: 12 }}>{m}</td>
                            </>
                          );
                        })()}
                        <td style={{ padding: "8px", color: STATUS_COLOR[s.status], whiteSpace: "nowrap" }}>{STATUS_LABEL[s.status]}</td>
                        <td style={{ padding: "8px", color: "#5b6575", fontSize: 12 }}>{s.note ?? ""}</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: 8, color: "#5b6575" }}>この事業の収益源が登録されていません。</td></tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section style={card}>
                <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>データ元の管理画面</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
                  <a href={meta.site} target="_blank" rel="noreferrer">サイト ↗</a>
                  {meta.links.map((l) => (
                    <a key={l.url + l.label} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                  ))}
                </div>
              </section>

              <p style={{ color: "#5b6575", fontSize: 12, marginTop: 16 }}>
                確認額は会計上の確定純利益ではありません。取得 {snap.generatedAt.slice(0, 16).replace("T", " ")} UTC / 固定レート換算。
              </p>
            </>
          );
        })()
      )}
    </main>
  );
}
