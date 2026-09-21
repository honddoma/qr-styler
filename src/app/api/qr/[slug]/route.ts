import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-client";

const NAME_MAX_LENGTH = 60;

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

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .rpc("get_qr_code_for_edit", { p_slug: slug, p_token: token })
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "찾을 수 없거나 권한이 없습니다." }, { status: 404 });
    }

    const row = data as {
      slug: string;
      target_url: string;
      preset: string;
      name: string | null;
      color: string | null;
      center_decoration: string | null;
      center_text: string | null;
    };
    return NextResponse.json({
      slug: row.slug,
      targetUrl: row.target_url,
      preset: row.preset,
      name: row.name,
      color: row.color,
      centerDecoration: row.center_decoration,
      centerText: row.center_text,
    });
  } catch (err) {
    console.error("GET /api/qr/[slug] failed:", err);
    return NextResponse.json({ error: "서버 설정 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const targetUrl = body?.targetUrl as string | undefined;
  const name = (body?.name as string | undefined)?.trim();

  if (!token) {
    return NextResponse.json({ error: "토큰이 필요합니다." }, { status: 401 });
  }
  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    return NextResponse.json({ error: "유효한 URL을 입력해주세요." }, { status: 400 });
  }
  if (name && name.length > NAME_MAX_LENGTH) {
    return NextResponse.json({ error: `이름은 ${NAME_MAX_LENGTH}자 이내로 입력해주세요.` }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("update_qr_code", {
      p_slug: slug,
      p_token: token,
      p_target_url: targetUrl,
      p_name: name ?? null,
    });

    if (error || !data) {
      return NextResponse.json({ error: "찾을 수 없거나 권한이 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/qr/[slug] failed:", err);
    return NextResponse.json({ error: "서버 설정 오류가 발생했습니다." }, { status: 500 });
  }
}
