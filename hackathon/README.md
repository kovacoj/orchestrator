# hackathon/ — Agentic Decision Lab / MarketTwin

A self-contained demo subsystem that lives next to `experiment-lab/`.
Pipeline:

```
synthetic seed (or live Apify, with cached-fixture fallback)
  → SQLite / Supabase
  → competitor-price analysis (median, IQR outliers, recommendation, confidence)
  → approval-only recommendation card
  + agent_logs timeline with model+role+reasoning per step
```

The three demo-visible elements (judges-eye view):

1. **Live recommendation card** — approve / reject from the dashboard.
2. **Real-time scrape feed** — n8n triggers a scrape; the dashboard shows it
   land in seconds.
3. **Agent log timeline** — every step tagged with model + role +
   reasoning_effort. Tells the "agentic and auditable" story.

## Provenance

This subsystem was scaffolded by `claude-opus-4-7` running as the orchestrator's
main agent. The five hackathon subagents (`apify-mcp-connectivity`,
`apify-actor-runner`, `data-cleaner`, `lab-ingestion`, `qa-reporter`) are
wired in `opencode.json` to use
`siemens-sdc-openai-responses/gpt-5.3-codex` with `reasoningEffort: medium`.
That wiring takes effect after an OpenCode restart; the artifact rows in
`agent_logs` written by this Python process are tagged
`claude-opus-4-7 (substitute)` for auditability.

## Quickstart (local, no external dependencies)

```bash
cd hackathon

# 1. Create venv + install
uv venv && uv pip install -e ".[test]"

# 2. Initialise SQLite schema + seed one scrape and analysis
make seed
# → 18 items normalised → 17 valid → 5 products analysed → 5 recommendations

# 3. Run the API
make api           # http://127.0.0.1:8001

# 4. In another shell: exercise the full pipeline via curl
make pipeline      # scrape → analyse → dashboard

# (optional) self-contained smoke test, no server
make smoke
```

## Endpoints

| Method | Path                                          | Purpose |
|-------:|-----------------------------------------------|---------|
| GET    | `/health`                                     | Backend + model provenance |
| POST   | `/scrapes/run`                                | Ingest one batch (synthetic / cached / apify) |
| GET    | `/scrape-runs`                                | Recent scrape runs |
| POST   | `/scrapes/{id}/analyze`                       | Run competitor-price analysis on a run |
| GET    | `/recommendations?status=pending`             | List recommendations |
| POST   | `/recommendations/{id}/decision`              | approve \| reject \| needs_review |
| GET    | `/agent-logs?limit=N`                         | Timeline rows |
| GET    | `/dashboard`                                  | KPIs + recent recs + scrape feed |

Interactive docs: `http://127.0.0.1:8001/docs`.

## n8n workflows (importable)

Files in `n8n/`, all tagged `hackathon`:

- `workflow_1_scheduled_scrape_synthetic.json` — every 5 min:
  POST `/scrapes/run` (cached) → IF succeeded → POST `/scrapes/{id}/analyze`
  → refresh `/dashboard`.
- `workflow_1b_scheduled_scrape_apify.json` — same shape, source=apify,
  every 15 min. Backend auto-falls-back to the cached fixture if Apify fails.
- `workflow_4_approval.json` — webhook `POST /hackathon/decide` that proxies
  to `POST /recommendations/{id}/decision`. Lets external systems make
  decisions with an n8n audit trail.

Import via n8n UI → ⋯ → Import from File.

## Supabase / frontend wiring

For the live dashboard demo:

1. Apply `schema.sql` in the Supabase SQL editor.
2. (Optional) Apply `seed/seed.sql` if you want pre-loaded synthetic rows.
3. Point the backend at Supabase: `export DATABASE_URL=postgresql://…` and
   install psycopg: `uv pip install -e ".[postgres]"`.
4. Use `frontend_handoff_prompt.md` as the build brief for the React frontend
   under `frontend/` (orchestrator-owned generation; no external MCP).
5. In the frontend build, set
   `VITE_MARKETWIN_API_URL=http://<host>:8001`.

Without Supabase, everything still works against the local SQLite file at
`hackathon/.data/marketwin.db`.

## Files

```
hackathon/
├── AGENTS.md                                    # subsystem rules (model contract, n8n scope)
├── README.md                                    # this file
├── DEMO.md                                      # 3-minute demo script
├── Makefile                                     # make seed / make api / make smoke
├── pyproject.toml
├── .env.example
├── schema.sql                                   # Postgres / Supabase
├── schema_sqlite.sql                            # local dev SQLite mirror
├── fixtures/apify_cached_response.json          # offline-fallback dataset
├── seed/                                        # (reserved for SQL seed exports)
├── api/
│   ├── main.py                                  # FastAPI app
│   ├── db.py                                    # SQLite/Postgres abstraction
│   ├── analysis.py                              # pure analysis engine
│   ├── apify_client.py                          # Apify wrapper with fallback
│   ├── normalize.py                             # raw → competitor_prices schema
│   ├── logger.py                                # agent_logs writer
│   └── models.py                                # Pydantic
├── n8n/                                         # importable workflow JSON
│   ├── workflow_1_scheduled_scrape_synthetic.json
│   ├── workflow_1b_scheduled_scrape_apify.json
│   └── workflow_4_approval.json
├── scripts/
│   ├── seed.py                                  # one-shot seed
│   └── smoke_test.py                            # in-process E2E check
└── frontend_handoff_prompt.md                  # frontend build brief
```

## Safety boundaries

- **Approval-only.** The system never modifies external prices, never sends
  emails, never auto-acts. Decisions are recorded in `recommendations.status`.
- **Apify capped.** `max_items ≤ 20` per run, enforced by the API model
  schema and by the n8n workflow inputs.
- **Offline fallback.** If Apify fails, the API records `mode: fallback` and
  uses `fixtures/apify_cached_response.json`. Logged in `agent_logs`.
- **No secrets in repo.** `.env` is read-denied by the root `opencode.json`;
  use `.env.example` as a template.
- **No mutation of `experiment-lab/`.** This subsystem is read-only against
  the submodule.
- **n8n scope.** Per `hackathon/AGENTS.md`, n8n MCP create/edit-workflow is
  allowed only for workflows tagged `hackathon`. The root `sf_*`-only
  restriction stays in force for Signal Foundry work.
