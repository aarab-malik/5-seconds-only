import { NextResponse } from "next/server";
import { normalizeRoomCode } from "@/lib/game/codes";
import { JoinRoomSchema } from "@/lib/game/messages";
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
    const parsed = JoinRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (parsed.data.playerId) {
      const { data: existing } = await supabase
        .from("players")
        .select("*")
        .eq("id", parsed.data.playerId)
        .eq("room_id", room.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("players")
          .update({ is_connected: true, last_seen_at: new Date().toISOString() })
          .eq("id", existing.id);

        return NextResponse.json({ playerId: existing.id, rejoined: true });
      }
    }

    const { data: allPlayers } = await supabase
      .from("players")
      .select("seat_order")
      .eq("room_id", room.id)
      .order("seat_order", { ascending: false });

    const maxSeat = allPlayers?.[0]?.seat_order ?? -1;
    const settings = room.settings as { maxPlayers?: number };

    if ((allPlayers?.length ?? 0) >= (settings.maxPlayers ?? 8)) {
      return NextResponse.json({ error: "Room is full" }, { status: 403 });
    }

    if (room.status !== "lobby") {
      return NextResponse.json(
        { error: "Game already in progress" },
        { status: 403 },
      );
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        display_name: parsed.data.displayName.trim(),
        seat_order: maxSeat + 1,
      })
      .select()
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: playerError?.message ?? "Failed to join" },
        { status: 500 },
      );
    }

    return NextResponse.json({ playerId: player.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
