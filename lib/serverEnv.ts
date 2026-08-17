// サーバー側でのみ参照する環境変数。
// このファイルは API Route / Server Component からのみ import すること
// （クライアントコンポーネントから import すると秘密情報が漏れる可能性がある）。

export const serverEnv = {
  // 相談通知メール（Resend: https://resend.com）
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? "",
  leadNotifyFromEmail: process.env.LEAD_NOTIFY_FROM_EMAIL ?? "onboarding@resend.dev",

  // 任意のWebhook通知先（Slack incoming webhook、Zapier等、何でも可）
  leadsWebhookUrl: process.env.LEADS_WEBHOOK_URL ?? "",

  // /admin ページの簡易パスワード保護
  adminAccessKey: process.env.ADMIN_ACCESS_KEY ?? "",
};

export const isResendEnabled =
  serverEnv.resendApiKey.length > 0 && serverEnv.adminNotifyEmail.length > 0;

export const isLeadsWebhookEnabled = serverEnv.leadsWebhookUrl.length > 0;

/**
 * 本番(NODE_ENV=production)でADMIN_ACCESS_KEYが未設定の場合は管理画面を無効化する。
 * ローカル開発時はキー未設定でも "dev-admin" で動作確認できるようにする。
 */
export function getAdminAccessKey(): string | null {
  if (serverEnv.adminAccessKey) return serverEnv.adminAccessKey;
  if (process.env.NODE_ENV !== "production") return "dev-admin";
  return null;
}
