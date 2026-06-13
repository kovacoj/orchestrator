---
name: experiment-lab
description: Run deterministic Signal Foundry lab analysis with the stable local CLI wrapper. Use when asked to run scenarios, list labs, or compare refresh outputs.
---

# Experiment Lab Skill

## Purpose

Use this skill to run local deterministic Signal Foundry analysis from this orchestrator workspace.

## Rules

- Use the stable CLI wrapper only.
- Do not import random internal modules directly from the orchestrator.
- Do not call live external services from this skill.
- Keep outputs deterministic and fixture-based unless the user explicitly asks otherwise.

## Core commands

Run from the workspace root:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-labs --scenario reputation_monitor
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario supply_chain_risk --format json
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli refresh-compare --scenario reputation_monitor --format json
```

## Notes

- External collection/model enrichment belongs to MCP, not this local skill.
- Preserve demo stability defaults: `APIFY_MODE=cached`, `HF_MODE=mock`.
