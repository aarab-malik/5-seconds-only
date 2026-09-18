export type GamePhase =
  | "lobby"
  | "queue_ready"
  | "private_draw"
  | "answering"
  | "steal"
  | "scoring"
  | "finished";

export type RoomStatus = "lobby" | "playing" | "finished";

export type CardRating = "family" | "teen" | "adult" | "spicy";

export type CardSide = "side_a" | "side_b";

export interface GameSettings {
  answerSeconds: 5.5;
  totalRounds: number;
  maxPlayers: number;
  maxRating: CardRating;
  enabledCategories: string[];
  difficultyRange: [number, number];
  winMode: "rounds" | "points";
  pointsToWin: number;
  enableSteal: boolean;
  autoStartTimer: true;
  autoWinOnScoreEdit: boolean;
  spicyConfirmed: boolean;
}

export interface GameCard {
  id: string;
  sideA: string;
  sideB: string;
  category: string;
  rating: CardRating;
  difficulty: number;
  tags: string[];
  enabled: boolean;
}

export interface ScoreLogEntry {
  at: string;
  hostPlayerId: string;
  targetPlayerId: string;
  oldScore: number;
  newScore: number;
}

export interface Room {
  id: string;
  code: string;
  host_player_id: string;
  status: RoomStatus;
  phase: GamePhase;
  phase_ends_at: string | null;
  version: number;
  settings: GameSettings;
  current_draw_id: string | null;
  current_card_id: string | null;
  selected_side: CardSide | null;
  revealed_prompt: string | null;
  drawer_player_id: string | null;
  hot_seat_player_id: string | null;
  queue_cursor: number;
  steal_index: number;
  attempted_player_ids: string[];
  used_answers: string[];
  round_number: number;
  deck_seed: string;
  deck_position: number;
  score_log: ScoreLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  display_name: string;
  seat_order: number;
  score: number;
  is_connected: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface TurnDraw {
  id: string;
  room_id: string;
  card_id: string;
  drawer_player_id: string;
  selected_side: CardSide | null;
  revealed_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  answerSeconds: 5.5,
  totalRounds: 3,
  maxPlayers: 8,
  maxRating: "family",
  enabledCategories: [
    "animals",
    "food",
    "sports",
    "geography",
    "holidays",
    "household",
    "school_work",
    "random",
  ],
  difficultyRange: [1, 5],
  winMode: "rounds",
  pointsToWin: 10,
  enableSteal: true,
  autoStartTimer: true,
  autoWinOnScoreEdit: true,
  spicyConfirmed: false,
};

export const ALL_CATEGORIES = [
  "animals",
  "food",
  "sports",
  "movies_tv",
  "music",
  "geography",
  "holidays",
  "household",
  "school_work",
  "science",
  "pop_culture",
  "random",
  "would_you_rather",
  "embarrassing",
  "dating",
  "party",
  "spicy",
  "adults_only",
  "crazy",
  "nsfw_adjacent",
] as const;

export const RATING_ORDER: CardRating[] = [
  "family",
  "teen",
  "adult",
  "spicy",
];
