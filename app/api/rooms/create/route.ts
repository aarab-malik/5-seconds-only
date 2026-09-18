import { NextResponse } from "next/server";
import { generateRoomCode } from "@/lib/game/codes";
import { DEFAULT_SETTINGS } from "@/lib/game/types";
import { CreateRoomSchema } from "@/lib/game/messages";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase is not configured. Set environment variables." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = CreateRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = createAdminClient();
    let code = generateRoomCode();
    let attempts = 0;

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("code", code)
        .maybeSingle();

      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        code,
        settings: DEFAULT_SETTINGS,
        deck_seed: crypto.randomUUID(),
      })
      .select()
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: roomError?.message ?? "Failed to create room" },
        { status: 500 },
      );
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        display_name: parsed.data.displayName.trim(),
        seat_order: 0,
      })
      .select()
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: playerError?.message ?? "Failed to create player" },
        { status: 500 },
      );
    }

    await supabase
      .from("rooms")
      .update({ host_player_id: player.id })
      .eq("id", room.id);

    return NextResponse.json({
      code: room.code,
      playerId: player.id,
      roomId: room.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
