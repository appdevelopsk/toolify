import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** 管理画面は next-intl の外(ロケールなし)。認証は src/middleware.ts。 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: "#f6f7f9", color: "#1c2330", fontFamily: "system-ui, -apple-system, 'Hiragino Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
