import { NextRequest, NextResponse } from "next/server";
import { getAdminAccessKey } from "@/lib/serverEnv";

const COOKIE_NAME = "admin_auth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "不正なリクエストです。" }, { status: 400 });
  }

  const { password } = (body ?? {}) as Record<string, unknown>;
  const expected = getAdminAccessKey();

  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "管理画面は未設定です（ADMIN_ACCESS_KEYを設定してください）。" },
      { status: 503 }
    );
  }

  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ ok: false, message: "パスワードが違います。" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
  });
  return res;
}
