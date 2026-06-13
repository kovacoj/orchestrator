# Lovable build prompt — Agentic Decision Lab / MarketTwin

> Paste this into Lovable to generate the dashboard. Tuned for the three
> demo-visible elements we locked in:
> 1. Live recommendation card (approve / reject)
> 2. Real-time scrape feed
> 3. Agent log timeline with model + role per step

---

## Prompt

Build a polished SaaS-style dashboard called **Agentic Decision Lab — MarketTwin**.

**Stack:** React + TypeScript + Tailwind + shadcn/ui + Recharts. Use the
`@supabase/supabase-js` client for realtime subscriptions (the schema is
already defined; see Connection below). Use Lucide icons.

**Layout:** single page, three columns on desktop, stacked on mobile.

### Column 1 — Recommendations (the headline)

A vertical stack of cards, newest at top. Each card shows:

- product name (large, semibold)
- a horizontal bar: `current_price` → arrow → `recommended_price` with the
  delta percentage as a colored pill (red if negative, green if positive)
- confidence as a 0–100% progress bar + numeric label
- the `reason` field as muted text below
- three action buttons: **Approve**, **Reject**, **Needs review**
  - clicking calls `POST /recommendations/{id}/decision` (see Connection)
  - on success the card animates to a settled state (color-coded by status,
    buttons replaced with "decided by {decided_by} at {decided_at}")
- if `status !== 'pending'`, render the card in the settled state immediately

Empty state: "No recommendations yet. Trigger a scrape to see live agent
output." with a button that calls `POST /scrapes/run` with body
`{"source":"cached","max_items":20}`.

### Column 2 — Scrape feed (the "live" proof)

A vertically scrolling list of recent scrape runs. Each row shows:

- a status pill: `running` (animated dot), `succeeded` (green), `failed`
  (red), `fallback_to_cache` (amber)
- source badge: `synthetic` | `cached` | `apify`
- `actor_id` truncated to ~28 chars
- relative time ("2m ago")
- row count
- duration in seconds (from `duration_seconds` view column)
- expand-on-click drawer with `metadata` JSON pretty-printed

At the top: a primary button **"Run scrape now"** that POSTs to
`/scrapes/run` (cached source) and shows a toast on completion. Also show
how often the n8n schedule fires (from settings.scrape_interval_seconds).

### Column 3 — Agent log timeline (the "agentic" proof)

Reverse-chronological timeline of `agent_log_timeline` rows. Each row:

- timestamp on the left (HH:MM:SS)
- step icon: scrape / normalize / analyze / recommend / approve / api_startup
- a one-line summary derived from `step` + `status` + `details`
- a small chip showing `model` and `reasoning_effort` (e.g.
  "gpt-5.3-codex · medium" or "claude-opus-4-7 (substitute) · medium")
- a chip showing `role` when present (e.g. "apify-actor-runner")
- expand-on-click reveals the raw `details` JSON

A small legend at the bottom explains the model chips so judges can see
that every step is auditable.

### Header KPI row (spans top of all three columns)

Five cards from `GET /dashboard` (the `kpis` block):

- Latest scrape status (+ source badge)
- Products tracked
- Competitors tracked
- Pending recommendations
- Average delta % (with colored arrow)

### Settings dialog (gear icon, top-right)

Form-edits the `settings` table values via direct Supabase upsert:

- scrape_interval_seconds (number)
- target_margin_pct (number)
- max_price_change_pct (number)
- apify_max_items (number, max 20)

Read-only display of `subagent_model` and `subagent_reasoning` (provenance
context — these are agent-runtime config, not user-editable).

---

## Connection

Two equally-valid wiring options. Pick one:

### Option A — Lovable talks to Supabase directly (preferred for live demo)

1. In Supabase, run `hackathon/schema.sql` then `hackathon/seed/seed.sql`
   (Lovable's Supabase integration can do both via the SQL editor).
2. The Lovable dashboard subscribes to:
   - `INSERT` / `UPDATE` on `recommendations` → refresh Column 1
   - `INSERT` / `UPDATE` on `scrape_runs` → refresh Column 2
   - `INSERT` on `agent_logs` → prepend to Column 3
3. Decision/scrape actions hit the backend at
   `${VITE_MARKETWIN_API_URL}/recommendations/{id}/decision` and
   `${VITE_MARKETWIN_API_URL}/scrapes/run` respectively. The backend
   handles the writes that Lovable then sees over realtime.

### Option B — Lovable talks only to the backend (simpler dev loop)

1. No Supabase needed; backend uses local SQLite.
2. Dashboard polls `GET /dashboard` every 5 seconds; or, if you wire it,
   subscribes to a small `/events` SSE stream from FastAPI.

Either way: NEVER let the dashboard change a real external price.
Approve/reject only updates the `recommendations.status` field.

---

## Design

- Dark theme by default; high-contrast cards on a deep neutral background.
- Loading: shimmer placeholders, not spinners, for cards.
- Empty states: a one-line hint + a primary action button.
- Color tokens:
  - approved → emerald
  - rejected → rose
  - needs_review → amber
  - pending → indigo
  - running → cyan with pulsing dot
- Typography: Inter for UI, JetBrains Mono for JSON drawers and model chips.
- The model chip is a key visual differentiator — make it small but always
  visible. The story is "every step is tagged by which agent and model
  produced it."

---

## What NOT to build

- No user authentication (demo)
- No charts beyond what the cards/lists naturally show (do not add a price-
  over-time chart unless time remains)
- No e-mail sending, no Slack
- No autonomous "auto-approve" toggle. Approval-only is the headline.
