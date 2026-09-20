import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-client";

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "토큰이 필요합니다." }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .rpc("get_qr_code_for_edit", { p_slug: slug, p_token: token })
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "찾을 수 없거나 권한이 없습니다." }, { status: 404 });
  }

  const row = data as { slug: string; target_url: string; preset: string };
  return NextResponse.json({
    slug: row.slug,
    targetUrl: row.target_url,
    preset: row.preset,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const targetUrl = body?.targetUrl as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "토큰이 필요합니다." }, { status: 401 });
  }
  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    return NextResponse.json({ error: "유효한 URL을 입력해주세요." }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("update_qr_code_url", {
    p_slug: slug,
    p_token: token,
    p_target_url: targetUrl,
  });

  if (error || !data) {
    return NextResponse.json({ error: "찾을 수 없거나 권한이 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
