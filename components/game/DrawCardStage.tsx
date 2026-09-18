"use client";

import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";
import { useGameStore } from "@/lib/game/store";
import { cn } from "@/lib/utils";

interface DrawCardStageProps {
  onDraw: () => Promise<void>;
  onSelectSide: (side: "side_a" | "side_b") => void;
  loading?: boolean;
}

export function DrawCardStage({
  onDraw,
  onSelectSide,
  loading,
}: DrawCardStageProps) {
  const privateDraw = useGameStore((s) => s.privateDraw);
  const room = useGameStore((s) => s.room);

  if (room?.phase === "queue_ready" && !privateDraw) {
    return (
      <Panel className="text-center">
        <Label>Step 1</Label>
        <p className="text-paper mt-2 mb-4">Draw a two-sided card</p>
        <Button size="lg" onClick={onDraw} disabled={loading}>
          Draw card
        </Button>
      </Panel>
    );
  }

  if (!privateDraw) return null;

  const selected = privateDraw.selectedSide;

  return (
    <Panel>
      <Label>Step 1 — Choose a side</Label>
      <p className="text-ash text-sm mt-2 mb-4">
        Pick the question you want. Only you can see both sides.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {(
          [
            { side: "side_a" as const, text: privateDraw.sideA },
            { side: "side_b" as const, text: privateDraw.sideB },
          ] as const
        ).map(({ side, text }) => (
          <button
            key={side}
            type="button"
            onClick={() => onSelectSide(side)}
            className={cn(
              "rounded-lg border-2 p-4 text-left transition-colors min-h-[120px]",
              selected === side
                ? "border-paper bg-paper text-ink"
                : "border-graphite bg-ink text-paper hover:border-ash",
            )}
          >
            <span className="text-xs font-mono uppercase text-ash block mb-2">
              {side === "side_a" ? "Side A" : "Side B"}
            </span>
            <span className="text-base md:text-lg font-semibold leading-snug">
              {text}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
