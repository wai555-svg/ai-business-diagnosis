import { serverEnv } from "@/lib/serverEnv";
import type { LeadRecord } from "@/lib/leadStorage.server";

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
        `  改善効果が高い業務: ${lead.diagnosisSummary.topTasks.join(" / ")}`,
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
 * Resend (https://resend.com) のREST APIを使って管理者に通知メールを送る。
 * RESEND_API_KEY / ADMIN_NOTIFY_EMAIL が未設定の場合は呼び出し元でスキップされる。
 */
export async function sendLeadNotificationEmail(lead: LeadRecord): Promise<boolean> {
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
        subject: `【無料相談】新しいお申し込み：${lead.companyName}様`,
        text: formatLeadText(lead),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
