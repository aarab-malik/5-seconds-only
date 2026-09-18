const PLAYER_KEY = "5so_player_id";
const ROOM_KEY = "5so_room_code";

export function getStoredPlayerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PLAYER_KEY);
}

export function setStoredPlayerId(id: string) {
  localStorage.setItem(PLAYER_KEY, id);
}

export function getStoredRoomCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROOM_KEY);
}

export function setStoredRoomCode(code: string) {
  localStorage.setItem(ROOM_KEY, code.toUpperCase());
}

export function clearStoredSession() {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(ROOM_KEY);
}
