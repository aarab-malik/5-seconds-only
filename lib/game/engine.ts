import type { SupabaseClient } from "@supabase/supabase-js";
import { getDeck, filterDeck, getCardById, shuffleDeck } from "./deck-loader";
import type {
  CardSide,
  GameSettings,
  Player,
  Room,
  ScoreLogEntry,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";
import type { GameAction } from "./messages";
import { clamp } from "../utils";

const ANSWER_MS = 5500;
const deck = getDeck();

function nowIso() {
  return new Date().toISOString();
}

function phaseEndsAt(ms: number) {
  return new Date(Date.now() + ms).toISOString();
}

function sortedPlayers(players: Player[]) {
  return [...players].sort((a, b) => a.seat_order - b.seat_order);
}

function playerAtSeat(players: Player[], seat: number) {
  const sorted = sortedPlayers(players);
  if (sorted.length === 0) return undefined;
  return sorted[seat % sorted.length];
}

function nextSeat(seat: number, count: number) {
  return (seat + 1) % count;
}

function getFilteredDeck(settings: GameSettings) {
  return shuffleDeck(
    filterDeck(deck, {
      maxRating: settings.maxRating,
      enabledCategories: settings.enabledCategories,
      difficultyRange: settings.difficultyRange,
    }),
    "static",
  );
}

function pickCard(settings: GameSettings, seed: string, position: number) {
  const filtered = shuffleDeck(
    filterDeck(deck, {
      maxRating: settings.maxRating,
      enabledCategories: settings.enabledCategories,
      difficultyRange: settings.difficultyRange,
    }),
    seed,
  );
  if (filtered.length === 0) return null;
  return filtered[position % filtered.length];
}

async function loadRoom(
  supabase: SupabaseClient,
  code: string,
): Promise<{ room: Room; players: Player[] } | null> {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !room) return null;

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", room.id)
    .order("seat_order");

  return {
    room: room as Room,
    players: (players ?? []) as Player[],
  };
}

async function updateRoom(
  supabase: SupabaseClient,
  roomId: string,
  patch: Record<string, unknown>,
  expectedVersion?: number,
) {
  let query = supabase.from("rooms").update(patch).eq("id", roomId);
  if (expectedVersion !== undefined) {
    query = query.eq("version", expectedVersion);
  }
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return data as Room;
}

function appendScoreLog(
  room: Room,
  entry: ScoreLogEntry,
): ScoreLogEntry[] {
  const log = [...(room.score_log ?? [])];
  log.push(entry);
  return log.slice(-20);
}

async function setPlayerScore(
  supabase: SupabaseClient,
  playerId: string,
  score: number,
) {
  await supabase
    .from("players")
    .update({ score: clamp(score, 0, 999) })
    .eq("id", playerId);
}

function checkWinByPoints(room: Room, players: Player[], settings: GameSettings) {
  if (settings.winMode !== "points") return false;
  return players.some((p) => p.score >= settings.pointsToWin);
}

async function advanceQueue(
  supabase: SupabaseClient,
  room: Room,
  players: Player[],
) {
  const sorted = sortedPlayers(players);
  const count = sorted.length;
  const nextCursor = nextSeat(room.queue_cursor, count);
  const drawer = playerAtSeat(sorted, nextCursor);
  const hotSeat = playerAtSeat(sorted, nextSeat(nextCursor, count));

  const hotSeatTurns = room.round_number;
  const totalHotSeatTurnsNeeded = room.settings.totalRounds * count;

  if (hotSeatTurns >= totalHotSeatTurnsNeeded) {
    await updateRoom(supabase, room.id, {
      phase: "finished",
      status: "finished",
      version: room.version + 1,
    });
    return;
  }

  await updateRoom(supabase, room.id, {
    phase: "queue_ready",
    queue_cursor: nextCursor,
    drawer_player_id: drawer?.id ?? null,
    hot_seat_player_id: hotSeat?.id ?? null,
    current_draw_id: null,
    current_card_id: null,
    selected_side: null,
    revealed_prompt: null,
    attempted_player_ids: [],
    used_answers: [],
    steal_index: 0,
    phase_ends_at: null,
    version: room.version + 1,
  });
}

async function resolveSuccess(
  supabase: SupabaseClient,
  room: Room,
  players: Player[],
  winnerId: string,
) {
  const winner = players.find((p) => p.id === winnerId);
  if (winner) {
    await setPlayerScore(supabase, winnerId, winner.score + 1);
  }

  if (room.current_draw_id) {
    await supabase
      .from("turn_draws")
      .update({ resolved_at: nowIso() })
      .eq("id", room.current_draw_id);
  }

  const updatedPlayers = await supabase
    .from("players")
    .select("*")
    .eq("room_id", room.id);

  const freshPlayers = (updatedPlayers.data ?? []) as Player[];

  if (checkWinByPoints(room, freshPlayers, room.settings)) {
    await updateRoom(supabase, room.id, {
      phase: "finished",
      status: "finished",
      version: room.version + 1,
      phase_ends_at: null,
    });
    return;
  }

  await updateRoom(supabase, room.id, {
    phase: "scoring",
    round_number: room.round_number + 1,
    version: room.version + 1,
    phase_ends_at: null,
  });

  const { data: refreshed } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", room.id)
    .single();

  if (refreshed) {
    await advanceQueue(supabase, refreshed as Room, freshPlayers);
  }
}

async function moveToStealOrDefault(
  supabase: SupabaseClient,
  room: Room,
  players: Player[],
) {
  const sorted = sortedPlayers(players);
  const count = sorted.length;
  const attempted = new Set(room.attempted_player_ids ?? []);
  const originalHotSeat = room.hot_seat_player_id;

  let nextHotSeat: Player | undefined;
  const startIdx = sorted.findIndex((p) => p.id === room.hot_seat_player_id);

  for (let i = 1; i <= count; i++) {
    const candidate = sorted[(startIdx + i) % count];
    if (!attempted.has(candidate.id)) {
      nextHotSeat = candidate;
      break;
    }
  }

  if (!nextHotSeat || !room.settings.enableSteal) {
    if (originalHotSeat) {
      const orig = players.find((p) => p.id === originalHotSeat);
      if (orig) {
        await setPlayerScore(supabase, originalHotSeat, orig.score + 1);
      }
    }
    await resolveSuccess(supabase, room, players, originalHotSeat!);
    return;
  }

  const newAttempted = [...attempted, room.hot_seat_player_id!];

  await updateRoom(supabase, room.id, {
    phase: "steal",
    hot_seat_player_id: nextHotSeat.id,
    attempted_player_ids: newAttempted,
    steal_index: room.steal_index + 1,
    phase_ends_at: phaseEndsAt(ANSWER_MS),
    version: room.version + 1,
  });
}

export async function handleAdvance(
  supabase: SupabaseClient,
  code: string,
): Promise<{ ok: boolean; reason?: string }> {
  const loaded = await loadRoom(supabase, code);
  if (!loaded) return { ok: false, reason: "Room not found" };

  const { room, players } = loaded;

  if (!["answering", "steal"].includes(room.phase)) {
    return { ok: false, reason: "Not in timed phase" };
  }

  if (!room.phase_ends_at || new Date(room.phase_ends_at) > new Date()) {
    return { ok: false, reason: "Timer not expired" };
  }

  const attempted = [...(room.attempted_player_ids ?? [])];
  if (room.hot_seat_player_id && !attempted.includes(room.hot_seat_player_id)) {
    attempted.push(room.hot_seat_player_id);
  }

  const sorted = sortedPlayers(players);
  const count = sorted.length;
  const startIdx = sorted.findIndex((p) => p.id === room.hot_seat_player_id);
  let nextHotSeat: Player | undefined;

  for (let i = 1; i <= count; i++) {
    const candidate = sorted[(startIdx + i) % count];
    if (!attempted.includes(candidate.id)) {
      nextHotSeat = candidate;
      break;
    }
  }

  if (!nextHotSeat || !room.settings.enableSteal) {
    const originalHotSeat = sorted.find(
      (p) => p.id === (room.attempted_player_ids?.[0] ?? room.hot_seat_player_id),
    );
    const winnerId =
      originalHotSeat?.id ??
      room.hot_seat_player_id ??
      sorted[0]?.id;

    if (winnerId) {
      const winner = players.find((p) => p.id === winnerId);
      if (winner) {
        await setPlayerScore(supabase, winnerId, winner.score + 1);
      }
    }

    if (room.current_draw_id) {
      await supabase
        .from("turn_draws")
        .update({ resolved_at: nowIso() })
        .eq("id", room.current_draw_id);
    }

    const { data: freshPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id);

    await updateRoom(supabase, room.id, {
      phase: "scoring",
      round_number: room.round_number + 1,
      version: room.version + 1,
      phase_ends_at: null,
    }, room.version);

    const { data: refreshed } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", room.id)
      .single();

    if (refreshed) {
      await advanceQueue(
        supabase,
        refreshed as Room,
        (freshPlayers ?? []) as Player[],
      );
    }
    return { ok: true };
  }

  await updateRoom(
    supabase,
    room.id,
    {
      phase: "steal",
      hot_seat_player_id: nextHotSeat.id,
      attempted_player_ids: attempted,
      steal_index: room.steal_index + 1,
      phase_ends_at: phaseEndsAt(ANSWER_MS),
      version: room.version + 1,
    },
    room.version,
  );

  return { ok: true };
}

export async function handleAction(
  supabase: SupabaseClient,
  code: string,
  action: GameAction,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const loaded = await loadRoom(supabase, code);
  if (!loaded) return { ok: false, error: "Room not found" };

  const { room, players } = loaded;
  const actor = players.find((p) => p.id === action.playerId);
  if (!actor) return { ok: false, error: "Player not found" };

  const isHost = room.host_player_id === action.playerId;
  const settings = { ...DEFAULT_SETTINGS, ...room.settings } as GameSettings;

  switch (action.type) {
    case "UPDATE_SETTINGS": {
      if (!isHost) return { ok: false, error: "Host only" };
      if (room.status !== "lobby")
        return { ok: false, error: "Can only update settings in lobby" };
      const merged = { ...settings, ...action.settings } as GameSettings;
      await updateRoom(supabase, room.id, {
        settings: merged,
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "START_GAME": {
      if (!isHost) return { ok: false, error: "Host only" };
      if (players.length < 2)
        return { ok: false, error: "Need at least 2 players" };
      const sorted = sortedPlayers(players);
      const drawer = sorted[0];
      const hotSeat = sorted[1 % sorted.length];
      await updateRoom(supabase, room.id, {
        status: "playing",
        phase: "queue_ready",
        queue_cursor: 0,
        drawer_player_id: drawer.id,
        hot_seat_player_id: hotSeat.id,
        round_number: 0,
        deck_seed: room.id,
        deck_position: 0,
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "KICK_PLAYER": {
      if (!isHost) return { ok: false, error: "Host only" };
      await supabase.from("players").delete().eq("id", action.targetPlayerId);
      return { ok: true };
    }

    case "DRAW_CARD": {
      if (action.playerId !== room.drawer_player_id)
        return { ok: false, error: "Only drawer can draw" };
      if (!["queue_ready", "private_draw"].includes(room.phase))
        return { ok: false, error: "Cannot draw now" };

      const card = pickCard(settings, room.deck_seed, room.deck_position);
      if (!card) return { ok: false, error: "No cards available" };

      const { data: draw, error } = await supabase
        .from("turn_draws")
        .insert({
          room_id: room.id,
          card_id: card.id,
          drawer_player_id: action.playerId,
        })
        .select()
        .single();

      if (error || !draw) return { ok: false, error: "Failed to create draw" };

      await updateRoom(supabase, room.id, {
        phase: "private_draw",
        current_draw_id: draw.id,
        current_card_id: card.id,
        deck_position: room.deck_position + 1,
        version: room.version + 1,
      });

      return {
        ok: true,
        data: {
          drawId: draw.id,
          sideA: card.sideA,
          sideB: card.sideB,
        },
      };
    }

    case "REVEAL_CARD": {
      if (action.playerId !== room.drawer_player_id)
        return { ok: false, error: "Only drawer can reveal" };
      if (room.phase !== "private_draw")
        return { ok: false, error: "Not in private draw" };
      if (!room.current_card_id)
        return { ok: false, error: "No card drawn" };

      const card = getCardById(room.current_card_id);
      if (!card) return { ok: false, error: "Card not found" };

      const prompt =
        action.selectedSide === "side_a" ? card.sideA : card.sideB;

      await supabase
        .from("turn_draws")
        .update({
          selected_side: action.selectedSide,
          revealed_at: nowIso(),
        })
        .eq("id", room.current_draw_id!);

      const attempted = room.hot_seat_player_id
        ? [room.hot_seat_player_id]
        : [];

      await updateRoom(supabase, room.id, {
        phase: "answering",
        selected_side: action.selectedSide,
        revealed_prompt: prompt,
        attempted_player_ids: attempted,
        phase_ends_at: phaseEndsAt(ANSWER_MS),
        version: room.version + 1,
      });

      return { ok: true };
    }

    case "REPORT_SUCCESS": {
      if (action.playerId !== room.hot_seat_player_id)
        return { ok: false, error: "Only hot seat can report" };
      if (!["answering", "steal"].includes(room.phase))
        return { ok: false, error: "Not answering" };
      await resolveSuccess(supabase, room, players, action.playerId);
      return { ok: true };
    }

    case "REPORT_FAIL": {
      if (action.playerId !== room.hot_seat_player_id)
        return { ok: false, error: "Only hot seat can report" };
      if (!["answering", "steal"].includes(room.phase))
        return { ok: false, error: "Not answering" };
      await moveToStealOrDefault(supabase, room, players);
      return { ok: true };
    }

    case "ADD_USED_ANSWERS": {
      const used = [...(room.used_answers ?? []), ...action.answers];
      await updateRoom(supabase, room.id, {
        used_answers: used,
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "HOST_AWARD_POINT": {
      if (!isHost) return { ok: false, error: "Host only" };
      const targetId = action.targetPlayerId ?? room.hot_seat_player_id;
      if (!targetId) return { ok: false, error: "No target" };
      await resolveSuccess(supabase, room, players, targetId);
      return { ok: true };
    }

    case "HOST_DENY": {
      if (!isHost) return { ok: false, error: "Host only" };
      await moveToStealOrDefault(supabase, room, players);
      return { ok: true };
    }

    case "HOST_SKIP": {
      if (!isHost) return { ok: false, error: "Host only" };
      await advanceQueue(supabase, room, players);
      return { ok: true };
    }

    case "HOST_FORCE_STEAL": {
      if (!isHost) return { ok: false, error: "Host only" };
      await moveToStealOrDefault(supabase, room, players);
      return { ok: true };
    }

    case "HOST_SKIP_DRAW": {
      if (!isHost) return { ok: false, error: "Host only" };
      await advanceQueue(supabase, room, players);
      return { ok: true };
    }

    case "HOST_FORCE_REVEAL": {
      if (!isHost) return { ok: false, error: "Host only" };
      if (!room.current_card_id)
        return { ok: false, error: "No card" };
      const card = getCardById(room.current_card_id);
      if (!card) return { ok: false, error: "Card not found" };
      const side = action.selectedSide ?? "side_a";
      const prompt = side === "side_a" ? card.sideA : card.sideB;
      await updateRoom(supabase, room.id, {
        phase: "answering",
        selected_side: side,
        revealed_prompt: prompt,
        attempted_player_ids: room.hot_seat_player_id
          ? [room.hot_seat_player_id]
          : [],
        phase_ends_at: phaseEndsAt(ANSWER_MS),
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "HOST_ADJUST_SCORE": {
      if (!isHost) return { ok: false, error: "Host only" };
      const target = players.find((p) => p.id === action.targetPlayerId);
      if (!target) return { ok: false, error: "Target not found" };
      const newScore = clamp(target.score + action.delta, 0, 999);
      await setPlayerScore(supabase, target.id, newScore);
      await updateRoom(supabase, room.id, {
        score_log: appendScoreLog(room, {
          at: nowIso(),
          hostPlayerId: action.playerId,
          targetPlayerId: target.id,
          oldScore: target.score,
          newScore,
        }),
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "HOST_SET_SCORE": {
      if (!isHost) return { ok: false, error: "Host only" };
      const target = players.find((p) => p.id === action.targetPlayerId);
      if (!target) return { ok: false, error: "Target not found" };
      const newScore = clamp(action.score, 0, 999);
      await setPlayerScore(supabase, target.id, newScore);
      await updateRoom(supabase, room.id, {
        score_log: appendScoreLog(room, {
          at: nowIso(),
          hostPlayerId: action.playerId,
          targetPlayerId: target.id,
          oldScore: target.score,
          newScore,
        }),
        version: room.version + 1,
      });
      return { ok: true };
    }

    case "HOST_RESET_SCORES": {
      if (!isHost) return { ok: false, error: "Host only" };
      for (const p of players) {
        await setPlayerScore(supabase, p.id, 0);
      }
      return { ok: true };
    }

    case "REMATCH": {
      if (!isHost) return { ok: false, error: "Host only" };
      for (const p of players) {
        await setPlayerScore(supabase, p.id, 0);
      }
      const sorted = sortedPlayers(players);
      await updateRoom(supabase, room.id, {
        status: "lobby",
        phase: "lobby",
        round_number: 0,
        queue_cursor: 0,
        deck_position: 0,
        revealed_prompt: null,
        current_draw_id: null,
        current_card_id: null,
        version: room.version + 1,
        drawer_player_id: sorted[0]?.id ?? null,
        hot_seat_player_id: sorted[1]?.id ?? null,
      });
      return { ok: true };
    }

    case "LEAVE": {
      await supabase.from("players").delete().eq("id", action.playerId);
      return { ok: true };
    }

    default:
      return { ok: false, error: "Unknown action" };
  }
}

export async function getPrivateDraw(
  supabase: SupabaseClient,
  code: string,
  playerId: string,
) {
  const loaded = await loadRoom(supabase, code);
  if (!loaded) return null;

  const { room } = loaded;
  if (room.drawer_player_id !== playerId) return null;
  if (!room.current_card_id) return null;

  const card = getCardById(room.current_card_id);
  if (!card) return null;

  return {
    drawId: room.current_draw_id,
    sideA: card.sideA,
    sideB: card.sideB,
    phase: room.phase,
  };
}

export { loadRoom, getFilteredDeck };
