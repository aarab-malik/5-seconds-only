import { NextResponse } from "next/server";
import { normalizeRoomCode } from "@/lib/game/codes";
import { ActionSchema } from "@/lib/game/messages";
import { handleAction } from "@/lib/game/engine";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { code: rawCode } = await params;
    const code = normalizeRoomCode(rawCode);
    const body = await request.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid action", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const result = await handleAction(supabase, code, parsed.data);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
