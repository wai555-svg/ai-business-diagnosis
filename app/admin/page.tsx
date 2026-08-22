import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import TestNotificationButton from "@/components/TestNotificationButton";
import { listLeads } from "@/lib/leadStorage.server";
import {
  getAdminAccessKey,
  isResendEnabled,
  isLeadsWebhookEnabled,
  isSupabaseEnabled,
} from "@/lib/serverEnv";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const expected = getAdminAccessKey();
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;

  if (!expected || authCookie !== expected) {
    redirect("/admin/login");
  }

  const leads = await listLeads();

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <Header />
      <div className="py-8">
        <Container>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">無料相談一覧</h1>
            <div className="flex items-center gap-4">
              <TestNotificationButton />
              <AdminLogoutButton />
            </div>
          </div>

          {!isSupabaseEnabled && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              Supabase未設定です（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）。
              相談フォームの送信内容は保存されません。
            </p>
          )}

          {!isResendEnabled && !isLeadsWebhookEnabled && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
              メール通知(RESEND_API_KEY)・Webhook通知(LEADS_WEBHOOK_URL)が未設定です。
              新しい相談が入ってもリアルタイムには気づけないため、設定を推奨します。
            </p>
          )}

          <p className="mt-4 text-xs text-slate-400">全 {leads.length} 件</p>

          <div className="mt-4 space-y-4">
            {leads.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
                まだ相談はありません。
              </p>
            )}

            {leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">{lead.companyName}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(lead.submittedAt).toLocaleString("ja-JP")}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.name} ／ {lead.email}
                </p>

                <div className="mt-2">
                  {lead.notificationStatus === "sent" && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      通知メール: 送信済み
                    </span>
                  )}
                  {lead.notificationStatus === "failed" && (
                    <span
                      className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700"
                      title={lead.notificationError ?? undefined}
                    >
                      通知メール: 送信失敗{lead.notificationError ? `（${lead.notificationError}）` : ""}
                    </span>
                  )}
                  {!lead.notificationStatus && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                      通知メール: 未送信
                    </span>
                  )}
                </div>
                {lead.message && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {lead.message}
                  </p>
                )}

                {lead.diagnosisSummary && (
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    削減時間 {lead.diagnosisSummary.totalAnnualHours.toLocaleString()}
                    時間／削減コスト {lead.diagnosisSummary.totalAnnualCost.toLocaleString()}
                    円／おすすめ度 {lead.diagnosisSummary.recommendationScore}
                    ／改善効果が高い業務: {lead.diagnosisSummary.topTasks.join("、")}
                  </div>
                )}

                {Object.keys(lead.utm).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(lead.utm).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>
    </main>
  );
}
