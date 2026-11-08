import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin.server";

// Supabaseの無料プランは、1週間アクセスがないと一時停止される。
// Vercel Cronから1日1回このエンドポイントを呼び、leadsテーブルへ軽い問い合わせを送って停止を防ぐ。
// 返すのは成否だけ（件数などの中身は返さない）。
// CRON_SECRET が設定されている場合は、Vercel Cronが付ける Authorization ヘッダーを確認する。
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const { error } = await supabase.from("leads").select("id", { count: "exact", head: true });
  if (error) {
    console.error("[api/keepalive] Supabaseへの問い合わせに失敗しました:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
