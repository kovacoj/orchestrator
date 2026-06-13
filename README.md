# Signal Foundry

Signal Foundry is an agentic business-signal monitoring system.

It combines internal company data, external web signals, scenario-specific research labs, local model inference, anomaly detection, workflow automation, and dynamic frontend dashboards.

The current project focuses on two demo scenarios:

1. **Multi-Location Business Reputation Monitor**
   A Miners Coffee-like Prague coffee chain monitors branch-level sentiment, complaints, competitor moves, peak-hour risk, and operational anomalies.

2. **Supply Chain Risk Monitor**
   A Czech agricultural drone manufacturer monitors chip lead times, battery cost pressure, shipping risk, supplier disruption, and production-stop probability.

The project is built around this core principle:

> Labs decide what is monitorable. The backend turns selected lab artifacts into prediction/anomaly/chart specs. n8n refreshes streams and triggers alerts. The frontend renders dynamic dashboards from backend chart specs.

---

## 1. High-Level Architecture

```text
opencode orchestrator
  ├── local skills
  │   └── experiment-lab skill
  │
  ├── MCP integrations
  │   ├── Apify MCP
  │   ├── n8n local MCP
  │   └── Lovable MCP
  │
  └── project rules
      ├── AGENTS.md
      ├── OPENCODE-SETUP.md
      └── skills/experiment-lab/SKILL.md
```

The intelligence pipeline is:

```text
internal user data stream
        +
Apify external data stream
        ↓
text normalization
        ↓
local sentiment model / rule extractors
        ↓
research labs
        ↓
lab selection + critic + ensembles
        ↓
prediction artifacts
        ↓
monitoring plan
        ↓
anomaly detection + alert policy
        ↓
decision cards + dynamic graph data
        ↓
frontend dashboard
```

n8n is not the intelligence layer. n8n is the workflow execution layer:

```text
n8n schedule/manual trigger
        ↓
optional Apify collection
        ↓
POST /sessions/{session_id}/refresh
        ↓
backend runs predictions/anomaly detection
        ↓
IF alert.should_notify == true
        ↓
notify user / write alert
```

---

## 2. Repository Layout

Current repository structure:

```text
.
├── AGENTS.md
├── OPENCODE-SETUP.md
├── demo_data_cafe.csv
├── docker-compose.yml
├── docs/
│   └── n8n-local-mcp.md
├── experiment-lab/
│   ├── AGENTS.md
│   ├── Dockerfile
│   ├── Makefile
│   ├── README.md
│   ├── app/
│   │   ├── agent_skills/
│   │   │   └── experiment_lab_cli.py
│   │   ├── demo_data/
│   │   ├── labs/
│   │   ├── modeling/
│   │   │   └── sentiment.py
│   │   ├── text_engine/
│   │   └── prototype/
│   ├── scripts/
│   │   ├── download_sentiment_model.py
│   │   ├── smoke_test_sentiment.py
│   │   └── test_apify_to_sentiment.py
│   ├── skills/
│   │   └── experiment-lab/
│   │       ├── SKILL.md
│   │       └── examples/
│   ├── tests/
│   ├── tmp/
│   │   └── sessions/
│   ├── pyproject.toml
│   └── uv.lock
├── opencode.json
├── opencode_lovable_connection.md
└── skills/
    └── experiment-lab/
        └── SKILL.md
```

---

## 3. Core Concepts

### 3.1 Local Skills

Local skills are deterministic project capabilities owned by this repo.

Current local skill:

```text
experiment-lab
```

It exposes the research lab engine to the opencode orchestrator through a stable CLI:

```bash
uv run python -m app.agent_skills.experiment_lab_cli list-scenarios

uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario reputation_monitor \
  --format json

uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario supply_chain_risk \
  --format json
```

Local skills should not call external services directly.

### 3.2 MCP Integrations

MCP integrations are external capabilities exposed to the opencode orchestrator.

Planned/current MCP integrations:

```text
Apify MCP      → external web/review/supplier data collection
n8n MCP        → workflow execution, refresh, scheduling, alert delivery
Lovable MCP    → frontend/dashboard generation
```

Hugging Face MCP is **not required** for the demo. Instead, the project uses a locally downloaded Hugging Face model for sentiment analysis.

### 3.3 Research Labs

Labs are scenario-specific analytical modules. They produce selected/warning/hidden/discarded/failed findings.

Labs should increasingly produce **prediction artifacts**, not only static reports.

Example prediction artifacts:

```text
location_sentiment_drop_v1
competitor_move_score_v1
peak_hour_service_risk_v1
chip_inventory_threshold_v1
production_stop_risk_v1
battery_cost_pressure_v1
shipping_delay_risk_v1
```

### 3.4 Monitoring Plan

A MonitoringPlan is generated from selected lab prediction artifacts.

It decides:

```text
which prediction artifacts are monitored
which metrics are refreshed
which charts are generated
which alert policies are active
how often each model should refresh
```

n8n should execute the MonitoringPlan, not define it.

### 3.5 DashboardSpec and ChartSpec

The backend should generate frontend-ready chart specs.

The frontend should not hard-code lab logic. It should render charts from backend-provided specs and poll chart data endpoints.

Expected frontend flow:

```text
GET /sessions/{session_id}/dashboard
        ↓
render chart cards from charts[]
        ↓
poll each chart data endpoint
        ↓
update graphs dynamically
```

---

## 4. Demo Scenarios

## 4.1 Use Case 1 — Multi-Location Business Reputation Monitor

Scenario:

```text
Miners Coffee-like Prague coffee chain with 10+ locations.
```

User request:

```text
Monitor all my locations in Prague and my top five competitors daily.
Alert me when any location's sentiment drops or a competitor makes a move.
```

Internal data:

```text
revenue by location
transaction count
staff schedules
pricing/menu tables
```

External data via Apify:

```text
Google-style reviews and ratings
public web/social mentions where feasible
competitor menu and price pages
location-specific public complaints
```

Research labs:

| Lab                     | Expected status | Example output                                                   |
| ----------------------- | --------------: | ---------------------------------------------------------------- |
| Location Sentiment Lab  | selected, ~0.89 | Vinohrady sentiment down 23%; slow-service complaints increased. |
| Competitor Price Lab    | selected, ~0.82 | Competitor price cut or menu change detected.                    |
| Peak Hours Analysis Lab | selected, ~0.76 | Wenceslas queues during 8–9 AM correlate with complaint spike.   |
| Menu Trend Lab          |   hidden, ~0.45 | Oat-milk trend exists but signal is too weak for alerting.       |
| Staff/Shift Mention Lab |   hidden, ~0.31 | Insufficient evidence for person-level attribution.              |

Generated output:

```text
Alert:
Vinohrady location sentiment dropped 23%.

Likely cause:
slow-service complaints during morning peak.

External context:
competitor promotion detected nearby.

Recommended action:
add one morning-shift staff member for three days and monitor recovery.
```

Primary dashboard graphs:

```text
Sentiment trend by location
Negative sentiment share by location
Complaint topics by branch
Peak-hour service risk
Competitor move timeline
```

---

## 4.2 Use Case 2 — Supply Chain Risk Monitor

Scenario:

```text
Czech agricultural drone manufacturer.
```

User request:

```text
We manufacture agricultural drones.
Monitor chip supplies from Asia and lithium batteries.
Alert me before production stops.
```

Internal data:

```text
component inventory
production plan
supplier list
bill of materials
substitution options
```

External data via Apify or cached feeds:

```text
supplier web updates
semiconductor lead-time reports
battery/lithium price indicators
shipping/port status
relevant news/web pages
```

Research labs:

| Lab                      |       Expected status | Example output                                                           |
| ------------------------ | --------------------: | ------------------------------------------------------------------------ |
| Chip Supply Lab          |       selected, ~0.93 | MCU lead time increased; inventory crosses 30-day threshold next week.   |
| Battery Cost Lab         |       selected, ~0.87 | Battery input costs rising; supplier price increase likely next quarter. |
| Shipping Risk Lab        |       selected, ~0.81 | Port congestion suggests +5 day risk for existing containers.            |
| Alternative Supplier Lab | hidden/warning, ~0.52 | Backup suppliers exist but cost premium is high.                         |
| Geopolitical/News Lab    |         hidden, ~0.38 | No immediate sanction or disruption signal.                              |

Generated output:

```text
Critical risk:
chip inventory hits the 30-day safety threshold next week.

Impact:
production risk within 14–21 days if no purchase action is taken.

Recommendation:
reserve backup MCU supply for the next batch despite the cost premium.
```

Primary dashboard graphs:

```text
Inventory days remaining
Production stop risk
Battery cost pressure
Shipping delay risk
Supplier risk ranking
```

---

## 5. Experiment Lab

The experiment lab lives under:

```text
experiment-lab/
```

It contains:

```text
app/labs/
app/text_engine/
app/modeling/
app/agent_skills/
app/demo_data/
scripts/
tests/
skills/experiment-lab/
```

### 5.1 Lab Package

```text
app/labs/
```

Core files:

```text
base.py            → base lab abstractions
schemas.py         → lab result schemas
registry.py        → scenario/lab registry
runner.py          → run labs for a scenario
selection.py       → selected/warning/hidden/discarded logic
critic.py          → evidence and safety checks
decision_cards.py  → user-facing card compilation
helpers.py         → shared utilities
```

Scenario folders:

```text
app/labs/reputation/
app/labs/supply_chain/
```

### 5.2 Reputation Labs

```text
app/labs/reputation/location_sentiment.py
app/labs/reputation/competitor_price.py
app/labs/reputation/peak_hours.py
app/labs/reputation/menu_trend.py
app/labs/reputation/staff_mention.py
app/labs/reputation/data_quality.py
```

### 5.3 Supply Chain Labs

```text
app/labs/supply_chain/chip_supply.py
app/labs/supply_chain/battery_cost.py
app/labs/supply_chain/shipping_risk.py
app/labs/supply_chain/alternative_supplier.py
app/labs/supply_chain/geopolitical.py
app/labs/supply_chain/production_stop.py
app/labs/supply_chain/data_quality.py
```

### 5.4 Text Engine

```text
app/text_engine/
```

Core responsibilities:

```text
source_adapters.py   → raw Apify/demo data to canonical documents
cleaning.py          → clean text
dedup.py             → deduplicate documents
entity_linking.py    → link text to locations/components/suppliers
taxonomies.py        → scenario-specific labels
rule_extractors.py   → deterministic label extraction
aggregation.py       → aggregate signals for labs
model_adapter.py     → model-enrichment interface
schemas.py           → TextDocumentSignal / ExtractedTextSignal
```

### 5.5 Local Sentiment Model

```text
app/modeling/sentiment.py
```

This module runs a locally downloaded Hugging Face sentiment model.

Recommended model:

```text
cardiffnlp/twitter-xlm-roberta-base-sentiment
```

The model is used for reputation text from Apify:

```text
Apify raw records
  → TextDocumentSignal
  → local sentiment prediction
  → ExtractedTextSignal(signal_type="sentiment")
  → Location Sentiment Lab
```

The model should not be called directly inside individual labs. It belongs in the text/model enrichment layer.

---

## 6. Setup

## 6.1 Prerequisites

Recommended local tooling:

```text
Python 3.12 recommended for ML compatibility
uv
Docker / Docker Compose
Node.js + npm/npx
opencode
```

Check:

```bash
uv --version
docker --version
docker compose version
node --version
npm --version
npx --version
opencode --version
```

If Torch installation fails under Python 3.13, use Python 3.12.

---

## 6.2 Install Python Dependencies

From:

```bash
cd experiment-lab
```

Run:

```bash
uv sync
```

If sentiment dependencies are not yet installed:

```bash
uv add transformers torch huggingface_hub safetensors sentencepiece
```

---

## 6.3 Run Tests

```bash
cd experiment-lab
uv run pytest
```

Run selected test groups:

```bash
uv run pytest tests/test_reputation_labs.py
uv run pytest tests/test_supply_chain_labs.py
uv run pytest tests/test_text_engine.py
uv run pytest tests/test_experiment_lab_skill_cli.py
```

---

## 7. Running the Experiment-Lab Skill

List scenarios:

```bash
cd experiment-lab

uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
```

List labs:

```bash
uv run python -m app.agent_skills.experiment_lab_cli list-labs \
  --scenario reputation_monitor

uv run python -m app.agent_skills.experiment_lab_cli list-labs \
  --scenario supply_chain_risk
```

Run reputation scenario:

```bash
uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario reputation_monitor \
  --format json
```

Run supply-chain scenario:

```bash
uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario supply_chain_risk \
  --format json
```

Run refresh comparison:

```bash
uv run python -m app.agent_skills.experiment_lab_cli refresh-compare \
  --scenario reputation_monitor \
  --format json
```

Expected output categories:

```text
selected
warning
hidden
discarded
failed
```

---

## 8. Local Sentiment Model

## 8.1 Download Model

From `experiment-lab`:

```bash
uv run python scripts/download_sentiment_model.py
```

Expected local path:

```text
.models/sentiment/cardiffnlp-twitter-xlm-roberta-base-sentiment
```

Model weights should never be committed.

Add to `.gitignore`:

```gitignore
.models/
```

## 8.2 Smoke Test

```bash
uv run python scripts/smoke_test_sentiment.py
```

Offline test:

```bash
HF_HUB_OFFLINE=1 uv run python scripts/smoke_test_sentiment.py
```

Expected:

```text
positive/negative/neutral-like outputs
model loads locally
no Hugging Face network dependency in offline mode
```

---

## 9. Apify → Local Sentiment Test

This repo currently contains a test session under:

```text
experiment-lab/tmp/sessions/apify_roberta_test/
```

Files:

```text
reputation_raw_apify.json
reputation_text_documents.json
reputation_sentiment_signals.json
```

Run the Apify-to-sentiment script:

```bash
cd experiment-lab

HF_HUB_OFFLINE=1 uv run python scripts/test_apify_to_sentiment.py \
  --raw tmp/sessions/apify_roberta_test/reputation_raw_apify.json \
  --docs-out tmp/sessions/apify_roberta_test/reputation_text_documents.json \
  --out tmp/sessions/apify_roberta_test/reputation_sentiment_signals.json
```

Expected output:

```text
raw_items > 0
normalized_docs > 0
sentiment_signals > 0
labels include negative/neutral/positive
evidence_text preserved
source_url preserved when available
model_id preserved
model_mode = local
```

Current design:

```text
Apify MCP collects text
  → raw Apify file
  → test_apify_to_sentiment.py
  → normalized text documents
  → local RoBERTa sentiment
  → sentiment signal JSON
```

Target design:

```text
Apify MCP collects text
  → backend source adapter
  → text_engine normalization
  → sentiment enrichment
  → ExtractedTextSignal[]
  → labs consume live external signals
```

---

## 10. n8n Local MCP

n8n is used for monitoring workflows.

The current design expects:

```text
opencode orchestrator
  → n8n-local MCP tool
  → fixed Signal Foundry workflow
  → backend /refresh
```

n8n should not expose arbitrary workflow administration to the orchestrator.

Allowed n8n MCP tools:

```text
sf_refresh_session
sf_get_session_state
sf_get_session_alerts
sf_trigger_demo_monitor
sf_build_monitoring_plan
```

Forbidden n8n exposure:

```text
create arbitrary workflow
edit arbitrary workflow
delete workflow
read credentials
arbitrary HTTP request tool
shell execution
filesystem access
arbitrary notification sending
```

n8n should be local-only for this demo.

---

## 10.1 Start n8n

From project root:

```bash
docker compose up -d n8n
```

n8n should be available at:

```text
http://localhost:5678
```

Check logs:

```bash
docker logs -f signal-foundry-n8n
```

---

## 10.2 Required Backend Endpoints for n8n

The backend should expose:

```text
GET  /health
POST /sessions
POST /sessions/{session_id}/run
POST /sessions/{session_id}/refresh
GET  /sessions/{session_id}/cards
GET  /sessions/{session_id}/alerts
POST /sessions/{session_id}/alerts
GET  /sessions/{session_id}/monitoring-plan
POST /sessions/{session_id}/monitoring-plan/build
GET  /sessions/{session_id}/dashboard
GET  /sessions/{session_id}/charts
GET  /sessions/{session_id}/charts/{chart_id}/data
```

The key refresh endpoint:

```text
POST /sessions/{session_id}/refresh
```

Expected refresh response:

```json
{
  "session_id": "demo_miners",
  "scenario": "reputation_monitor",
  "prediction_changed": true,
  "models": [],
  "anomalies": [],
  "alert": {
    "should_notify": true,
    "title": "Location reputation alert",
    "severity": "warning",
    "recommended_action": "Add one person to the 8–9 AM shift for three days.",
    "dedupe_key": "demo_miners:vinohrady_sentiment_drop"
  },
  "decision_cards": [],
  "dashboard_delta": {
    "updated_chart_ids": [
      "sentiment_trend_by_location"
    ],
    "last_updated": "2026-06-13T15:30:00Z"
  }
}
```

---

## 10.3 n8n Workflows

### Workflow 1 — Signal Foundry MCP Tools

Purpose:

Expose narrow MCP tools to opencode.

Tools:

```text
sf_refresh_session
sf_get_session_state
sf_get_session_alerts
sf_trigger_demo_monitor
sf_build_monitoring_plan
```

Expected workflow:

```text
MCP Server Trigger
  → Custom n8n Workflow Tool
  → HTTP Request to backend
  → compact response mapping
```

### Workflow 2 — Scheduled Dashboard Refresh

Purpose:

Run monitoring without opencode.

Expected workflow:

```text
Schedule Trigger
  → Set session/scenario
  → GET /sessions/{session_id}/monitoring-plan
  → optional Apify step
  → POST /sessions/{session_id}/refresh
  → IF alert.should_notify == true
  → POST /sessions/{session_id}/alerts
```

For demo mode:

```text
external mode = cached
HF_HUB_OFFLINE = 1
```

For live mode:

```text
external mode = apify
Apify dataset ID passed to backend
```

Backend remains responsible for model inference, anomaly detection, alert policy, and chart data.

---

## 11. Dynamic Frontend Dashboard

The frontend should render charts from backend-provided specs.

It should not know lab internals.

Frontend calls:

```text
GET /sessions/{session_id}/dashboard
GET /sessions/{session_id}/charts/{chart_id}/data
GET /sessions/{session_id}/alerts
```

Expected dashboard shape:

```json
{
  "session_id": "demo_miners",
  "scenario": "reputation_monitor",
  "title": "Reputation Monitor",
  "headline": "Vinohrady service risk detected",
  "last_updated": "2026-06-13T15:30:00Z",
  "cards": [],
  "charts": [
    {
      "chart_id": "sentiment_trend_by_location",
      "title": "Sentiment trend by location",
      "description": "Average sentiment by location over time.",
      "type": "line",
      "x_key": "time",
      "series": [
        {
          "key": "vinohrady_sentiment",
          "label": "Vinohrady"
        },
        {
          "key": "wenceslas_sentiment",
          "label": "Wenceslas"
        }
      ],
      "data_endpoint": "/sessions/demo_miners/charts/sentiment_trend_by_location/data",
      "refresh_interval_ms": 10000
    }
  ],
  "alerts": []
}
```

Chart data endpoint:

```json
{
  "chart_id": "sentiment_trend_by_location",
  "data": [
    {
      "time": "09:00",
      "vinohrady_sentiment": 0.12,
      "wenceslas_sentiment": 0.20
    },
    {
      "time": "10:00",
      "vinohrady_sentiment": -0.18,
      "wenceslas_sentiment": 0.18
    },
    {
      "time": "11:00",
      "vinohrady_sentiment": -0.31,
      "wenceslas_sentiment": 0.15
    }
  ]
}
```

Suggested frontend components:

```text
DashboardPage
  → useDashboard(sessionId)
  → DecisionCardGrid
  → ChartGrid
      → DynamicChartCard
  → AlertTimeline
```

The frontend should poll chart data every 5–10 seconds for the demo.

---

## 12. Recommended Dashboard Graphs

## 12.1 Reputation Monitor

Primary graphs:

```text
sentiment_trend_by_location
negative_sentiment_share_by_location
complaint_topics_by_location
peak_hour_service_risk
competitor_move_timeline
```

Important visual questions:

```text
Which location is getting worse?
Is the sentiment drop sudden or gradual?
Which complaint topics dominate?
Does the issue correlate with a specific hour?
Did a competitor move happen nearby?
```

## 12.2 Supply Chain Monitor

Primary graphs:

```text
inventory_days_remaining
production_stop_risk
battery_cost_pressure
shipping_delay_risk
supplier_risk_ranking
```

Important visual questions:

```text
When will safety stock be breached?
Is production stop risk rising?
Are battery costs accelerating?
Which route or supplier is risky?
What should the operator act on first?
```

---

## 13. Opencode Setup

The opencode orchestrator should read:

```text
AGENTS.md
OPENCODE-SETUP.md
skills/experiment-lab/SKILL.md
experiment-lab/skills/experiment-lab/SKILL.md
```

Current opencode files:

```text
opencode.json
opencode_lovable_connection.md
```

Expected opencode responsibilities:

```text
coordinate subagents
use local experiment-lab skill
call Apify MCP for external data
call n8n MCP for workflow refresh
call Lovable MCP for frontend generation
never let labs call raw MCP directly
```

Important rule:

```text
Skills are for deterministic local code.
MCP is for external systems.
```

---

## 14. Agent / Subagent Model

Recommended subagents:

```text
SourceScoutSubagent
ApifyRunnerSubagent
TextNormalizerSubagent
SentimentSubagent
LabRunnerSubagent
CriticSubagent
DashboardSpecSubagent
n8nWorkflowSubagent
FrontendSubagent
```

Strict tool boundaries:

| Subagent               | Allowed                      |
| ---------------------- | ---------------------------- |
| SourceScoutSubagent    | Apify planning only          |
| ApifyRunnerSubagent    | Apify MCP only               |
| TextNormalizerSubagent | local text engine            |
| SentimentSubagent      | local sentiment model        |
| LabRunnerSubagent      | experiment-lab skill CLI     |
| CriticSubagent         | local lab report / evidence  |
| DashboardSpecSubagent  | backend/dashboard schemas    |
| n8nWorkflowSubagent    | n8n MCP only                 |
| FrontendSubagent       | Lovable MCP / frontend files |

Forbidden:

```text
labs calling Apify directly
labs calling n8n directly
n8n running local model directly
frontend deciding alert severity
orchestrator sending arbitrary notifications
```

---

## 15. Development Commands

From project root:

```bash
docker compose up -d n8n
```

From `experiment-lab`:

```bash
uv run pytest
```

Run experiment lab:

```bash
uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario reputation_monitor \
  --format json
```

Run supply chain lab:

```bash
uv run python -m app.agent_skills.experiment_lab_cli run-analysis \
  --scenario supply_chain_risk \
  --format json
```

Download sentiment model:

```bash
uv run python scripts/download_sentiment_model.py
```

Smoke test sentiment:

```bash
uv run python scripts/smoke_test_sentiment.py
```

Offline sentiment:

```bash
HF_HUB_OFFLINE=1 uv run python scripts/smoke_test_sentiment.py
```

Apify to sentiment:

```bash
HF_HUB_OFFLINE=1 uv run python scripts/test_apify_to_sentiment.py \
  --raw tmp/sessions/apify_roberta_test/reputation_raw_apify.json \
  --docs-out tmp/sessions/apify_roberta_test/reputation_text_documents.json \
  --out tmp/sessions/apify_roberta_test/reputation_sentiment_signals.json
```

---

## 16. Current Project Status

Based on the current tree, the project has:

```text
local experiment-lab package
scenario demo fixtures
reputation labs
supply-chain labs
text-engine package
lab selection/critic/card logic
experiment-lab CLI skill wrapper
local sentiment model adapter
sentiment download/smoke scripts
Apify → sentiment test artifacts
n8n local MCP documentation
opencode setup files
Lovable connection notes
tests for core lab/text-engine components
```

This is a strong foundation.

The project has moved beyond an idea and now has an executable analysis core.

---

# 17. What Is Still Missing

This section is intentionally explicit. These are the major missing pieces before the product feels complete.

---

## 17.1 Repository Hygiene

The tree currently contains many generated files:

```text
__pycache__/
*.pyc
experiment_lab.egg-info/
tmp/sessions/
```

These should normally not be committed.

Required cleanup:

```bash
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
find . -name "*.pyc" -delete
```

Add to `.gitignore`:

```gitignore
__pycache__/
*.pyc
.pytest_cache/
.venv/
.env
.models/
tmp/
*.egg-info/
```

`tmp/sessions/apify_roberta_test/` can be kept only if intentionally committed as demo evidence. Otherwise, move it to `docs/examples/` or regenerate it locally.

---

## 17.2 Top-Level Backend API

The tree does not clearly show a production FastAPI app at the top level of `experiment-lab`.

Missing or not visible:

```text
app/main.py
app/api/
app/services/
app/monitoring/
app/dashboard/
```

Needed endpoints:

```text
GET  /health
POST /sessions
POST /sessions/{session_id}/run
POST /sessions/{session_id}/refresh
GET  /sessions/{session_id}/cards
GET  /sessions/{session_id}/alerts
POST /sessions/{session_id}/alerts
GET  /sessions/{session_id}/monitoring-plan
POST /sessions/{session_id}/monitoring-plan/build
GET  /sessions/{session_id}/dashboard
GET  /sessions/{session_id}/charts
GET  /sessions/{session_id}/charts/{chart_id}/data
```

Without these endpoints, n8n and the frontend cannot interact with the lab core cleanly.

---

## 17.3 MonitoringPlan Layer

Still needed:

```text
app/monitoring/schemas.py
app/monitoring/selection.py
app/monitoring/plan_builder.py
app/monitoring/history_store.py
```

Purpose:

```text
turn selected lab prediction artifacts into monitorable models
decide refresh cadence
decide chart eligibility
decide alert eligibility
store metric history
```

The backend must build a MonitoringPlan from LabRunReport.

n8n should execute the plan, not invent it.

---

## 17.4 DashboardSpec / ChartSpec Layer

Still needed:

```text
app/dashboard/schemas.py
app/dashboard/spec_builder.py
app/dashboard/chart_data.py
```

Purpose:

```text
generate frontend-ready chart specs
map selected lab artifacts to graphs
serve dynamic chart data
support polling updates
```

This is essential for the beautiful frontend graphs.

---

## 17.5 Dynamic Metric History

Anomaly detection and dynamic graphs need time-series storage.

Currently missing or not visible:

```text
history store
metric append function
metric read function
refresh appending metric points
```

Minimum MVP:

```text
tmp/sessions/{session_id}/history/{metric_key}.json
```

Later:

```text
SQLite / Postgres / DuckDB
```

Required metrics:

Reputation:

```text
sentiment score by location over time
negative sentiment share by location over time
review volume by location over time
complaint topic counts
competitor move score
peak-hour service risk
```

Supply chain:

```text
days inventory remaining
lead time weeks
production stop risk
battery cost index
shipping delay days
supplier risk score
```

---

## 17.6 Anomaly Detection Layer

Labs currently produce analysis, but the product needs explicit anomaly detection.

Missing or not visible:

```text
app/monitoring/anomaly_detector.py
```

MVP anomaly rules:

```text
rolling baseline deviation
threshold breach
sudden percentage change
negative sentiment share spike
inventory safety-stock breach
lead-time increase
shipping delay increase
```

Example output:

```json
{
  "anomaly_id": "vinohrady_sentiment_drop",
  "entity": "Miners Vinohrady",
  "metric": "negative_sentiment_share",
  "severity": "warning",
  "current_value": 0.42,
  "baseline_value": 0.19,
  "change_percent": 23,
  "evidence": []
}
```

---

## 17.7 Alert Policy and Dedupe

Not every anomaly should notify the user.

Missing or not visible:

```text
app/monitoring/alert_policy.py
```

Alert policy should check:

```text
severity
confidence
novelty
dedupe key
evidence quality
actionability
whether user has already been notified
```

Required output:

```json
{
  "should_notify": true,
  "title": "Location reputation alert",
  "severity": "warning",
  "recommended_action": "...",
  "dedupe_key": "demo_miners:vinohrady_sentiment_drop"
}
```

---

## 17.8 Live Apify Integration Into Lab Runner

Current state shows:

```text
tmp/sessions/apify_roberta_test/reputation_raw_apify.json
tmp/sessions/apify_roberta_test/reputation_text_documents.json
tmp/sessions/apify_roberta_test/reputation_sentiment_signals.json
```

This proves Apify → sentiment can work as a test path.

Missing:

```text
experiment_lab_cli --external-normalized PATH
experiment_lab_cli --session-dir PATH
backend /refresh accepting apify_dataset_id
source adapter for live Apify records
automatic conversion from Apify dataset to TextDocumentSignal
```

The current test path appears separate from the core lab runner.

Target:

```text
Apify dataset ID
  → backend loads dataset
  → source adapter normalizes
  → local sentiment enriches
  → labs consume live signals
```

---

## 17.9 Local Sentiment Integration Into Text Engine

Current tree has:

```text
app/modeling/sentiment.py
scripts/smoke_test_sentiment.py
scripts/test_apify_to_sentiment.py
```

Missing or not visible:

```text
app/text_engine/sentiment_enrichment.py
```

The sentiment model should be integrated as part of text-engine enrichment, not only as a standalone script.

Target:

```text
TextDocumentSignal[]
  → enrich_documents_with_sentiment()
  → ExtractedTextSignal[]
```

Then Location Sentiment Lab consumes `ExtractedTextSignal`.

---

## 17.10 PredictionArtifact Schema

Labs should produce prediction artifacts.

Missing or not visible:

```text
PredictionArtifact schema
model_id fields in lab results
monitoring_eligible flags
chart_eligible flags
alert_eligible flags
recommended_refresh_minutes
```

Without this, the backend cannot systematically decide which lab outputs should become n8n-monitored models and frontend graphs.

---

## 17.11 n8n Workflow Exports

The docs mention n8n local MCP, but the tree does not show exported n8n workflow JSON files.

Recommended directory:

```text
workflows/n8n/
  signal_foundry_mcp_tools.json
  signal_foundry_scheduled_monitor.json
```

This makes the workflow reproducible across machines.

---

## 17.12 Frontend Application

No frontend app is visible in the tree.

Missing:

```text
frontend/
or Lovable-generated app
dashboard components
DynamicChartCard
DecisionCardGrid
AlertTimeline
API client
polling logic
```

Frontend should render from backend specs:

```text
GET /sessions/{id}/dashboard
GET /sessions/{id}/charts/{chart_id}/data
GET /sessions/{id}/alerts
```

Lovable should build UI against those contracts, not invent backend logic.

---

## 17.13 End-to-End Demo Script

Still needed:

```text
docs/demo-script.md
```

It should include:

```text
start backend
start n8n
verify local sentiment
run experiment-lab
trigger Apify test
trigger n8n refresh
show dashboard
show alert
switch to supply-chain demo
```

---

## 17.14 `.env.example`

The tree does not show `.env.example`.

Needed:

```env
APIFY_TOKEN=
APIFY_MODE=cached

HF_HUB_OFFLINE=1
SENTIMENT_MODE=local
SENTIMENT_MODEL_ID=cardiffnlp/twitter-xlm-roberta-base-sentiment
SENTIMENT_MODEL_DIR=.models/sentiment/cardiffnlp-twitter-xlm-roberta-base-sentiment
SENTIMENT_DEVICE=cpu
SENTIMENT_BATCH_SIZE=4
SENTIMENT_MAX_CHARS=800

SIGNAL_FOUNDRY_API_URL=http://localhost:8000

N8N_MCP_TOKEN=dev_signal_foundry_mcp_token_change_me
N8N_WEBHOOK_URL=http://localhost:5678

LOVABLE_TOKEN=
```

---

## 17.15 CI / Validation

Not visible:

```text
.github/workflows/ci.yml
```

Recommended CI:

```text
install uv
uv sync
uv run pytest
do not require local sentiment model download
skip model integration test if model missing
```

---

## 18. Suggested Next Implementation Order

Use this order:

```text
1. Clean repo hygiene:
   remove __pycache__, *.pyc, egg-info if accidentally tracked.

2. Add .env.example and complete .gitignore.

3. Add FastAPI backend shell:
   /health
   /sessions
   /run
   /refresh
   /cards
   /alerts

4. Add PredictionArtifact schema to lab outputs.

5. Add MonitoringPlan builder:
   labs → selected monitorable artifacts.

6. Add history store:
   append/read metric points.

7. Add anomaly detector and alert policy.

8. Add DashboardSpec and ChartSpec builders.

9. Add chart data endpoints.

10. Integrate local sentiment into text_engine, not just script.

11. Extend experiment_lab_cli:
    --external-normalized
    --session-dir

12. Create n8n workflows and export JSON.

13. Build Lovable/frontend dashboard from DashboardSpec.

14. Add demo script and CI.
```

---

## 19. MVP Definition

The MVP is complete when this works:

```text
1. User starts a reputation_monitor session.
2. Backend runs labs and builds monitoring plan.
3. Frontend shows dynamic dashboard charts.
4. n8n triggers /refresh.
5. Backend appends new chart points.
6. Frontend graph changes.
7. If anomaly is severe, backend returns alert.should_notify=true.
8. n8n writes/sends alert.
```

And the same for:

```text
supply_chain_risk / demo_drones
```

---

## 20. Non-Negotiable Design Rules

```text
Backend owns intelligence.
n8n owns workflow timing and notification delivery.
Frontend owns visualization.
Labs do not call Apify directly.
Labs do not call n8n directly.
n8n does not run sentiment model directly.
Frontend does not decide alert severity.
Hidden/discarded labs do not appear on the main dashboard.
Person-level blame is never selected as an alert.
All claims must preserve evidence references.
```

---

## 21. Project Status Summary

Current status:

```text
Strong experiment-lab foundation exists.
Two demo scenarios are modeled.
Local sentiment path exists.
Apify-to-sentiment test artifacts exist.
opencode and n8n integration docs exist.
```

Main missing product layer:

```text
FastAPI session runtime
monitoring plan
dynamic chart specs
history store
anomaly detection
alert policy
frontend dashboard
n8n exported workflows
```

The shortest path to a compelling demo is:

```text
experiment-lab output
  → MonitoringPlan
  → /refresh appends chart points
  → /dashboard serves ChartSpecs
  → frontend polls chart endpoints
  → n8n triggers refresh and alert
```

That is the core product loop.
