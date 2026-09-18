"use client";

import { useCallback, useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { DEFAULT_SETTINGS } from "@/lib/game/types";
import type { GameSettings } from "@/lib/game/types";
import { useGameRoom } from "@/lib/supabase/useGameRoom";
import { Lobby } from "./Lobby";
import { QueueStrip } from "./QueueStrip";
import { DrawCardStage } from "./DrawCardStage";
import { RevealCardButton } from "./RevealCardButton";
import { PromptCard } from "./PromptCard";
import { TimerRing } from "./TimerRing";
import { HonorButtons } from "./HonorButtons";
import { StealPanel } from "./StealPanel";
import { HostOverride } from "./HostOverride";
import { Scoreboard } from "./Scoreboard";
import { GameOver } from "./GameOver";
import { toast } from "sonner";

interface GameBoardProps {
  code: string;
  playerId: string;
}

export function GameBoard({ code, playerId }: GameBoardProps) {
  const room = useGameStore((s) => s.room);
  const players = useGameStore((s) => s.players);
  const privateDraw = useGameStore((s) => s.privateDraw);
  const setPrivateDraw = useGameStore((s) => s.setPrivateDraw);
  const connected = useGameStore((s) => s.connected);
  const { sendAction } = useGameRoom(code, playerId);
  const [loading, setLoading] = useState(false);

  const isHost = room?.host_player_id === playerId;
  const isDrawer = room?.drawer_player_id === playerId;
  const isHotSeat = room?.hot_seat_player_id === playerId;
  const settings = { ...DEFAULT_SETTINGS, ...room?.settings } as GameSettings;

  const act = useCallback(
    async (fn: () => Promise<unknown>) => {
      setLoading(true);
      try {
        await fn();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  if (!room) {
    return (
      <div className="text-center text-ash py-12">Loading room…</div>
    );
  }

  const selectedPrompt =
    privateDraw?.selectedSide === "side_a"
      ? privateDraw.sideA
      : privateDraw?.selectedSide === "side_b"
        ? privateDraw.sideB
        : null;

  const timerActive = ["answering", "steal"].includes(room.phase);

  const drawerName =
    players.find((p) => p.id === room.drawer_player_id)?.display_name ??
    "Someone";

  return (
    <div className="space-y-4">
      {!connected && (
        <div className="rounded border border-brick bg-charcoal px-4 py-2 text-sm text-paper">
          Connection lost — reconnecting…
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-ash">
        <span>Room {room.code}</span>
        <span>Round {room.round_number + 1}</span>
      </div>

      {room.phase === "lobby" && (
        <Lobby
          room={room}
          players={players}
          playerId={playerId}
          isHost={isHost}
          onStart={() => act(() => sendAction({ type: "START_GAME" }))}
          onSaveSettings={(s) =>
            act(() => sendAction({ type: "UPDATE_SETTINGS", settings: s }))
          }
        />
      )}

      {room.status === "playing" && room.phase !== "lobby" && (
        <>
          <QueueStrip room={room} players={players} playerId={playerId} />

          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <div className="space-y-4">
              {isDrawer &&
                ["queue_ready", "private_draw"].includes(room.phase) && (
                  <>
                    <DrawCardStage
                      loading={loading}
                      onDraw={() =>
                        act(() => sendAction({ type: "DRAW_CARD" }))
                      }
                      onSelectSide={(side) =>
                        setPrivateDraw(
                          privateDraw
                            ? { ...privateDraw, selectedSide: side }
                            : null,
                        )
                      }
                    />
                    {room.phase === "private_draw" && privateDraw && (
                      <RevealCardButton
                        selectedPrompt={selectedPrompt}
                        loading={loading}
                        disabled={!privateDraw.selectedSide}
                        onReveal={() =>
                          act(() =>
                            sendAction({
                              type: "REVEAL_CARD",
                              selectedSide: privateDraw.selectedSide!,
                            }),
                          )
                        }
                      />
                    )}
                  </>
                )}

              {!isDrawer &&
                ["queue_ready", "private_draw"].includes(room.phase) && (
                  <PromptCard
                    prompt={null}
                    waitingMessage={`${drawerName} is choosing a question…`}
                  />
                )}

              {room.revealed_prompt && (
                <PromptCard prompt={room.revealed_prompt} />
              )}

              <div className="flex justify-center py-2">
                <TimerRing
                  phaseEndsAt={room.phase_ends_at}
                  active={timerActive}
                />
              </div>

              {isHotSeat && timerActive && (
                <HonorButtons
                  loading={loading}
                  onSuccess={() =>
                    act(() => sendAction({ type: "REPORT_SUCCESS" }))
                  }
                  onFail={() =>
                    act(() => sendAction({ type: "REPORT_FAIL" }))
                  }
                />
              )}

              <StealPanel usedAnswers={room.used_answers ?? []} />

              {isHost && (
                <HostOverride
                  visible={room.status === "playing"}
                  onAward={() =>
                    act(() => sendAction({ type: "HOST_AWARD_POINT" }))
                  }
                  onDeny={() =>
                    act(() => sendAction({ type: "HOST_DENY" }))
                  }
                  onSkip={() =>
                    act(() => sendAction({ type: "HOST_SKIP" }))
                  }
                  onForceSteal={() =>
                    act(() => sendAction({ type: "HOST_FORCE_STEAL" }))
                  }
                  onSkipDraw={() =>
                    act(() => sendAction({ type: "HOST_SKIP_DRAW" }))
                  }
                />
              )}
            </div>

            <Scoreboard
              players={players}
              isHost={isHost}
              onAdjustScore={(id, delta) =>
                act(async () => {
                  await sendAction({
                    type: "HOST_ADJUST_SCORE",
                    targetPlayerId: id,
                    delta,
                  });
                  toast.message("Host updated scores");
                })
              }
              onSetScore={(id, score) =>
                act(async () => {
                  await sendAction({
                    type: "HOST_SET_SCORE",
                    targetPlayerId: id,
                    score,
                  });
                  toast.message("Host updated scores");
                })
              }
              onResetScores={async () => {
                if (!window.confirm("Reset all scores to 0?")) return;
                await act(() => sendAction({ type: "HOST_RESET_SCORES" }));
              }}
            />
          </div>
        </>
      )}

      {room.phase === "finished" && (
        <GameOver
          players={players}
          isHost={isHost}
          onRematch={() => act(() => sendAction({ type: "REMATCH" }))}
        />
      )}
    </div>
  );
}
