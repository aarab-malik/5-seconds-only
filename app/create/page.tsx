"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel, Label } from "@/components/ui/Panel";
import { setStoredPlayerId, setStoredRoomCode } from "@/lib/player-id";

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create room");

      setStoredPlayerId(data.playerId);
      setStoredRoomCode(data.code);
      router.push(`/room/${data.code}?host=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
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
        <h1 className="font-display text-3xl text-paper mt-4">Create game</h1>
        <p className="text-ash text-sm mt-2">You will be the host.</p>
      </div>

      <Panel>
        <Label>Your name</Label>
        <Input
          className="mt-2"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        {error && <p className="mt-2 text-sm text-brick">{error}</p>}
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={create}
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating…" : "Create room"}
        </Button>
      </Panel>
    </div>
  );
}
