import "./globals.css";
import type { ReactNode } from "react";

/**
 * Root layout。next-intl の都合で `[locale]/layout.tsx` 側で <html> を出すため
 * ここではシンプルに children を返すだけにする。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
