# 5 Seconds Only

Online multiplayer party game built with **Next.js** and **Supabase Realtime**. Draw a two-sided card, read your question in Discord, reveal it to everyone, and name 3 answers in 5.5 seconds.

## Features

- Room codes — share a link and play with friends
- Private two-sided card draw — only the drawer sees both questions
- Server-synced 5.5-second timer
- Honor-system scoring with host override
- Host score editing (+/−, set exact, reset all)
- Steal attempts when a player fails
- Family through spicy (uncensored) card decks
- Mobile-responsive black/gray card-table UI

## Stack

- Next.js 16 (App Router)
- Supabase Postgres + Realtime
- Tailwind CSS 4
- Zustand + Zod

## Local setup

### 1. Clone and install

```bash
npm install
npm run build:deck
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)
3. Enable **Realtime** for `rooms` and `players`:
   - Database → Replication → add both tables to `supabase_realtime`
4. Copy your project URL and keys

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add the same environment variables (use your production URL for `NEXT_PUBLIC_APP_URL`)
4. Deploy

## How to play

1. **Host** creates a game and shares the room link
2. Players join on their phones
3. Start a **Discord voice channel** — this app handles cards and timer only
4. Each turn:
   - The **drawer** draws a card and picks Side A or Side B (private)
   - They **read the question aloud** in Discord
   - They click **Reveal card & start timer**
   - The **hot seat** (next player) names 3 answers in 5.5 seconds
   - Failed attempts pass to the next player (steal)
5. Most points after the configured rounds wins

## Smoke test checklist

- [ ] Create room on phone + join from laptop with code
- [ ] Drawer-only access to both prompt faces; others see waiting message
- [ ] Drawer reads in Discord, clicks Reveal, 5.5s timer starts for all
- [ ] Timer sync within ~200ms; no duplicate timer after reveal
- [ ] Failed attempt moves to next player with fresh 5.5s
- [ ] Queue rotates: P1 draws → P2 answers → P3 steals, etc.
- [ ] Honor buttons work; host override works
- [ ] Host can edit scores (+/−, set exact, reset all)
- [ ] Rematch returns to lobby

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:deck` | Generate card deck JSON |
| `npm run validate:cards` | Validate card deck |

## Project structure

```
app/              Next.js pages and API routes
components/game/  Game UI components
lib/game/         Types, engine, deck logic
lib/supabase/     Supabase clients and hooks
content/          Card data, schema, build scripts
supabase/         Database migrations
```

## License

Original card content only. Game mechanic inspired by party trivia games; not affiliated with any commercial board game publisher.
