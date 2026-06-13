"""
Seed the local DB with one cached-fixture scrape + analysis.

Usage:
    cd hackathon
    uv run python scripts/seed.py

Provenance: built by claude-opus-4-7 (substitute); subagent runtime targets
gpt-5.3-codex with reasoningEffort=medium (see opencode.json).
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure hackathon/ is on sys.path so `from api import ...` resolves.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api import analysis as analysis_engine  # noqa: E402
from api import apify_client, db, logger, normalize  # noqa: E402


def main() -> int:
    backend = db.init_db()
    print(f"[init] backend = {backend}")

    run = db.insert("scrape_runs", {
        "source": "cached",
        "actor_id": "seed-script",
        "status": "running",
        "metadata": {"reason": "seed.py"},
    })
    logger.log(step="scrape", status="started", role="apify-actor-runner",
               scrape_run_id=run["id"], details={"source": "cached"})

    items = apify_client.load_cached(max_items=20)
    norm_rows = normalize.normalize_many(items)
    valid = 0
    for nr in norm_rows:
        db.insert("competitor_prices", {**nr, "scrape_run_id": run["id"]})
        if nr["is_valid"]:
            valid += 1
    print(f"[scrape] {len(items)} items → {valid} valid, {len(items)-valid} invalid")
    logger.log(step="normalize", status="ok", role="data-cleaner",
               scrape_run_id=run["id"],
               details={"rows_in": len(items), "rows_valid": valid,
                        "rows_invalid": len(items) - valid})

    db.update("scrape_runs", run["id"], {
        "status": "succeeded",
        "finished_at": db.now_iso(),
        "actor_run_id": "cached-fixture",
        "row_count": len(items),
        "metadata": {"reason": "seed.py", "mode_used": "cached"},
    })
    logger.log(step="scrape", status="ok", role="apify-actor-runner",
               scrape_run_id=run["id"], details={"rows": len(items)})

    rows = db.query("select * from competitor_prices where scrape_run_id = ?", (run["id"],))
    result = analysis_engine.analyze_run(rows)
    print(f"[analyze] products_analyzed={result['summary']['products_analyzed']} "
          f"products_skipped={result['summary']['products_skipped']}")

    exp_count, rec_count = 0, 0
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
            exp_count += 1
        if p["recommendation"]:
            r = p["recommendation"]
            db.insert("recommendations", {
                "scrape_run_id": run["id"],
                "product_name": r["product_name"],
                "current_price": r["current_price"],
                "recommended_price": r["recommended_price"],
                "delta_pct": r["delta_pct"],
                "confidence": r["confidence"],
                "reason": r["reason"],
                "status": "pending",
            })
            rec_count += 1
    print(f"[analyze] inserted experiments={exp_count} recommendations={rec_count}")
    logger.log(step="recommend", status="ok", role="lab-ingestion",
               scrape_run_id=run["id"],
               details={"experiment_count": exp_count,
                        "recommendation_count": rec_count})

    print()
    print("[done] open http://127.0.0.1:8001/dashboard once the API is running.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
