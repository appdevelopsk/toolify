/**
 * Public, build-time release identity for deployment verification.
 * No secrets: the Git commit SHA is already public repository metadata.
 * The route is static so the output identifies the build, not the PM2 runtime.
 */
export const dynamic = "force-static";

export function GET() {
  const sha = process.env.NEXT_PUBLIC_RELEASE_SHA || "unknown";
  return new Response(sha + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",\n      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
