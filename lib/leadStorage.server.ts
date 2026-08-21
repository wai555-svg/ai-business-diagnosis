import { getSupabaseAdmin } from "@/lib/supabaseAdmin.server";
import type { UtmParams } from "@/lib/utm";

export interface DiagnosisSummary {
  totalAnnualHours: number;
  totalAnnualCost: number;
  recommendationScore: number;
  topTasks: string[];
}

export interface LeadInput {
  companyName: string;
  name: string;
  email: string;
  message: string;
  utm: UtmParams;
  diagnosisSummary: DiagnosisSummary | null;
}

export interface LeadRecord extends LeadInput {
  id: string;
  submittedAt: string;
}

type LeadRow = {
  id: string;
  created_at: string;
  company_name: string;
  name: string;
  email: string;
  message: string | null;
  annual_saved_hours: number | null;
  annual_saved_cost: number | null;
  ai_recommendation: number | null;
  top_tasks: string[] | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

function rowToLead(row: LeadRow): LeadRecord {
  const hasDiagnosis = row.annual_saved_hours !== null && row.annual_saved_hours !== undefined;

  return {
    id: row.id,
    submittedAt: row.created_at,
    companyName: row.company_name,
    name: row.name,
    email: row.email,
    message: row.message ?? "",
    utm: {
      utm_source: row.utm_source ?? undefined,
      utm_medium: row.utm_medium ?? undefined,
      utm_campaign: row.utm_campaign ?? undefined,
      utm_content: row.utm_content ?? undefined,
      utm_term: row.utm_term ?? undefined,
    },
    diagnosisSummary: hasDiagnosis
      ? {
          totalAnnualHours: row.annual_saved_hours as number,
          totalAnnualCost: row.annual_saved_cost ?? 0,
          recommendationScore: row.ai_recommendation ?? 0,
          topTasks: row.top_tasks ?? [],
        }
      : null,
  };
}

export type SaveLeadResult = { ok: true; lead: LeadRecord } | { ok: false; error: string };

/**
 * 相談内容をSupabaseの leads テーブルへ保存する（唯一の永続ストレージ）。
 * Vercel等のサーバーレス環境ではローカルファイルへの永続書き込みができないため、
 * ファイルベースの保存は行わない。
 */
export async function saveLead(input: LeadInput): Promise<SaveLeadResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabaseが設定されていません（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEYが未設定です）",
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      company_name: input.companyName,
      name: input.name,
      email: input.email,
      message: input.message || null,
      annual_saved_hours: input.diagnosisSummary?.totalAnnualHours ?? null,
      annual_saved_cost: input.diagnosisSummary?.totalAnnualCost ?? null,
      ai_recommendation: input.diagnosisSummary?.recommendationScore ?? null,
      top_tasks: input.diagnosisSummary?.topTasks ?? null,
      utm_source: input.utm.utm_source ?? null,
      utm_medium: input.utm.utm_medium ?? null,
      utm_campaign: input.utm.utm_campaign ?? null,
      utm_content: input.utm.utm_content ?? null,
      utm_term: input.utm.utm_term ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "unknown Supabase error" };
  }

  return { ok: true, lead: rowToLead(data as LeadRow) };
}

/**
 * 相談一覧を新しい順に取得する。Supabase未設定の場合は空配列を返す。
 */
export async function listLeads(): Promise<LeadRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[leads] Supabaseからの取得に失敗しました:", error);
    return [];
  }

  return (data as LeadRow[]).map(rowToLead);
}
