-- 5 Seconds Only — initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  host_player_id uuid,
  status text NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
  phase text NOT NULL DEFAULT 'lobby' CHECK (
    phase IN ('lobby', 'queue_ready', 'private_draw', 'answering', 'steal', 'scoring', 'finished')
  ),
  phase_ends_at timestamptz,
  version int NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_draw_id uuid,
  current_card_id text,
  selected_side text CHECK (selected_side IN ('side_a', 'side_b')),
  revealed_prompt text,
  drawer_player_id uuid,
  hot_seat_player_id uuid,
  queue_cursor int NOT NULL DEFAULT 0,
  steal_index int NOT NULL DEFAULT 0,
  attempted_player_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  used_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  round_number int NOT NULL DEFAULT 0,
  deck_seed text NOT NULL DEFAULT '',
  deck_position int NOT NULL DEFAULT 0,
  score_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  seat_order int NOT NULL DEFAULT 0,
  score int NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 999),
  is_connected boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE turn_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  drawer_player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  selected_side text CHECK (selected_side IN ('side_a', 'side_b')),
  revealed_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms
  ADD CONSTRAINT rooms_host_player_fk
  FOREIGN KEY (host_player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE rooms
  ADD CONSTRAINT rooms_drawer_player_fk
  FOREIGN KEY (drawer_player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE rooms
  ADD CONSTRAINT rooms_hot_seat_player_fk
  FOREIGN KEY (hot_seat_player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE rooms
  ADD CONSTRAINT rooms_current_draw_fk
  FOREIGN KEY (current_draw_id) REFERENCES turn_draws(id) ON DELETE SET NULL;

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_turn_draws_room_id ON turn_draws(room_id);

-- RLS: public read for rooms and players; no direct client writes
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE turn_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY rooms_select ON rooms FOR SELECT USING (true);
CREATE POLICY players_select ON players FOR SELECT USING (true);

-- turn_draws: no public select (drawer gets data via API only)

-- Realtime publication (run in Supabase dashboard if needed):
-- ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
-- ALTER PUBLICATION supabase_realtime ADD TABLE players;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
