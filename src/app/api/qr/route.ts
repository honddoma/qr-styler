import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-client";
import type { QrStylePreset } from "@/lib/qr-presets";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const NAME_MAX_LENGTH = 60;

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const targetUrl = body?.targetUrl as string | undefined;
  const preset = (body?.preset as QrStylePreset | undefined) ?? "basic";
  const color = body?.color as string | undefined;
  const name = (body?.name as string | undefined)?.trim();

  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    return NextResponse.json({ error: "유효한 URL을 입력해주세요." }, { status: 400 });
  }
  if (color && !HEX_COLOR_RE.test(color)) {
    return NextResponse.json({ error: "색상 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (name && name.length > NAME_MAX_LENGTH) {
    return NextResponse.json({ error: `이름은 ${NAME_MAX_LENGTH}자 이내로 입력해주세요.` }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .rpc("create_qr_code", {
      p_target_url: targetUrl,
      p_preset: preset,
      p_color: color ?? null,
      p_name: name ?? null,
    })
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "QR 코드를 생성하지 못했습니다." }, { status: 500 });
  }

  const row = data as { slug: string; edit_token: string };
  return NextResponse.json({ slug: row.slug, editToken: row.edit_token });
}
