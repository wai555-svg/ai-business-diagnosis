// 診断で使う型定義

export type TaskKey =
  | "email"
  | "minutes"
  | "documents"
  | "dataEntry"
  | "inquiry"
  | "salesDocs"
  | "reports";

export type AiUsageLevel = "none" | "partial" | "active";

export type QuestionType = "select" | "number" | "slider";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BaseQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  unit?: string;
}

export interface SelectQuestion extends BaseQuestion {
  type: "select";
  options: SelectOption[];
}

export interface NumberQuestion extends BaseQuestion {
  type: "number";
  min: number;
  max: number;
  step: number;
  placeholder?: string;
}

export interface SliderQuestion extends BaseQuestion {
  type: "slider";
  min: number;
  max: number;
  step: number;
  taskKey: TaskKey;
}

export type Question = SelectQuestion | NumberQuestion | SliderQuestion;

// ユーザーの回答一式
export interface DiagnosisAnswers {
  employeeCountRange: string; // Q1
  officeWorkerCount: number; // Q2
  email: number; // Q3 週あたり時間(1人あたり)
  minutes: number; // Q4
  documents: number; // Q5
  dataEntry: number; // Q6
  inquiry: number; // Q7
  salesDocs: number; // Q8
  reports: number; // Q9
  aiUsage: AiUsageLevel; // Q10
}

export interface TaskResult {
  key: TaskKey;
  label: string;
  annualHours: number;
  annualCost: number;
}

export interface DiagnosisResult {
  totalAnnualHours: number;
  totalAnnualCost: number;
  recommendationScore: number; // 1-5
  topTasks: TaskResult[];
  allTasks: TaskResult[];
}
