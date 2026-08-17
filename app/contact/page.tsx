"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";
import { saveContact } from "@/lib/contactStorage";
import { useDiagnosis } from "@/context/DiagnosisContext";
import { calculateResult } from "@/lib/calculate";
import type { DiagnosisAnswers } from "@/lib/types";
import { getStoredUtm } from "@/lib/utm";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const router = useRouter();
  const { answers } = useDiagnosis();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValid =
    companyName.trim() !== "" && name.trim() !== "" && /\S+@\S+\.\S+/.test(email) && agreed;

  const diagnosisSummary = useMemo(() => {
    if (answers.aiUsage === undefined || answers.officeWorkerCount === undefined) return null;
    const filled: DiagnosisAnswers = {
      employeeCountRange: answers.employeeCountRange ?? "5to20",
      officeWorkerCount: Number(answers.officeWorkerCount) || 0,
      email: Number(answers.email) || 0,
      minutes: Number(answers.minutes) || 0,
      documents: Number(answers.documents) || 0,
      dataEntry: Number(answers.dataEntry) || 0,
      inquiry: Number(answers.inquiry) || 0,
      salesDocs: Number(answers.salesDocs) || 0,
      reports: Number(answers.reports) || 0,
      aiUsage: answers.aiUsage ?? "none",
    };
    const result = calculateResult(filled);
    return {
      totalAnnualHours: result.totalAnnualHours,
      totalAnnualCost: result.totalAnnualCost,
      recommendationScore: result.recommendationScore,
      topTasks: result.topTasks.map((t) => t.label),
    };
  }, [answers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setErrorMessage("");

    const form = { companyName, name, email, message };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          utm: getStoredUtm(),
          diagnosisSummary,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.message ?? "送信に失敗しました。時間をおいて再度お試しください。");
        setSubmitting(false);
        return;
      }

      // サンクス画面での表示用に、ブラウザ側にも入力内容を保持する
      saveContact(form);
      trackEvent("contact_submit", {
        hasDiagnosis: diagnosisSummary !== null,
      });

      router.push("/thanks");
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="py-8">
        <Container>
          <h1 className="text-xl font-bold text-slate-900">無料相談のお申し込み</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            御社で実際にAI化できる業務を、無料で3つご提案いたします。
            <br />
            以下のフォームにご記入ください。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例：株式会社サンプル"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：山田 太郎"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例：taro@example.com"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">相談したい内容</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="例：議事録作成をAI化したい"
                className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <Link href="/privacy" className="text-blue-600 underline" target="_blank">
                  プライバシーポリシー
                </Link>
                に同意のうえ、送信します。
              </span>
            </label>

            {errorMessage && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </p>
            )}

            <PrimaryButton type="submit" disabled={!isValid || submitting}>
              {submitting ? "送信中..." : "無料相談を申し込む"}
            </PrimaryButton>
          </form>
        </Container>
      </div>
    </main>
  );
}
