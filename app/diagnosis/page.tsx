"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import PrimaryButton from "@/components/PrimaryButton";
import QuestionInput from "@/components/QuestionInput";
import { QUESTIONS } from "@/lib/questions";
import { useDiagnosis } from "@/context/DiagnosisContext";
import type { DiagnosisAnswers } from "@/lib/types";

const DEFAULTS: Record<string, string | number> = {
  officeWorkerCount: 5,
  email: 3,
  minutes: 2,
  documents: 3,
  dataEntry: 2,
  inquiry: 2,
  salesDocs: 2,
  reports: 1.5,
};

export default function DiagnosisPage() {
  const router = useRouter();
  const { answers, setAnswer } = useDiagnosis();
  const [step, setStep] = useState(0);

  const total = QUESTIONS.length;
  const question = QUESTIONS[step];
  const key = question.id as keyof DiagnosisAnswers;
  const currentValue = (answers[key] as string | number | undefined) ?? DEFAULTS[question.id];

  useEffect(() => {
    if (answers[key] === undefined && DEFAULTS[question.id] !== undefined) {
      setAnswer(key, DEFAULTS[question.id] as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const isAnswered =
    question.type === "select" ? currentValue !== undefined : currentValue !== undefined && currentValue !== "";

  const goNext = () => {
    if (step === total - 1) {
      router.push("/result");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((s) => s - 1);
  };

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 flex-col py-8">
        <Container>
          <ProgressBar current={step + 1} total={total} />

          <div className="mt-8 min-h-[320px]">
            <h1 className="text-xl font-bold leading-snug text-slate-900">{question.title}</h1>
            {question.description && (
              <p className="mt-2 text-sm text-slate-500">{question.description}</p>
            )}

            <div className="mt-8">
              <QuestionInput
                question={question}
                value={currentValue}
                onChange={(v) => setAnswer(key, v as never)}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button
              onClick={goBack}
              className="rounded-xl border-2 border-slate-200 px-5 py-4 text-sm font-bold text-slate-500 transition hover:border-slate-300"
            >
              戻る
            </button>
            <PrimaryButton onClick={goNext} disabled={!isAnswered}>
              {step === total - 1 ? "診断結果を見る" : "次へ"}
            </PrimaryButton>
          </div>
        </Container>
      </div>
    </main>
  );
}
