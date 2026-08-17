import {
  AI_USAGE_ADJUSTMENT,
  HOURLY_WAGE_YEN,
  RECOMMENDATION_SCORE_THRESHOLDS,
  REDUCTION_RATE,
  TASK_LABELS,
  WORK_WEEKS_PER_YEAR,
} from "./constants";
import type { DiagnosisAnswers, DiagnosisResult, TaskKey, TaskResult } from "./types";

const TASK_KEYS: TaskKey[] = [
  "email",
  "minutes",
  "documents",
  "dataEntry",
  "inquiry",
  "salesDocs",
  "reports",
];

/**
 * 診断ロジック本体。
 * 業務ごとの「1人あたり週間時間 × 事務作業人数 × 年間週数 × 削減率 × AI活用度補正」を合算する。
 */
export function calculateResult(answers: DiagnosisAnswers): DiagnosisResult {
  const adjustment = AI_USAGE_ADJUSTMENT[answers.aiUsage];
  const officeWorkerCount = Math.max(answers.officeWorkerCount || 0, 0);

  const allTasks: TaskResult[] = TASK_KEYS.map((key) => {
    const weeklyHoursPerPerson = answers[key] || 0;
    const annualHours =
      weeklyHoursPerPerson *
      officeWorkerCount *
      WORK_WEEKS_PER_YEAR *
      REDUCTION_RATE[key] *
      adjustment;

    return {
      key,
      label: TASK_LABELS[key],
      annualHours: Math.round(annualHours),
      annualCost: Math.round(annualHours * HOURLY_WAGE_YEN),
    };
  });

  const totalAnnualHours = allTasks.reduce((sum, t) => sum + t.annualHours, 0);
  const totalAnnualCost = allTasks.reduce((sum, t) => sum + t.annualCost, 0);

  const topTasks = [...allTasks].sort((a, b) => b.annualHours - a.annualHours).slice(0, 3);

  const recommendationScore =
    RECOMMENDATION_SCORE_THRESHOLDS.find((t) => totalAnnualHours >= t.hours)?.score ?? 1;

  return {
    totalAnnualHours,
    totalAnnualCost,
    recommendationScore,
    topTasks,
    allTasks,
  };
}
