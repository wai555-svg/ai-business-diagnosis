import Script from "next/script";
import { GA_MEASUREMENT_ID, isGaEnabled } from "@/lib/publicEnv";

/** NEXT_PUBLIC_GA_MEASUREMENT_ID が未設定の場合は何も読み込まない */
export default function GoogleAnalytics() {
  if (!isGaEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}
