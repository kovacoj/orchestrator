# /experiment-lab-run

Run the local deterministic Signal Foundry experiment-lab skill.

## Reputation Monitor

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
```

## Supply Chain Risk

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario supply_chain_risk --format json
```

Use `--format text` only when a human-readable summary is more useful than machine output.

This command is local and deterministic. It must not call Apify, Hugging Face, n8n, or live web services.
