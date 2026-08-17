"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message ?? "ログインに失敗しました。");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 items-center py-12">
        <Container>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h1 className="text-lg font-bold text-slate-900">管理画面ログイン</h1>
            <p className="mt-2 text-xs text-slate-500">
              開発環境では ADMIN_ACCESS_KEY 未設定でも &quot;dev-admin&quot;
              でログインできます。本番では必ず環境変数を設定してください。
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "確認中..." : "ログイン"}
              </PrimaryButton>
            </form>
          </div>
        </Container>
      </div>
    </main>
  );
}
