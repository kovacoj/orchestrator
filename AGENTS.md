# AGENTS.md

## Workspace Shape
- This repo is an orchestrator workspace that currently carries `experiment-lab/` as a git submodule.
- Treat `experiment-lab/` as the local deterministic analysis engine and keep orchestration concerns in this superproject separate from the submodule implementation.

## Local Skills

### Experiment Lab Skill

Before using the local Signal Foundry lab engine, read:

`experiment-lab/skills/experiment-lab/SKILL.md`

Use the CLI wrapper instead of importing random lab modules directly:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
```

The experiment-lab skill is local and deterministic. It must not call Apify, Hugging Face, n8n, or live web services.

## Signal Foundry agent architecture

This repo uses OpenCode as the orchestrator shell.

Use local skills for deterministic project capabilities.
Use MCP servers only for external integrations.

Local skills:
- `skills/experiment-lab/SKILL.md`

MCP servers:
- Apify for external data collection
- Hugging Face for optional model enrichment
- Lovable for frontend/app generation
- n8n webhook/MCP for monitoring workflows

Do not let labs call raw MCP tools directly.
External data/model outputs must be converted into typed artifacts before labs consume them.

Default demo modes:
- `APIFY_MODE=cached`
- `HF_MODE=mock`

Core validation command:

```bash
cd experiment-lab && uv run pytest
```

Core experiment-lab command:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
```

## Apify subagent testing rules

When testing Apify integration, use subagents with strict boundaries:

- SourceScoutSubagent may plan Apify collection.
- ApifyRunnerSubagent may call Apify MCP.
- TextNormalizerSubagent converts raw Apify output into TextDocumentSignal records.
- LabRunnerSubagent runs only the local experiment-lab skill.
- CriticSubagent compares evidence against lab findings.

Labs must not call Apify directly.

For demo stability:
- cap Apify result count to 20 items per scenario;
- preserve raw evidence text and source URLs;
- never overwrite app/demo_data fixtures;
- write temporary live results under tmp/sessions/;
- fall back to cached fixtures when live Apify fails;
- record all failures explicitly.

Approved test scenarios:
- reputation_monitor
- supply_chain_risk

## n8n local MCP rules

n8n is the workflow runner for Signal Foundry. It is not the intelligence layer.

The orchestrator may call n8n only through approved local MCP tools:

- `sf_refresh_session`
- `sf_get_session_state`
- `sf_get_session_alerts`
- `sf_trigger_demo_monitor`

n8n workflows may call the Signal Foundry backend:

- `POST /sessions/{session_id}/refresh`
- `GET /sessions/{session_id}/cards`
- `GET /sessions/{session_id}/alerts`
- `POST /sessions/{session_id}/alerts`

Do not expose full workflow administration over MCP.

Forbidden n8n MCP capabilities:

- create arbitrary workflow
- edit arbitrary workflow
- delete workflow
- read credentials
- arbitrary HTTP request
- arbitrary email sending
- arbitrary Slack/Discord sending
- shell/filesystem access

For demo stability, n8n should call cached/mock backend modes:

- `APIFY_MODE=cached`
- `HF_MODE=mock`

The core monitoring loop is:

n8n schedule/manual trigger
→ backend `/refresh`
→ IF `prediction_changed`
→ alert output
