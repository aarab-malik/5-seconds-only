import { z } from "zod";

export const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("UPDATE_SETTINGS"),
    playerId: z.string().uuid(),
    settings: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal("START_GAME"),
    playerId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("KICK_PLAYER"),
    playerId: z.string().uuid(),
    targetPlayerId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("DRAW_CARD"),
    playerId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("REVEAL_CARD"),
    playerId: z.string().uuid(),
    selectedSide: z.enum(["side_a", "side_b"]),
  }),
  z.object({
    type: z.literal("REPORT_SUCCESS"),
    playerId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("REPORT_FAIL"),
    playerId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("ADD_USED_ANSWERS"),
    playerId: z.string().uuid(),
    answers: z.array(z.string()),
  }),
  z.object({
    type: z.literal("HOST_AWARD_POINT"),
    playerId: z.string().uuid(),
    targetPlayerId: z.string().uuid().optional(),
  }),
  z.object({ type: z.literal("HOST_DENY"), playerId: z.string().uuid() }),
  z.object({ type: z.literal("HOST_SKIP"), playerId: z.string().uuid() }),
  z.object({ type: z.literal("HOST_FORCE_STEAL"), playerId: z.string().uuid() }),
  z.object({ type: z.literal("HOST_SKIP_DRAW"), playerId: z.string().uuid() }),
  z.object({
    type: z.literal("HOST_FORCE_REVEAL"),
    playerId: z.string().uuid(),
    selectedSide: z.enum(["side_a", "side_b"]).optional(),
  }),
  z.object({
    type: z.literal("HOST_ADJUST_SCORE"),
    playerId: z.string().uuid(),
    targetPlayerId: z.string().uuid(),
    delta: z.number().int(),
  }),
  z.object({
    type: z.literal("HOST_SET_SCORE"),
    playerId: z.string().uuid(),
    targetPlayerId: z.string().uuid(),
    score: z.number().int().min(0).max(999),
  }),
  z.object({
    type: z.literal("HOST_RESET_SCORES"),
    playerId: z.string().uuid(),
  }),
  z.object({ type: z.literal("REMATCH"), playerId: z.string().uuid() }),
  z.object({ type: z.literal("LEAVE"), playerId: z.string().uuid() }),
]);

export type GameAction = z.infer<typeof ActionSchema>;

export type ClientGameAction = {
  [K in GameAction["type"]]: Omit<
    Extract<GameAction, { type: K }>,
    "playerId"
  >;
}[GameAction["type"]];

export const CreateRoomSchema = z.object({
  displayName: z.string().min(1).max(24),
});

export const JoinRoomSchema = z.object({
  displayName: z.string().min(1).max(24),
  playerId: z.string().uuid().optional(),
});

export const AdvanceSchema = z.object({
  playerId: z.string().uuid().optional(),
});
