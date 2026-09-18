"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";
import { HostSettings } from "./HostSettings";
import type { GameSettings, Player, Room } from "@/lib/game/types";
import { DEFAULT_SETTINGS } from "@/lib/game/types";

interface LobbyProps {
  room: Room;
  players: Player[];
  playerId: string | null;
  isHost: boolean;
  onStart: () => Promise<void>;
  onSaveSettings: (s: Partial<GameSettings>) => Promise<void>;
}

export function Lobby({
  room,
  players,
  playerId,
  isHost,
  onStart,
  onSaveSettings,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const settings = { ...DEFAULT_SETTINGS, ...room.settings } as GameSettings;
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${room.code}`
      : `/room/${room.code}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Panel>
        <Label>Room</Label>
        <p className="mt-2 font-mono text-3xl tracking-widest text-paper">
          {room.code}
        </p>
        <Button className="mt-3 w-full" variant="secondary" onClick={copyLink}>
          {copied ? "Link copied" : "Copy room link"}
        </Button>
      </Panel>

      <Panel className="border-l-4 border-l-graphite">
        <Label>Discord</Label>
        <p className="mt-2 text-ash text-sm leading-relaxed">
          Start a voice channel, share this room link, and keep this page open
          for cards and the timer.
        </p>
      </Panel>

      <Panel>
        <Label>Players ({players.length})</Label>
        <ul className="mt-3 space-y-2">
          {players
            .sort((a, b) => a.seat_order - b.seat_order)
            .map((p) => (
              <li
                key={p.id}
                className="flex justify-between text-paper border-b border-graphite pb-2 last:border-0"
              >
                <span>
                  {p.display_name}
                  {p.id === playerId && " (you)"}
                  {p.id === room.host_player_id && " · host"}
                </span>
                <span className="text-ash text-sm">
                  {p.is_connected ? "online" : "away"}
                </span>
              </li>
            ))}
        </ul>
      </Panel>

      {isHost && (
        <>
          <HostSettings
            settings={settings}
            onSave={onSaveSettings}
          />
          <Button
            size="lg"
            className="w-full"
            onClick={onStart}
            disabled={players.length < 2}
          >
            Start game
          </Button>
          {players.length < 2 && (
            <p className="text-center text-ash text-sm">
              Need at least 2 players to start
            </p>
          )}
        </>
      )}

      {!isHost && (
        <Panel className="text-center">
          <p className="text-ash">Waiting for the host to start the game…</p>
        </Panel>
      )}
    </div>
  );
}
