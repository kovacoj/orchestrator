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
