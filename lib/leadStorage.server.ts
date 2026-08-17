import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";
import type { UtmParams } from "@/lib/utm";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.jsonl");

export interface DiagnosisSummary {
  totalAnnualHours: number;
  totalAnnualCost: number;
  recommendationScore: number;
  topTasks: string[];
}

export interface LeadRecord {
  id: string;
  submittedAt: string;
  companyName: string;
  name: string;
  email: string;
  message: string;
  utm: UtmParams;
  diagnosisSummary: DiagnosisSummary | null;
}

/**
 * 相談内容をローカルファイル(data/leads.jsonl)に1行1JSONで追記する。
 * サーバーレス環境ではデプロイ間・インスタンス間で永続化されない可能性があるため、
 * 本番運用ではメール通知(RESEND_API_KEY)またはWebhook(LEADS_WEBHOOK_URL)の設定を推奨する。
 * ここでは「ローカルでの動作確認」と「設定不要な最低限のバックアップ」を目的とする。
 */
export async function appendLead(lead: LeadRecord): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LEADS_FILE, JSON.stringify(lead) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

export async function readLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await readFile(LEADS_FILE, "utf-8");
    const lines = raw.split("\n").filter((line) => line.trim().length > 0);
    const leads = lines.map((line) => JSON.parse(line) as LeadRecord);
    return leads.reverse();
  } catch {
    return [];
  }
}
