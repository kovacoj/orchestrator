# DEMO.md — 3-minute MarketTwin walkthrough

Target: judges who have never seen the system. Goal: prove that an
**agentic, auditable, approval-gated** decision loop runs end-to-end on
real-looking competitor-price data, with a live UI.

## Pre-flight (do this before the demo starts)

```bash
cd hackathon
uv venv && uv pip install -e ".[test]"
make seed         # populates .data/marketwin.db with 1 run + 5 recs
make api          # window A — leave running on :8001
```

Then in a separate terminal:

```bash
# window B — n8n (assumes you already have n8n running locally)
# Import all three JSON files from hackathon/n8n/ via the n8n UI.
# Activate workflow_1_scheduled_scrape_synthetic.
```

React dashboard pointed at `VITE_MARKETWIN_API_URL=http://<host>:8001`,
open in the browser. Confirm KPIs render and you see 5 pending recs.

Two browser tabs:

- **Tab 1** — the React dashboard.
- **Tab 2** — `http://127.0.0.1:8001/agent-logs?limit=20` (raw JSON, big
  font). This is the "auditability" proof.

## The 3 minutes

### 0:00 — 0:30 — Frame the problem

> "Pricing teams react to competitor moves manually. They Slack each other
> screenshots. Decisions take days. We built an **agentic decision lab**
> that watches competitor prices, runs the same statistical analysis a
> pricing analyst would, and surfaces an approval-gated recommendation —
> with a full audit trail."

Show **Tab 1**, point at the three regions:
recommendation cards (left), scrape feed (middle), agent log timeline (right).

### 0:30 — 1:15 — Trigger a scrape from n8n

Switch to the n8n UI, click **Execute Workflow** on
`workflow_1_scheduled_scrape_synthetic`. Narrate:

> "n8n is our workflow runner. It hits our backend's `/scrapes/run`
> endpoint. The backend can call live Apify or use a cached fixture; for the
> demo we're using cached so we don't depend on Apify being up."

Switch back to **Tab 1**. Within a few seconds:
- a new row appears in **scrape feed** (status: succeeded, 18 rows),
- new entries appear at the top of the **agent log timeline**
  (scrape → normalize → analyze → recommend),
- the **recommendations** column refreshes with 5 cards.

### 1:15 — 2:00 — Walk one recommendation

Pick the Knipex pliers card:

> "Three competitors observed. Median 689 CZK, range 649–719, CV 0.04 — so
> the market is tight. Our current price is 719, 4.2% above median.
> Recommendation: match the median at 689. Confidence 0.99."

Click **Approve**. Card flips to status=approved.

Switch to **Tab 2** and refresh. Point at the new log row:

```json
{
  "step": "approve",
  "role": "qa-reporter",
  "model": "...",
  "reasoning_effort": "medium",
  "details": { "decision": "approve", "decided_by": "..." }
}
```

> "Every step is logged with which agent role made it and which model
> reasoned about it. That's the audit trail that makes this safe to put in
> front of a pricing team."

### 2:00 — 2:45 — The safety story

> "Three things make this demo-safe:
>
> 1. **Approval-only.** Nothing changes a real price. The system surfaces a
>    recommendation; a human approves or rejects.
> 2. **Cached fallback.** If Apify fails mid-demo, the backend records a
>    fallback and serves the fixture. The demo never breaks.
> 3. **Capped scrape.** Hard limit of 20 items per run, enforced in the API
>    schema and in the n8n workflow inputs."

Optional bonus: open the n8n **approval webhook** workflow
(`workflow_4_approval`) and curl it from the terminal:

```bash
curl -X POST http://localhost:5678/webhook/hackathon/decide \
  -H 'Content-Type: application/json' \
  -d '{"recommendation_id":"<id>","action":"reject","decided_by":"n8n-demo"}'
```

The rejection lands in the dashboard and the agent log.

### 2:45 — 3:00 — Close

> "Architecture: Apify for collection, n8n for orchestration, FastAPI +
> SQLite/Supabase for state, a pure-Python analysis engine for the
> recommendation, an orchestrator-owned React frontend for the UI. Five purpose-built subagent roles,
> each pinned to a specific model with a specific reasoning effort. Zero
> autonomous side effects. Full audit trail. Ready to plug a real Apify
> actor into a real Supabase project."

## If something goes wrong

| Symptom                          | Fix |
|----------------------------------|-----|
| Dashboard empty                  | `make seed` — re-seeds local DB |
| `/scrapes/run` 500s              | check `APIFY_MODE` — default `cached` is safe |
| n8n can't reach backend          | use `http://host.docker.internal:8001` from n8n containers |
| React dashboard shows CORS error | the API has `allow_origins=["*"]` — re-check `VITE_MARKETWIN_API_URL` |
| Need to reset everything         | `make clean && make seed` |

## Backup plan: no-UI demo

If the React dashboard / n8n are down, run the smoke test and narrate the output —
it walks the same pipeline and prints each stage:

```bash
make smoke
```
