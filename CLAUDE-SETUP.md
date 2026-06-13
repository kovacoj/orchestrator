# Claude Setup

## Goal

This workspace is intended to run under Claude Code with Siemens-hosted model access and a local deterministic `experiment-lab` skill.

The local deterministic capability is:

- `experiment-lab/`

External integrations should be added through MCP later.

## Install Claude Code

Recommended inside WSL or Linux:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Then restart your shell and verify:

```bash
claude --version
claude doctor
```

## Authenticate

Run:

```bash
claude
```

Follow the interactive login flow.

## Required Local Settings

This repo provides team-shared defaults in:

- `.claude/settings.json`

Each developer should add their own secrets in a local uncommitted file based on:

- `.claude/settings.local.example.json`

Create:

```bash
cp .claude/settings.local.example.json .claude/settings.local.json
```

Then fill in:

- `ANTHROPIC_AUTH_TOKEN`

For non-Claude local secrets used by repo tooling, create a local `.env` from `.env.example` and fill in any needed values such as:

- `APIFY_API_TOKEN`
- `LOVABLE_TOKEN`

## Siemens Model Backend

The project-scoped Claude settings are adapted from the Siemens Claude Code setup and your previous OpenCode model usage.

Shared project defaults:

- `ANTHROPIC_BASE_URL=https://api.siemens.com/llm`
- default model family pinned to `glm-5`
- long timeout and reduced nonessential traffic

The authentication token is intentionally not committed.

## MCP Setup

This repo includes:

- `.mcp.example.json`

The planned MCPs for this workspace are:

- Apify
- Hugging Face
- Lovable

The Apify MCP is best configured as the remote HTTP server at `https://mcp.apify.com`. It supports browser-based OAuth and does not require local package installation.

Use it only as a reference. Preferred setup is to add MCP servers with Claude commands so auth flows work correctly.

Example commands:

```bash
claude mcp add --transport http --scope project apify https://mcp.apify.com
```

```bash
claude mcp add --scope project --transport stdio \
  --env HF_MODE=mock \
  signal-foundry-huggingface -- \
  uv run python -m app.mcp_servers.huggingface_server
```

```bash
claude mcp add --scope project --transport http lovable YOUR_LOVABLE_MCP_URL \
  --header "Authorization: Bearer $LOVABLE_TOKEN"
```

Verify MCPs with:

```bash
claude mcp list
```

Inside Claude Code:

```text
/mcp
```

## Experiment Lab Skill

Read:

- `experiment-lab/skills/experiment-lab/SKILL.md`

Use the stable local CLI wrapper instead of importing random lab modules directly.

Examples:

```bash
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli list-scenarios
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario reputation_monitor --format json
cd experiment-lab && uv run python -m app.agent_skills.experiment_lab_cli run-analysis --scenario supply_chain_risk --format json
```

## Test The Local Engine

```bash
cd experiment-lab
uv run pytest
```

## Migration Notes

What was carried over from OpenCode:

- skill-style project instructions
- deterministic local CLI entrypoints
- Siemens-backed model defaults, translated into Claude's settings format

What was not migrated literally:

- OpenCode theme/TUI config
- OpenCode plugin config
- OpenCode provider schema

Those are tool-specific and should stay out of the Claude project config.

What is intentionally not part of this workspace:

- Siemens-specific MCP integrations

This repo is being prepared around Claude MCPs for Apify, Hugging Face, and Lovable instead.
