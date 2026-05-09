# Pick'em League App — Claude Code Context

You are helping build a **sports pick'em league management app** for a small, private group. Read this entire document before touching any code.

---

## What This App Does

A full-stack pick'em engine that lets a league commissioner manage weekly game slates and lets members submit picks against those games. After games finish, the app automatically resolves picks and tracks standings.

**Core loop:**
1. Admin syncs upcoming NBA/NHL games from The Odds API into a weekly slate
2. Members log in and submit their picks before the deadline
3. After games finish, picks are auto-resolved and the leaderboard updates

**Pick types supported:**
- Moneyline (home / away)
- Against the spread (home -3.5 / away +3.5)
- Over/Under totals

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vue 3 + Vuetify (existing template — do not swap frameworks) |
| Backend / DB | Supabase (Postgres + Auth + Edge Functions + Realtime) |
| Sports data | The Odds API (NBA + NHL games, scores, spreads, totals) |
| Deployment | Supabase-hosted edge functions; frontend via static host (TBD) |

---

## Database Schema

The migration has already been run. Here are the tables:

### `public.users`
| column | type | notes |
|---|---|---|
| id | uuid PK | mirrors `auth.users.id` |
| display_name | text | |
| email | text | unique |
| role | enum `user_role` | `admin` or `member` |
| created_at | timestamptz | |

### `public.weeks`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| label | text | e.g. "NBA Week 14 / NHL Week 11" |
| sport | enum `sport_type` | `nba` or `nhl` |
| pick_deadline | timestamptz | picks lock at this time |
| status | enum `week_status` | `open` → `locked` → `resolved` |
| created_at | timestamptz | |
| created_by | uuid FK → users | |

### `public.games`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| week_id | uuid FK → weeks | |
| sport | enum `sport_type` | |
| home_team | text | |
| away_team | text | |
| spread | numeric(5,1) | negative = home favored |
| total | numeric(5,1) | over/under line |
| odds_api_id | text | external ID for sync |
| game_time | timestamptz | |
| home_score | int | null until final |
| away_score | int | null until final |
| status | enum `game_status` | `scheduled`, `live`, `final` |

### `public.picks`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| game_id | uuid FK → games | |
| pick_type | enum `pick_type` | `moneyline`, `spread`, `total` |
| pick_value | enum `pick_value` | `home`, `away`, `over`, `under` |
| is_correct | boolean | null until week resolved |
| submitted_at | timestamptz | |

**Unique constraint:** `(user_id, game_id, pick_type)` — one pick per type per game per user.

### Enums
```sql
sport_type:  nba | nhl
week_status: open | locked | resolved
game_status: scheduled | live | final
pick_type:   moneyline | spread | total
pick_value:  home | away | over | under
user_role:   admin | member
```

---

## Row Level Security Rules

- **All authenticated users** can read `users`, `weeks`, `games`, `picks`
- **Members** can insert/update their own picks only while `weeks.status = 'open'` and `pick_deadline > now()`
- **Admins** have full write access to all tables
- A `is_admin()` helper function exists in the DB

---

## App Roles & Views

### Admin (commissioner)
- Sync upcoming games from The Odds API into a week
- Add / remove individual games from a slate
- Lock a week (prevent new picks)
- Resolve a week (score all picks, mark is_correct)
- View all members' picks

### Member
- View the current open week and its games
- Submit picks for each game (moneyline, spread, total — or any combo)
- Change picks until the deadline
- View their own pick history
- View the leaderboard / standings

---

## Key Business Rules

1. A pick can only be submitted while `weeks.status = 'open'` AND `now() < pick_deadline`
2. A member can pick any combination of pick types on a single game (e.g. moneyline + total, but not two moneylines)
3. Spread resolution: home team covers if `home_score - away_score > spread` (where spread is from home team's perspective, negative = favored)
4. Total resolution: `home_score + away_score > total` = over wins
5. Moneyline resolution: higher score wins; ties are a push (no result, `is_correct = null`)
6. Week resolution is triggered manually by the admin, not automatically

---

## What Exists Already

- Supabase project is live with the schema above
- Vue 3 + Vuetify default template is in place (do not eject or swap)
- Supabase JS client is configured
- Claude Code MCP client is connected to Supabase

## What Needs Building

Priority order:

1. **Supabase auth flow** — magic link login, session handling, role detection
2. **Game sync edge function** — hits The Odds API, upserts into `games` by `odds_api_id`
3. **Admin: week management** — create week, add/remove games, lock/resolve
4. **Member: picks submission UI** — card-per-game, pick toggles, deadline countdown
5. **Leaderboard** — ranked by correct picks, with weekly breakdown
6. **Score sync edge function** — polls The Odds API for final scores, updates `games`

---

## Conventions to Follow

- Use the Supabase JS client (`@supabase/supabase-js`) for all DB access — no raw fetch to PostgREST
- Use Vuetify components wherever possible — do not add a second UI library
- Store the current user + role in a Pinia store (`useAuthStore`)
- Edge functions live in `supabase/functions/` — one folder per function
- Never expose the Odds API key on the frontend — always call it from an edge function
- All timestamps are stored as UTC in the DB; format for display in local time on the client

---

## Environment Variables Needed

```
# Frontend (.env)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Edge functions (Supabase Vault or .env.local)
ODDS_API_KEY=
```

---

## The Odds API — Key Details

- Base URL: `https://api.the-odds-api.com/v4`
- Sports keys: `basketball_nba`, `icehockey_nhl`
- Relevant endpoint: `GET /sports/{sport}/odds?apiKey=...&regions=us&markets=h2h,spreads,totals`
- `h2h` = moneyline, `spreads` = ATS, `totals` = over/under
- Use `commence_time` for `game_time`, `id` for `odds_api_id`
- Rate limit: depends on plan — cache responses, don't poll every request

---

Start by confirming you've read this document and listing the first 3 files you plan to create or modify.
