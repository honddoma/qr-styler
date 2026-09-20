import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("resolve_qr_code", { p_slug: slug });

  if (error || !data) {
    return NextResponse.redirect(new URL("/?error=qr-not-found", request.url));
  }

  return NextResponse.redirect(data as string, { status: 302 });
}
