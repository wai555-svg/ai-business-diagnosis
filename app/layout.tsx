import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { DiagnosisProvider } from "@/context/DiagnosisContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import UtmCapture from "@/components/UtmCapture";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "AI業務改善診断｜御社では、AIで年間何時間削減できる？",
  description:
    "10問・約3分で、AI導入による業務削減効果を無料診断。年間削減時間・削減コストを算出し、AI化に効果的な業務トップ3をご提案します。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <GoogleAnalytics />
        <MetaPixel />
        <UtmCapture />
        <DiagnosisProvider>{children}</DiagnosisProvider>
      </body>
    </html>
  );
}
