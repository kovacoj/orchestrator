# CLAUDE.md

## Workspace Shape
- This repo is an orchestrator workspace.
- `experiment-lab/` is a git submodule and is the local deterministic Signal Foundry analysis engine.
- Keep orchestration concerns in this repo and deterministic lab execution inside `experiment-lab/`.

## Installation
- Install Claude Code first. Team setup notes live in `CLAUDE-SETUP.md`.
- Project-scoped Claude defaults live in `.claude/settings.json`.
- Each developer should create their own uncommitted `.claude/settings.local.json` from `.claude/settings.local.example.json`.

## Core Rule
- Do not import random internal modules from `experiment-lab/app/labs/` directly when acting as an orchestrator.
- Use the stable local CLI wrapper exposed by the submodule.

## Experiment Lab Skill
- Read `experiment-lab/skills/experiment-lab/SKILL.md` before using the local lab engine.
- Preferred invocation pattern:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
```

## Allowed Local Capability
- `experiment-lab` is the deterministic local skill.
- It may:
  - list scenarios
  - list labs
  - run full scenario analysis
  - simulate refresh comparison
  - return structured JSON

## Forbidden Through This Skill
- Do not call Apify through the experiment-lab skill.
- Do not call Hugging Face through the experiment-lab skill.
- Do not call n8n through the experiment-lab skill.
- Do not browse the web through the experiment-lab skill.
- Do not install packages through the experiment-lab skill.

Those belong to MCP or external orchestration later.

## Local Commands

### List scenarios

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
```

### List labs

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-labs --scenario reputation_monitor
```

### Run analysis

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario supply_chain_risk --format json
```

### Refresh compare

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli refresh-compare --scenario reputation_monitor --format json
```

## Claude Commands
- Reusable command docs live under `.claude/commands/`.
- Prefer those command entrypoints for repeated tasks.
