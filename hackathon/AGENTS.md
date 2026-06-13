# AGENTS.md — hackathon/ subsystem

This file scopes orchestrator agent rules for the **`hackathon/` subsystem only**.
It does NOT override the root `AGENTS.md` for Signal Foundry / experiment-lab work.

## What this subsystem is

The **Agentic Decision Lab / MarketTwin** demo:

```text
synthetic seed (fallback: cached Apify fixture, future: live Apify)
  → SQLite/Supabase competitor_prices
  → hackathon/api analysis (median, IQR outlier, recommendation, confidence)
  → recommendations table (approval-only)
  → Lovable dashboard (live) + agent_logs timeline
```

Built as a **parallel subsystem**. The `experiment-lab/` submodule is **read-only**
from here. No imports across the boundary.

## Subagent model contract

All subagents spawned for hackathon/ work MUST use:

```yaml
model: siemens-sdc-openai-responses/gpt-5.3-codex
reasoningEffort: medium
```

Wired in `opencode.json` for these subagents:
- `apify-mcp-connectivity`
- `apify-actor-runner`
- `data-cleaner`
- `lab-ingestion`
- `qa-reporter`

If the runtime cannot serve gpt-5.3-codex with reasoningEffort=medium, **stop and
report**. Do not silently substitute another model.

Every subagent report MUST start with:

```text
Model: gpt-5.3-codex / Reasoning: medium / Role: <name> / Status: ...
```

## GrillMe-as-discipline

Before scaffolding any new task in this subsystem (new scenario, new dashboard
page, new data source), the orchestrator MUST produce a structured execution
brief and confirm `ready_for_execution: true` before spawning subagents. The
brief lives inline in the chat — no separate Supabase table, no n8n intake
workflow (per scoping decision).

The brief must define: task_summary, locked_decisions, success_criteria,
constraints, non_goals, ready_for_execution.

Rule of thumb: ask only the questions whose answers would materially change
the architecture, data source, safety posture, or final deliverable quality.

## n8n MCP scope (SUBSYSTEM-ONLY EXPANSION)

The root `AGENTS.md` restricts n8n MCP to 5 whitelisted `sf_*` tools and
explicitly forbids "create arbitrary workflow / edit arbitrary workflow".

**Inside hackathon/, that restriction is relaxed** to the minimum needed:

Allowed n8n MCP capabilities for hackathon/ work:
- create workflow (only under tag/folder `hackathon`)
- update workflow (only those previously created under tag `hackathon`)
- read workflow definitions
- execute workflow manually
- read execution history

Still forbidden everywhere, including hackathon/:
- delete arbitrary workflows outside the `hackathon` tag
- read credentials (never)
- arbitrary email / Slack / Discord sending
- shell/filesystem access from inside n8n nodes
- modification of any workflow that does not carry the `hackathon` tag

The original `sf_*`-only restriction remains in force for Signal Foundry work.

## Hard rules (apply throughout)

- **No production writes.** Recommendations are approval-only; the system never
  changes real prices, never sends real emails, never modifies external state.
- **No hardcoded secrets.** Use `.env` (read-denied by root opencode.json).
- **Bounded runs.** Apify actors capped at `maxItems: 20` per scenario.
- **Offline-friendly.** If Apify fails, fall back to
  `hackathon/fixtures/apify_cached_response.json`. Record the fallback in
  `agent_logs`.
- **Do not modify `experiment-lab/`.** Read its CLI output if useful, never
  import its internals, never overwrite its `demo_data/` fixtures.
- **Provenance everywhere.** Every row in `agent_logs` carries `model`,
  `reasoning_effort`, `role`, `step`, and `details`. Every artifact file
  carries a frontmatter or header line with `Built by: <model>`.
- **Deterministic where possible.** Analysis engine uses fixed seeds and pure
  Polars/NumPy ops. No LLM calls inside the analysis path.

## Artifact layout

```
hackathon/
├── AGENTS.md                          # this file
├── README.md                          # what + how to run
├── DEMO.md                            # 3-minute demo script
├── Makefile                           # `make demo`, `make seed`, `make api`
├── pyproject.toml                     # uv-managed Python deps
├── .env.example                       # required env vars
├── schema.sql                         # Postgres / Supabase
├── schema_sqlite.sql                  # local dev SQLite (same column names)
├── seed/seed.sql                      # synthetic competitor data
├── fixtures/apify_cached_response.json
├── api/                               # FastAPI shim
│   ├── main.py                        # endpoints
│   ├── db.py                          # SQLite/Postgres abstraction
│   ├── analysis.py                    # competitor price analysis (pure)
│   ├── apify_client.py                # live Apify + cached fallback
│   ├── logger.py                      # agent_logs writer
│   └── models.py                      # Pydantic
├── n8n/                               # workflow JSON (importable)
│   ├── workflow_1_scheduled_scrape_synthetic.json
│   ├── workflow_1b_scheduled_scrape_apify.json
│   └── workflow_4_approval.json
└── lovable_prompt.md                  # narrowed Lovable build prompt
```
