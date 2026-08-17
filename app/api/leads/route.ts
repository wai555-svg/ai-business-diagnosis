import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendLead, type DiagnosisSummary, type LeadRecord } from "@/lib/leadStorage.server";
import { sendLeadNotificationEmail, postLeadWebhook } from "@/lib/notify.server";
import { isResendEnabled, isLeadsWebhookEnabled } from "@/lib/serverEnv";
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

  const lead: LeadRecord = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    companyName,
    name,
    email,
    message,
    utm,
    diagnosisSummary,
  };

  const [fileSaved, emailSent, webhookSent] = await Promise.all([
    appendLead(lead),
    isResendEnabled ? sendLeadNotificationEmail(lead) : Promise.resolve(false),
    isLeadsWebhookEnabled ? postLeadWebhook(lead) : Promise.resolve(false),
  ]);

  if (!fileSaved && !emailSent && !webhookSent) {
    return NextResponse.json(
      { ok: false, message: "保存に失敗しました。お手数ですが時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, savedVia: { fileSaved, emailSent, webhookSent } });
}
