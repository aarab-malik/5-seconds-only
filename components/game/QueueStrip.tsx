"use client";

import type { Player, Room } from "@/lib/game/types";
import { cn } from "@/lib/utils";

interface QueueStripProps {
  room: Room;
  players: Player[];
  playerId: string | null;
}

export function QueueStrip({ room, players, playerId }: QueueStripProps) {
  const sorted = [...players].sort((a, b) => a.seat_order - b.seat_order);

  const drawer = sorted.find((p) => p.id === room.drawer_player_id);
  const hotSeat = sorted.find((p) => p.id === room.hot_seat_player_id);

  const phaseLabel = (() => {
    switch (room.phase) {
      case "lobby":
        return "Waiting in lobby";
      case "queue_ready":
        return "Ready to draw";
      case "private_draw":
        return drawer?.id === playerId
          ? "Your turn to choose a question"
          : `${drawer?.display_name ?? "Someone"} is choosing a question…`;
      case "answering":
      case "steal":
        return `${hotSeat?.display_name ?? "Player"} is answering`;
      case "scoring":
        return "Scoring turn";
      case "finished":
        return "Game over";
      default:
        return "";
    }
  })();

  return (
    <div className="border border-graphite rounded-lg bg-charcoal p-3 md:p-4">
      <p className="text-xs font-mono uppercase tracking-widest text-ash mb-3">
        Turn queue
      </p>
      <p className="text-paper text-sm mb-3">{phaseLabel}</p>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p) => {
          const isDrawer = p.id === room.drawer_player_id;
          const isHot = p.id === room.hot_seat_player_id;
          const isMe = p.id === playerId;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                isDrawer && "border-paper bg-[#2a2a2a] text-paper",
                isHot && !isDrawer && "border-brick text-paper",
                !isDrawer && !isHot && "border-graphite text-ash",
              )}
            >
              {p.display_name}
              {isMe && " (you)"}
              {isDrawer && " · reads"}
              {isHot && " · answers"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
