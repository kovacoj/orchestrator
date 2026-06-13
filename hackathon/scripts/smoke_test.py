"""
In-process smoke test: scrape → normalize → analyze → approve.
No HTTP server, no Apify, no UI. Pure verification that the data
layer + analysis engine produce sensible output.

    cd hackathon && uv run python scripts/smoke_test.py

Exits 0 on success, non-zero on the first failed assertion.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api import analysis as analysis_engine  # noqa: E402
from api import apify_client, db, logger, normalize  # noqa: E402


def fail(msg: str) -> None:
    print(f"  FAIL: {msg}")
    sys.exit(1)


def ok(msg: str) -> None:
    print(f"  ok:   {msg}")


def main() -> int:
    print("smoke test — Agentic Decision Lab / MarketTwin\n")

    # Use a temporary SQLite file so the smoke test doesn't pollute the
    # main local DB used by `make seed` / `make api`.
    import os, tempfile
    tmp = Path(tempfile.mkdtemp()) / "smoke.db"
    db.DEFAULT_SQLITE_PATH = tmp  # type: ignore[assignment]
    backend = db.init_db()
    print(f"[init] backend = {backend}\n")

    # 1) Scrape (cached)
    print("[1/5] scrape")
    items = apify_client.load_cached(max_items=20)
    if len(items) < 10:
        fail(f"cached fixture too small: {len(items)} items")
    ok(f"loaded {len(items)} cached items")

    run = db.insert("scrape_runs", {"source": "cached", "actor_id": "smoke",
                                    "status": "running",
                                    "metadata": {"reason": "smoke"}})

    # 2) Normalize
    print("\n[2/5] normalize")
    norm = normalize.normalize_many(items)
    valid = sum(1 for r in norm if r["is_valid"])
    invalid = len(norm) - valid
    if valid < 10:
        fail(f"too few valid rows: {valid}")
    if invalid < 1:
        fail("expected ≥1 invalid row (Stanley FatMax fixture has missing price)")
    ok(f"valid={valid}, invalid={invalid}")

    for nr in norm:
        db.insert("competitor_prices", {**nr, "scrape_run_id": run["id"]})

    db.update("scrape_runs", run["id"], {
        "status": "succeeded",
        "finished_at": db.now_iso(),
        "actor_run_id": "smoke-fixture",
        "row_count": len(items),
    })

    # 3) Analyze
    print("\n[3/5] analyze")
    rows = db.query("select * from competitor_prices where scrape_run_id = ?",
                    (run["id"],))
    result = analysis_engine.analyze_run(rows)
    s = result["summary"]
    if s["products_analyzed"] < 3:
        fail(f"too few products analyzed: {s['products_analyzed']}")
    ok(f"products_analyzed={s['products_analyzed']} products_skipped={s['products_skipped']}")

    exp_total = sum(len(p["experiments"]) for p in result["products"])
    rec_total = sum(1 for p in result["products"] if p["recommendation"])
    if rec_total < 3:
        fail(f"expected ≥3 recommendations, got {rec_total}")
    ok(f"experiments={exp_total} recommendations={rec_total}")

    # Sanity-check one recommendation
    sample = next(p["recommendation"] for p in result["products"] if p["recommendation"])
    if not (0.0 <= sample["confidence"] <= 1.0):
        fail(f"confidence out of [0,1]: {sample['confidence']}")
    if sample["recommended_price"] <= 0:
        fail(f"recommended_price not positive: {sample['recommended_price']}")
    ok(f"sample: {sample['product_name']!r} → recommend {sample['recommended_price']} "
       f"(confidence={sample['confidence']:.2f}, delta={sample['delta_pct']:+.1f}%)")

    # 4) Persist + approve one
    print("\n[4/5] persist + approve one recommendation")
    rec_id = None
    for p in result["products"]:
        for e in p["experiments"]:
            db.insert("experiment_results", {
                "scrape_run_id": run["id"],
                "experiment_name": e["experiment_name"],
                "model_name": "hackathon.analysis.v0.1",
                "metric_name": e["metric_name"],
                "metric_value": e["metric_value"],
                "result": e["result"],
            })
        if p["recommendation"]:
            r = p["recommendation"]
            inserted = db.insert("recommendations", {
                "scrape_run_id": run["id"],
                "product_name": r["product_name"],
                "current_price": r["current_price"],
                "recommended_price": r["recommended_price"],
                "delta_pct": r["delta_pct"],
                "confidence": r["confidence"],
                "reason": r["reason"],
                "status": "pending",
            })
            if rec_id is None:
                rec_id = inserted["id"]

    assert rec_id
    db.update("recommendations", rec_id, {
        "status": "approved",
        "decided_at": db.now_iso(),
        "decided_by": "smoke-test",
    })
    logger.log(step="approve", status="ok", role="qa-reporter",
               scrape_run_id=run["id"],
               details={"recommendation_id": rec_id, "decision": "approve"})
    approved = db.query("select status, decided_by from recommendations where id = ?",
                        (rec_id,))[0]
    if approved["status"] != "approved":
        fail(f"expected status=approved, got {approved['status']}")
    ok(f"recommendation {rec_id[:8]}... approved by {approved['decided_by']}")

    # 5) Verify dashboard views
    print("\n[5/5] verify views")
    feed = db.query("select * from scrape_run_feed limit 5")
    if not feed:
        fail("scrape_run_feed view returned no rows")
    ok(f"scrape_run_feed: {len(feed)} row(s)")

    timeline = db.query("select * from agent_log_timeline limit 20")
    if not timeline:
        fail("agent_log_timeline view returned no rows")
    ok(f"agent_log_timeline: {len(timeline)} row(s)")

    rec_dash = db.query("select * from recommendation_dashboard limit 20")
    if not rec_dash:
        fail("recommendation_dashboard view returned no rows")
    ok(f"recommendation_dashboard: {len(rec_dash)} row(s)")

    print("\nALL CHECKS PASSED")
    print(f"(smoke DB at {tmp} — safe to delete)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
