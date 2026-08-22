import { serverEnv } from "@/lib/serverEnv";
import type { LeadRecord } from "@/lib/leadStorage.server";

export type NotifyResult = { ok: true } | { ok: false; error: string };

function formatLeadText(lead: LeadRecord): string {
  const utmLines = Object.entries(lead.utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  const diagnosisLines = lead.diagnosisSummary
    ? [
        `  年間削減可能時間: ${lead.diagnosisSummary.totalAnnualHours.toLocaleString()} 時間`,
        `  年間削減可能コスト: ${lead.diagnosisSummary.totalAnnualCost.toLocaleString()} 円`,
        `  AI化おすすめ度: ${lead.diagnosisSummary.recommendationScore} / 5`,
        `  改善効果が高い業務TOP3: ${lead.diagnosisSummary.topTasks.join(" / ")}`,
      ].join("\n")
    : "  （診断未実施）";

  return [
    `送信日時: ${lead.submittedAt}`,
    `会社名: ${lead.companyName}`,
    `氏名: ${lead.name}`,
    `メール: ${lead.email}`,
    `相談内容: ${lead.message || "（未記入）"}`,
    "",
    "診断結果:",
    diagnosisLines,
    "",
    "流入元(UTM):",
    utmLines || "  （なし）",
  ].join("\n");
}

/**
 * ResendのAPIエラーレスポンスから、秘密情報を含まない範囲でエラー概要を抽出する。
 * Resendのエラーボディに含まれるのはリクエスト内容に対するエラーメッセージのみで、
 * APIキー等の秘密情報は含まれない。
 */
async function describeResendError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = (await res.json()) as { message?: string; name?: string };
    detail = body.message || body.name || "";
  } catch {
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {
      detail = "";
    }
  }
  return `Resend API error (status ${res.status})${detail ? `: ${detail}` : ""}`;
}

async function sendViaResend(subject: string, text: string): Promise<NotifyResult> {
  if (!serverEnv.resendApiKey || !serverEnv.adminNotifyEmail) {
    return {
      ok: false,
      error: "RESEND_API_KEY または ADMIN_NOTIFY_EMAIL が設定されていません。",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: serverEnv.leadNotifyFromEmail,
        to: serverEnv.adminNotifyEmail,
        subject,
        text,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: await describeResendError(res) };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: `Resend APIへのリクエストに失敗しました: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Resend (https://resend.com) のREST APIを使って管理者に通知メールを送る。
 * RESEND_API_KEY / ADMIN_NOTIFY_EMAIL が未設定の場合もエラー内容を返す（呼び出し元でDBに記録する）。
 */
export async function sendLeadNotificationEmail(lead: LeadRecord): Promise<NotifyResult> {
  const subject = `【AI業務改善診断】新しい無料相談が入りました（${lead.companyName}様）`;
  return sendViaResend(subject, formatLeadText(lead));
}

/**
 * 管理画面からの「テスト通知メールを送信」用。実際のリードは作成せず、ダミーデータで送信を試みる。
 */
export async function sendTestNotificationEmail(): Promise<NotifyResult> {
  const dummyLead: LeadRecord = {
    id: "test",
    submittedAt: new Date().toISOString(),
    companyName: "テスト株式会社",
    name: "テスト太郎",
    email: "test@example.com",
    message: "これはテスト通知メールです。管理画面からの送信テストにより送られています。",
    utm: { utm_source: "test", utm_medium: "admin-panel" },
    diagnosisSummary: {
      totalAnnualHours: 120,
      totalAnnualCost: 360000,
      recommendationScore: 4,
      topTasks: ["請求書処理", "議事録作成", "メール対応"],
    },
    notificationStatus: null,
    notificationError: null,
  };

  return sendViaResend("【AI業務改善診断】テスト通知メール", formatLeadText(dummyLead));
}

/**
 * Slack Incoming Webhook等、JSONをPOSTできる任意のURLへ通知する。
 */
export async function postLeadWebhook(lead: LeadRecord): Promise<boolean> {
  try {
    const res = await fetch(serverEnv.leadsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `【無料相談】新しいお申し込み：${lead.companyName}様\n${formatLeadText(lead)}`,
        lead,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
