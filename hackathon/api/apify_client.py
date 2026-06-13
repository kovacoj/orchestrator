"""
Apify wrapper with cached-fixture fallback.

Three modes (env-controlled):
  APIFY_MODE=cached  → always return the cached fixture (default; demo-stable)
  APIFY_MODE=live    → call Apify; on failure, fall back to cached + log it
  APIFY_MODE=off     → raise; useful for tests

This module never imports the heavyweight apify-client SDK unless mode=live.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = ROOT / "fixtures" / "apify_cached_response.json"


def mode() -> str:
    return os.environ.get("APIFY_MODE", "cached").lower()


def load_cached(max_items: int = 20) -> list[dict[str, Any]]:
    items = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    return items[:max_items]


def run_actor(
    actor_id: str = "apify/web-scraper",
    *,
    max_items: int = 20,
    token: str | None = None,
) -> dict[str, Any]:
    """Run an Apify actor (or return cached items, depending on mode).

    Returns a dict shaped like:
        {
          "mode": "cached" | "live" | "fallback",
          "actor_id": "...",
          "actor_run_id": "...",
          "items": [...],
          "error": None | "message",
        }

    Never raises in cached/live modes — failures are recorded in the dict so
    the caller can log them and continue.
    """
    m = mode()
    if m == "off":
        raise RuntimeError("APIFY_MODE=off; refusing to run Apify actor.")

    if m == "cached":
        items = load_cached(max_items=max_items)
        return {
            "mode": "cached",
            "actor_id": actor_id,
            "actor_run_id": "cached-fixture",
            "items": items,
            "error": None,
        }

    # live
    api_token = token or os.environ.get("APIFY_TOKEN")
    if not api_token:
        # No token; fall back rather than raise.
        items = load_cached(max_items=max_items)
        return {
            "mode": "fallback",
            "actor_id": actor_id,
            "actor_run_id": "cached-fixture",
            "items": items,
            "error": "APIFY_TOKEN not set",
        }

    try:  # pragma: no cover — exercised only with a real token
        from apify_client import ApifyClient  # type: ignore

        client = ApifyClient(api_token)
        run = client.actor(actor_id).call(
            run_input={"maxItems": max_items},
            timeout_secs=120,
        )
        run_id = run["id"] if run else "unknown"
        dataset_id = run.get("defaultDatasetId") if run else None
        items: list[dict[str, Any]] = []
        if dataset_id:
            items = list(client.dataset(dataset_id).iterate_items())[:max_items]
        return {
            "mode": "live",
            "actor_id": actor_id,
            "actor_run_id": run_id,
            "items": items,
            "error": None,
        }
    except Exception as e:  # pragma: no cover
        items = load_cached(max_items=max_items)
        return {
            "mode": "fallback",
            "actor_id": actor_id,
            "actor_run_id": "cached-fixture",
            "items": items,
            "error": f"apify failure: {type(e).__name__}: {e}",
        }
