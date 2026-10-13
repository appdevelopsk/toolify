import { loadRevenue } from "../revenue";

export const dynamic = "force-dynamic";

/** /admin/data — 収益スナップショットの生 JSON。認証は src/middleware.ts が先に済ませる。 */
export async function GET() {
  const data = await loadRevenue();
  if (!data) {
    return Response.json(
      { error: "収益データがありません。ADMIN_REVENUE_FILE のパスと配信ジョブを確認してください。" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
