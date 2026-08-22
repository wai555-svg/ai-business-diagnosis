"use client";

import { useState } from "react";

export default function TestNotificationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "failed">("idle");
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/test-notification", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (data.ok) {
        setStatus("sent");
      } else {
        setStatus("failed");
        setMessage(data.message ?? "送信に失敗しました。");
      }
    } catch {
      setStatus("failed");
      setMessage("通信エラーが発生しました。");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {status === "loading" ? "送信中..." : "テスト通知メールを送信"}
      </button>
      {status === "sent" && (
        <p className="text-xs font-semibold text-emerald-600">送信しました。受信箱をご確認ください。</p>
      )}
      {status === "failed" && (
        <p className="max-w-xs text-right text-xs font-semibold text-red-600">失敗: {message}</p>
      )}
    </div>
  );
}
