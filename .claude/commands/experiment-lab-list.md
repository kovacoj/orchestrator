# /experiment-lab-list

Use the local experiment-lab skill to list supported scenarios or labs.

## Scenarios

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
```

## Labs for reputation_monitor

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-labs --scenario reputation_monitor
```

## Labs for supply_chain_risk

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-labs --scenario supply_chain_risk
```

Do not import lab modules directly when the stable CLI wrapper is sufficient.
