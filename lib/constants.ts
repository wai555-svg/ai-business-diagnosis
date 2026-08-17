// ============================================================
// 診断ロジックの係数まとめ（ここを変更すれば診断結果の算出ルールが変わります）
// ============================================================
import type { AiUsageLevel, TaskKey } from "./types";

/** 年間の稼働週数（52週） */
export const WORK_WEEKS_PER_YEAR = 52;

/** 平均時給換算コスト（円） 社会保険料等を含めた概算の人件費単価 */
export const HOURLY_WAGE_YEN = 3000;

/** 各業務ごとの「AI導入による削減率」（0〜1） */
export const REDUCTION_RATE: Record<TaskKey, number> = {
  email: 0.3, // メール・文章作成
  minutes: 0.6, // 議事録作成
  documents: 0.4, // 資料・提案書作成
  dataEntry: 0.5, // データ入力・転記
  inquiry: 0.35, // 社内問い合わせ対応
  salesDocs: 0.4, // 営業資料・見積書作成
  reports: 0.45, // 日報・報告書作成
};

/** 業務名（表示用ラベル） */
export const TASK_LABELS: Record<TaskKey, string> = {
  email: "メール・文章作成",
  minutes: "議事録作成",
  documents: "資料・提案書作成",
  dataEntry: "データ入力・転記",
  inquiry: "社内問い合わせ対応",
  salesDocs: "営業資料・見積書作成",
  reports: "日報・報告書作成",
};

/**
 * 現在の生成AI活用度による補正係数。
 * すでにAIを活用している企業ほど、追加で削減できる余地は小さくなる。
 */
export const AI_USAGE_ADJUSTMENT: Record<AiUsageLevel, number> = {
  none: 1.0, // 未導入
  partial: 0.7, // 一部導入
  active: 0.4, // 積極活用
};

/**
 * AI化おすすめ度（1〜5）を判定するための年間削減時間のしきい値。
 * 削減時間がしきい値以上であれば、そのスコアになる（配列は降順で判定）。
 */
export const RECOMMENDATION_SCORE_THRESHOLDS: { hours: number; score: number }[] = [
  { hours: 800, score: 5 },
  { hours: 500, score: 4 },
  { hours: 250, score: 3 },
  { hours: 100, score: 2 },
  { hours: 0, score: 1 },
];
