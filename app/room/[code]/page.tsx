"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GameBoard } from "@/components/game/GameBoard";
import {
  getStoredPlayerId,
  getStoredRoomCode,
  setStoredPlayerId,
  setStoredRoomCode,
} from "@/lib/player-id";
import { normalizeRoomCode } from "@/lib/game/codes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = normalizeRoomCode(String(params.code ?? ""));
  const [playerId, setPlayerId] = useState<string | null>(() =>
    typeof window !== "undefined" ? getStoredPlayerId() : null,
  );
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getStoredPlayerId();
    const storedCode = getStoredRoomCode();
    if (stored && storedCode === code) {
      setPlayerId(stored);
    }
  }, [code]);

  const joinRoom = async () => {
    if (!name.trim()) return;
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim(),
          playerId: getStoredPlayerId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join");

      setStoredPlayerId(data.playerId);
      setStoredRoomCode(code);
      setPlayerId(data.playerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (!playerId) {
    const isHostRedirect = searchParams.get("host") === "1";
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/" className="text-ash text-sm hover:text-paper">
          ← Home
        </Link>
        <h1 className="font-display text-3xl text-paper">Room {code}</h1>
        {isHostRedirect ? (
          <Panel>
            <p className="text-ash text-sm">
              If you just created this room, refresh the page. Your session
              should load automatically.
            </p>
          </Panel>
        ) : (
          <Panel>
            <Label>Join this room</Label>
            <Input
              className="mt-2"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
            />
            {error && <p className="mt-2 text-sm text-brick">{error}</p>}
            <Button
              className="mt-4 w-full"
              onClick={joinRoom}
              disabled={joining || !name.trim()}
            >
              {joining ? "Joining…" : "Join"}
            </Button>
          </Panel>
        )}
      </div>
    );
  }

  return <GameBoard code={code} playerId={playerId} />;
}
