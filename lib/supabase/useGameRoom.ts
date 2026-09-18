"use client";

import { useCallback, useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useGameStore } from "@/lib/game/store";
import type { Player, Room } from "@/lib/game/types";
import type { ClientGameAction } from "@/lib/game/messages";

export type GameActionInput = ClientGameAction;

export function useGameRoom(code: string, playerId: string | null) {
  const setRoom = useGameStore((s) => s.setRoom);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const setPlayerId = useGameStore((s) => s.setPlayerId);
  const setPrivateDraw = useGameStore((s) => s.setPrivateDraw);
  const setConnected = useGameStore((s) => s.setConnected);
  const room = useGameStore((s) => s.room);
  const advanceCalledRef = useRef(false);

  useEffect(() => {
    if (playerId) setPlayerId(playerId);
  }, [playerId, setPlayerId]);

  useEffect(() => {
    if (!code) return;

    let supabase: ReturnType<typeof createBrowserClient>;
    try {
      supabase = createBrowserClient();
    } catch {
      setConnected(false);
      return;
    }

    const fetchInitial = async () => {
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (roomData) {
        setRoom(roomData as Room);
        const { data: playersData } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomData.id)
          .order("seat_order");
        setPlayers((playersData ?? []) as Player[]);
      }
    };

    fetchInitial();

    const channel = supabase
      .channel(`room:${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${code.toUpperCase()}`,
        },
        (payload) => {
          if (payload.new) setRoom(payload.new as Room);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        async () => {
          const currentRoom = useGameStore.getState().room;
          if (!currentRoom) return;
          const { data } = await supabase
            .from("players")
            .select("*")
            .eq("room_id", currentRoom.id)
            .order("seat_order");
          setPlayers((data ?? []) as Player[]);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, setRoom, setPlayers, setConnected]);

  const fetchPrivateDraw = useCallback(async () => {
    if (!playerId) return;
    const res = await fetch(`/api/rooms/${code}/draw`, {
      headers: { "x-player-id": playerId },
    });
    if (res.ok) {
      const data = await res.json();
      setPrivateDraw({
        drawId: data.drawId,
        sideA: data.sideA,
        sideB: data.sideB,
        selectedSide: null,
      });
    }
  }, [code, playerId, setPrivateDraw]);

  useEffect(() => {
    if (!room || !playerId) return;
    if (
      room.drawer_player_id === playerId &&
      ["private_draw", "queue_ready"].includes(room.phase)
    ) {
      fetchPrivateDraw();
    }
  }, [room?.phase, room?.drawer_player_id, playerId, fetchPrivateDraw, room]);

  const sendAction = useCallback(
    async (action: GameActionInput) => {
      if (!playerId) throw new Error("No player id");
      const res = await fetch(`/api/rooms/${code}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...action, playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");

      if (action.type === "DRAW_CARD" && data.data) {
        setPrivateDraw({
          drawId: data.data.drawId,
          sideA: data.data.sideA,
          sideB: data.data.sideB,
          selectedSide: null,
        });
      }

      return data;
    },
    [code, playerId, setPrivateDraw],
  );

  useEffect(() => {
    if (!room?.phase_ends_at) {
      advanceCalledRef.current = false;
      return;
    }

    const check = () => {
      const ends = new Date(room.phase_ends_at!).getTime();
      if (Date.now() >= ends && !advanceCalledRef.current) {
        if (["answering", "steal"].includes(room.phase)) {
          advanceCalledRef.current = true;
          fetch(`/api/rooms/${code}/advance`, { method: "POST" });
        }
      }
    };

    const id = setInterval(check, 100);
    return () => clearInterval(id);
  }, [room?.phase_ends_at, room?.phase, code]);

  return { sendAction, fetchPrivateDraw };
}
