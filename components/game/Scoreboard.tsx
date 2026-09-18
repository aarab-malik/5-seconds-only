"use client";

import type { Player } from "@/lib/game/types";
import { HostScoreEditor } from "./HostScoreEditor";
import { Panel, Label } from "@/components/ui/Panel";

interface ScoreboardProps {
  players: Player[];
  isHost: boolean;
  onAdjustScore: (targetId: string, delta: number) => Promise<void>;
  onSetScore: (targetId: string, score: number) => Promise<void>;
  onResetScores: () => Promise<void>;
}

export function Scoreboard({
  players,
  isHost,
  onAdjustScore,
  onSetScore,
  onResetScores,
}: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <Panel>
      <Label>Scoreboard</Label>
      <ul className="mt-3 space-y-2">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 border-b border-graphite pb-2 last:border-0"
          >
            <span className="text-paper">{p.display_name}</span>
            {isHost ? (
              <HostScoreEditor
                score={p.score}
                onAdjust={(d) => onAdjustScore(p.id, d)}
                onSet={(s) => onSetScore(p.id, s)}
              />
            ) : (
              <span className="font-mono text-paper text-lg">{p.score}</span>
            )}
          </li>
        ))}
      </ul>
      {isHost && players.length > 0 && (
        <button
          type="button"
          onClick={onResetScores}
          className="mt-4 text-sm text-ash underline hover:text-paper"
        >
          Reset all scores
        </button>
      )}
    </Panel>
  );
}
