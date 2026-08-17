"use client";

import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

export default function QuestionInput({ question, value, onChange }: Props) {
  if (question.type === "select") {
    return (
      <div className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl border-2 px-5 py-4 text-left text-base font-semibold transition ${
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={question.min}
            max={question.max}
            step={question.step}
            placeholder={question.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border-2 border-slate-200 px-5 py-4 text-lg font-bold text-slate-800 outline-none focus:border-blue-500"
          />
          {question.unit && (
            <span className="text-base font-semibold text-slate-500">{question.unit}</span>
          )}
        </div>
      </div>
    );
  }

  // slider
  const numericValue = typeof value === "number" ? value : question.min;
  return (
    <div>
      <div className="mb-4 text-center">
        <span className="text-4xl font-black text-blue-600">{numericValue}</span>
        <span className="ml-1 text-base font-bold text-slate-500">{question.unit}</span>
      </div>
      <input
        type="range"
        min={question.min}
        max={question.max}
        step={question.step}
        value={numericValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
        <span>{question.min}</span>
        <span>{question.max}</span>
      </div>
    </div>
  );
}
