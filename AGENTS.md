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
