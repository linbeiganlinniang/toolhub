import { NextRequest, NextResponse } from "next/server";

// Supabase Auth 回调处理
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/forum";

  if (code) {
    // 让客户端处理 code 交换
    const redirectUrl = `${origin}/auth/callback?code=${code}&next=${next}`;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(`${origin}/forum`);
}
