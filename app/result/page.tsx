"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";
import { useDiagnosis } from "@/context/DiagnosisContext";
import { calculateResult } from "@/lib/calculate";
import type { DiagnosisAnswers } from "@/lib/types";

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex justify-center gap-1 text-3xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= score ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { answers } = useDiagnosis();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (answers.aiUsage === undefined || answers.officeWorkerCount === undefined) {
      router.replace("/diagnosis");
      return;
    }
    setReady(true);
  }, [answers, router]);

  const result = useMemo(() => {
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
    return calculateResult(filled);
  }, [answers]);

  if (!ready) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />

      <div className="py-8">
        <Container>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              診断結果
            </span>
            <h1 className="mt-3 text-lg font-bold text-slate-800">
              御社のAI導入ポテンシャルはこちらです
            </h1>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-500">年間削減可能時間</p>
            <p className="mt-2 text-5xl font-black tracking-tight text-blue-600">
              {result.totalAnnualHours.toLocaleString()}
              <span className="ml-1 text-2xl font-bold text-blue-500">時間</span>
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-500">年間削減可能コスト</p>
            <p className="mt-2 text-5xl font-black tracking-tight text-emerald-600">
              {result.totalAnnualCost.toLocaleString()}
              <span className="ml-1 text-2xl font-bold text-emerald-500">円</span>
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-500">AI化おすすめ度</p>
            <div className="mt-3">
              <StarRating score={result.recommendationScore} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-500">改善効果が高い業務</p>
            <ol className="mt-4 space-y-3">
              {result.topTasks.map((task, idx) => (
                <li
                  key={task.key}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{task.label}</p>
                    <p className="text-xs text-slate-500">
                      年間 {task.annualHours.toLocaleString()} 時間削減見込み
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
            <p className="text-base font-bold leading-relaxed text-blue-800">
              御社で実際にAI化できる業務を
              <br />
              無料で3つご提案します
            </p>
            <div className="mt-5">
              <Link href="/contact">
                <PrimaryButton>無料相談を申し込む</PrimaryButton>
              </Link>
            </div>
            <p className="mt-3 text-xs text-blue-600">所要1分・しつこい営業はいたしません</p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/diagnosis" className="text-xs font-semibold text-slate-400 underline">
              もう一度診断する
            </Link>
          </div>
        </Container>
      </div>
    </main>
  );
}
