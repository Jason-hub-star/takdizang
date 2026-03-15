/** Takdi Studio 루트 레이아웃 — globals.css + 기본 body 스타일 적용 */
import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { GlobalDebugNav } from "@/components/layout/global-debug-nav";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/provider";
import { koMessages } from "@/i18n/messages/ko";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Takdi Studio",
  description: "AI 기반 이커머스 상세페이지 영상 생성 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable}`}>
      <body className="min-h-screen antialiased">
        <I18nProvider messages={koMessages}>
          <GlobalDebugNav />
          {children}
          <Toaster position="top-center" richColors />
        </I18nProvider>
      </body>
    </html>
  );
}
