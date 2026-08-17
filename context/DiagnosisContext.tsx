"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DiagnosisAnswers } from "@/lib/types";

const STORAGE_KEY = "ai-diagnosis-answers";

const initialAnswers: Partial<DiagnosisAnswers> = {};

interface DiagnosisContextValue {
  answers: Partial<DiagnosisAnswers>;
  setAnswer: <K extends keyof DiagnosisAnswers>(key: K, value: DiagnosisAnswers[K]) => void;
  resetAnswers: () => void;
}

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Partial<DiagnosisAnswers>>(initialAnswers);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setAnswers(JSON.parse(raw));
      }
    } catch {
      // sessionStorageが使えない環境では無視
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers, hydrated]);

  const setAnswer: DiagnosisContextValue["setAnswer"] = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const resetAnswers = () => {
    setAnswers({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <DiagnosisContext.Provider value={{ answers, setAnswer, resetAnswers }}>
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const ctx = useContext(DiagnosisContext);
  if (!ctx) {
    throw new Error("useDiagnosis must be used within DiagnosisProvider");
  }
  return ctx;
}
