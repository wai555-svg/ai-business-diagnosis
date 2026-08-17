"use client";

import { getStoredUtm } from "@/lib/utm";

export type EventName = "diagnosis_start" | "diagnosis_complete" | "contact_submit";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * 診断開始・診断完了・相談送信のイベントを計測する。
 * - GA4(gtag)が読み込まれていればイベント送信
 * - Meta Pixel(fbq)が読み込まれていればカスタムイベント送信
 * - 常に自社の /api/events にも送信する（GA4/Pixel未設定でもローカルでイベント発火を確認できるようにするため）
 */
export function trackEvent(name: EventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[track]", name, params);
  }

  try {
    window.gtag?.("event", name, params);
  } catch {
    // ignore
  }

  try {
    window.fbq?.("trackCustom", name, params);
  } catch {
    // ignore
  }

  try {
    const body = JSON.stringify({
      name,
      params,
      utm: getStoredUtm(),
      path: window.location.pathname,
      ts: new Date().toISOString(),
    });
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // 計測失敗はユーザー体験に影響させない
    });
  } catch {
    // ignore
  }
}
