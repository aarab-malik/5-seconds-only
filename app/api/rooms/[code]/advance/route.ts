import { NextResponse } from "next/server";
import { normalizeRoomCode } from "@/lib/game/codes";
import { handleAdvance } from "@/lib/game/engine";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { code: rawCode } = await params;
    const code = normalizeRoomCode(rawCode);
    const supabase = createAdminClient();
    const result = await handleAdvance(supabase, code);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
