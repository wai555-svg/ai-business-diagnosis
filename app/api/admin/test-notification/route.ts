import { NextRequest, NextResponse } from "next/server";
import { getAdminAccessKey } from "@/lib/serverEnv";
import { sendTestNotificationEmail } from "@/lib/notify.server";

/**
 * 管理画面からのみ呼び出せる、通知メール送信のテスト用エンドポイント。
 * 認証なしで叩けないよう、/admin と同じCookie認証を要求する。
 */
export async function POST(req: NextRequest) {
  const expected = getAdminAccessKey();
  const authCookie = req.cookies.get("admin_auth")?.value;

  if (!expected || authCookie !== expected) {
    return NextResponse.json({ ok: false, message: "認証が必要です。" }, { status: 401 });
  }

  const result = await sendTestNotificationEmail();

  if (!result.ok) {
    console.error("[api/admin/test-notification] テスト通知メールの送信に失敗しました:", result.error);
    return NextResponse.json({ ok: false, message: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
