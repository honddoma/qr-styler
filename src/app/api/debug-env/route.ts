import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlPreview: url ? `${url.slice(0, 20)}...(len ${url.length})` : null,
    keyPreview: key ? `${key.slice(0, 12)}...(len ${key.length})` : null,
  });
}
