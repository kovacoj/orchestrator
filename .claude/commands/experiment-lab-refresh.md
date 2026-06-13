# /experiment-lab-refresh

Simulate a refresh comparison through the local experiment-lab skill.

## Reputation Monitor

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli refresh-compare --scenario reputation_monitor --format json
```

## Supply Chain Risk

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli refresh-compare --scenario supply_chain_risk --format json
```

Use this to inspect whether the top decision card or confidence changed between two deterministic runs.
