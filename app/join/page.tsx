"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel, Label } from "@/components/ui/Panel";
import { normalizeRoomCode } from "@/lib/game/codes";
import {
  getStoredPlayerId,
  setStoredPlayerId,
  setStoredRoomCode,
} from "@/lib/player-id";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const join = async () => {
    const normalized = normalizeRoomCode(code);
    if (!name.trim() || normalized.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${normalized}/join`, {
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
      setStoredRoomCode(normalized);
      router.push(`/room/${normalized}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <Link href="/" className="text-ash text-sm hover:text-paper">
          ← Back
        </Link>
        <h1 className="font-display text-3xl text-paper mt-4">Join game</h1>
        <p className="text-ash text-sm mt-2">Enter the 6-character room code.</p>
      </div>

      <Panel>
        <Label>Room code</Label>
        <Input
          className="mt-2 font-mono uppercase tracking-widest"
          placeholder="AB3K9P"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
        />
        <Label className="mt-4 block">Your name</Label>
        <Input
          className="mt-2"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          onKeyDown={(e) => e.key === "Enter" && join()}
        />
        {error && <p className="mt-2 text-sm text-brick">{error}</p>}
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={join}
          disabled={
            loading || !name.trim() || normalizeRoomCode(code).length !== 6
          }
        >
          {loading ? "Joining…" : "Join room"}
        </Button>
      </Panel>
    </div>
  );
}
