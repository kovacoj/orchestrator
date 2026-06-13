"""
Agent log writer. Every meaningful step in the pipeline emits one row to
the agent_logs table. The dashboard's third demo element renders these as
a timeline with model/role provenance.
"""

from __future__ import annotations

from typing import Any

from . import db

# Model identity that produced the artifacts written by this Python process.
# Distinct from the SUBAGENT model (gpt-5.3-codex) which would be used when
# OpenCode is restarted with the new agent definitions.
EXECUTOR_MODEL = "claude-opus-4-7 (substitute)"
REQUESTED_SUBAGENT_MODEL = "siemens-sdc-openai-responses/gpt-5.3-codex"
REQUESTED_REASONING = "medium"


def log(
    *,
    step: str,
    status: str,
    role: str | None = None,
    scrape_run_id: str | None = None,
    model: str | None = None,
    reasoning_effort: str | None = None,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Insert one agent log row.

    status: 'started' | 'ok' | 'fallback' | 'error'
    """
    return db.insert(
        "agent_logs",
        {
            "step": step,
            "status": status,
            "role": role,
            "scrape_run_id": scrape_run_id,
            "model": model or EXECUTOR_MODEL,
            "reasoning_effort": reasoning_effort or REQUESTED_REASONING,
            "details": details or {},
        },
    )
