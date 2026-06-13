# OpenCode Setup

## Goal

Run this workspace with OpenCode, Siemens-hosted models, and MCP integrations.

The local deterministic capability is:

- `experiment-lab/`

## Install OpenCode

Install OpenCode using your normal team-approved install path, then verify:

```bash
opencode --version
```

## Required Local Secrets

Create a local `.env` from `.env.example` and fill in the values you use:

- `APIFY_TOKEN`
- `HF_TOKEN`
- `LOVABLE_TOKEN`
- `SIEMENS_LLM_API_KEY`
- `SIEMENS_SDC_API_KEY`

Optional endpoint env vars:

- `HF_MCP_URL`
- `LOVABLE_MCP_URL`
- `N8N_MCP_URL`
- `N8N_WEBHOOK_URL`

## MCP Setup

MCP servers are configured in `opencode.json` under `mcp`.

This workspace now includes OpenCode MCP config for:

- Apify (`https://mcp.apify.com`)
- Hugging Face (`{env:HF_MCP_URL}`)
- Lovable (`{env:LOVABLE_MCP_URL}`)
- n8n MCP (`{env:N8N_MCP_URL}`), disabled by default

Auth is wired through:

- `Authorization: Bearer {env:APIFY_TOKEN}`
- `Authorization: Bearer {env:HF_TOKEN}`
- `Authorization: Bearer {env:LOVABLE_TOKEN}`

With `oauth: false` in `opencode.json`, OpenCode uses the token directly without interactive MCP OAuth prompts.

Demo stability defaults:

- `APIFY_MODE=cached`
- `HF_MODE=mock`

After changing `opencode.json`, restart OpenCode so the updated MCP config is loaded.

## Experiment Lab Skill

Read:

- `experiment-lab/skills/experiment-lab/SKILL.md`

Use the stable local CLI wrapper instead of importing random lab modules directly.

Examples:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
```
