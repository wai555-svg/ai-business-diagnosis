import { NextRequest, NextResponse } from "next/server";
import { appendEvent } from "@/lib/eventStorage.server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { name, params, utm, path: pagePath, ts } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await appendEvent({
    name,
    params: (params as Record<string, unknown>) ?? {},
    utm: (utm as Record<string, unknown>) ?? {},
    path: typeof pagePath === "string" ? pagePath : "",
    ts: typeof ts === "string" ? ts : new Date().toISOString(),
  });

  // 計測用エンドポイントのため、失敗してもクライアントには常に200を返す
  return NextResponse.json({ ok: true });
}
