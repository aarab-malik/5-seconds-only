"use client";

import type { Player } from "@/lib/game/types";
import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";

interface GameOverProps {
  players: Player[];
  onRematch: () => Promise<void>;
  isHost: boolean;
}

export function GameOver({ players, onRematch, isHost }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie =
    sorted.length > 1 && sorted[0].score === sorted[1].score;

  return (
    <Panel className="text-center">
      <Label>Game over</Label>
      {isTie ? (
        <p className="mt-4 text-2xl text-paper font-display font-black">
          It&apos;s a tie!
        </p>
      ) : (
        <p className="mt-4 text-2xl text-paper font-display font-black">
          {winner?.display_name} wins!
        </p>
      )}
      <ul className="mt-6 space-y-2 text-left">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className="flex justify-between border-b border-graphite pb-2 text-paper"
          >
            <span>
              {i + 1}. {p.display_name}
            </span>
            <span className="font-mono">{p.score}</span>
          </li>
        ))}
      </ul>
      {isHost && (
        <Button className="mt-6 w-full" size="lg" onClick={onRematch}>
          Play again
        </Button>
      )}
    </Panel>
  );
}
