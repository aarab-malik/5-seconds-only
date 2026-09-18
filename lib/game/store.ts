import { create } from "zustand";
import type { Player, Room } from "@/lib/game/types";

interface PrivateDraw {
  drawId: string | null;
  sideA: string;
  sideB: string;
  selectedSide: "side_a" | "side_b" | null;
}

interface GameStore {
  room: Room | null;
  players: Player[];
  playerId: string | null;
  privateDraw: PrivateDraw | null;
  clockOffset: number;
  connected: boolean;
  setRoom: (room: Room | null) => void;
  setPlayers: (players: Player[]) => void;
  setPlayerId: (id: string | null) => void;
  setPrivateDraw: (draw: PrivateDraw | null) => void;
  setClockOffset: (offset: number) => void;
  setConnected: (connected: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  players: [],
  playerId: null,
  privateDraw: null,
  clockOffset: 0,
  connected: true,
  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  setPlayerId: (playerId) => set({ playerId }),
  setPrivateDraw: (privateDraw) => set({ privateDraw }),
  setClockOffset: (clockOffset) => set({ clockOffset }),
  setConnected: (connected) => set({ connected }),
}));
