import { NextRequest, NextResponse } from "next/server";
import { saveLead, updateLeadNotificationResult, type DiagnosisSummary } from "@/lib/leadStorage.server";
import { sendLeadNotificationEmail, postLeadWebhook } from "@/lib/notify.server";
import { isLeadsWebhookEnabled } from "@/lib/serverEnv";
import type { UtmParams } from "@/lib/utm";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "不正なリクエストです。" }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;

  const companyName = sanitizeText(input.companyName, 200);
  const name = sanitizeText(input.name, 100);
  const email = sanitizeText(input.email, 200);
  const message = sanitizeText(input.message, 2000);

  if (!companyName || !name || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, message: "会社名・氏名・メールアドレスをご確認ください。" },
      { status: 400 }
    );
  }

  const rawUtm = (input.utm ?? {}) as Record<string, unknown>;
  const utm: UtmParams = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    const value = rawUtm[key];
    if (typeof value === "string" && value) utm[key] = value.slice(0, 200);
  }

  const rawSummary = input.diagnosisSummary as Record<string, unknown> | undefined;
  const diagnosisSummary: DiagnosisSummary | null =
    rawSummary && typeof rawSummary.totalAnnualHours === "number"
      ? {
          totalAnnualHours: rawSummary.totalAnnualHours as number,
          totalAnnualCost: rawSummary.totalAnnualCost as number,
          recommendationScore: rawSummary.recommendationScore as number,
          topTasks: Array.isArray(rawSummary.topTasks) ? (rawSummary.topTasks as string[]) : [],
        }
      : null;

  const saveResult = await saveLead({ companyName, name, email, message, utm, diagnosisSummary });

  if (!saveResult.ok) {
    console.error("[api/leads] Supabaseへの保存に失敗しました:", saveResult.error);
    return NextResponse.json(
      { ok: false, message: "保存に失敗しました。お手数ですが時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  // 保存が成功していれば、通知の成否に関わらずユーザーには成功を返す。
  // 通知の成否は notification_status / notification_error としてleadsテーブルへ記録し、
  // 失敗時の詳細（秘密情報を含まない範囲）はサーバーログにも出す。
  const notifyResult = await sendLeadNotificationEmail(saveResult.lead);
  if (notifyResult.ok) {
    await updateLeadNotificationResult(saveResult.lead.id, { status: "sent" });
  } else {
    console.error(
      "[api/leads] メール通知(Resend)に失敗しました。lead id:",
      saveResult.lead.id,
      "reason:",
      notifyResult.error
    );
    await updateLeadNotificationResult(saveResult.lead.id, {
      status: "failed",
      error: notifyResult.error,
    });
  }

  if (isLeadsWebhookEnabled) {
    const webhookSent = await postLeadWebhook(saveResult.lead);
    if (!webhookSent) {
      console.error("[api/leads] Webhook通知に失敗しました。lead id:", saveResult.lead.id);
    }
  }

  return NextResponse.json({ ok: true });
}
