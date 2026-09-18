import { NextResponse } from "next/server";
import { normalizeRoomCode } from "@/lib/game/codes";
import { getPrivateDraw } from "@/lib/game/engine";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { code: rawCode } = await params;
    const code = normalizeRoomCode(rawCode);
    const playerId = request.headers.get("x-player-id");

    if (!playerId) {
      return NextResponse.json({ error: "Missing player id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const draw = await getPrivateDraw(supabase, code, playerId);

    if (!draw) {
      return NextResponse.json({ error: "No private draw" }, { status: 404 });
    }

    return NextResponse.json(draw);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
