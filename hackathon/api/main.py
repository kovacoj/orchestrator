"""
FastAPI shim — Agentic Decision Lab / MarketTwin.

End-to-end demo pipeline:

    POST /scrapes/run              → ingest cached/synthetic/Apify data
    POST /scrapes/{id}/analyze     → run competitor_price_analysis
    POST /recommendations/{id}/decision  → approve / reject / needs_review
    GET  /dashboard                → KPIs + recent items + scrape feed
    GET  /recommendations          → list (filterable by status)
    GET  /agent-logs               → timeline rows
    GET  /scrape-runs              → recent runs
    GET  /health                   → backend + model provenance

Run locally:

    uv run uvicorn hackathon.api.main:app --reload --port 8001
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import analysis as analysis_engine
from . import apify_client, db, logger, normalize
from .models import (
    AgentLogOut,
    AnalysisResponse,
    DashboardResponse,
    HealthResponse,
    KPIBlock,
    RecommendationDecision,
    RecommendationOut,
    ScrapeRunOut,
    ScrapeTriggerRequest,
)

# ─────────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Agentic Decision Lab / MarketTwin API",
    description=(
        "Hackathon subsystem. Provenance: built by claude-opus-4-7 (substitute); "
        "subagent runtime targets siemens-sdc-openai-responses/gpt-5.3-codex "
        "with reasoningEffort=medium."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    backend = db.init_db()
    logger.log(
        step="api_startup",
        status="ok",
        details={"backend": backend, "apify_mode": apify_client.mode()},
    )


# ─────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    backend = "postgres" if db.is_postgres() else f"sqlite:{db.DEFAULT_SQLITE_PATH}"
    return HealthResponse(
        backend=backend,
        apify_mode=apify_client.mode(),
        subagent_model_requested=logger.REQUESTED_SUBAGENT_MODEL,
        subagent_reasoning_requested=logger.REQUESTED_REASONING,
        executor_model=logger.EXECUTOR_MODEL,
    )


# ─────────────────────────────────────────────────────────────────────────
# Scrape: ingest one batch of competitor data
# ─────────────────────────────────────────────────────────────────────────

@app.post("/scrapes/run", response_model=ScrapeRunOut, status_code=201)
def trigger_scrape(req: ScrapeTriggerRequest) -> ScrapeRunOut:
    # 1. Create a scrape_runs row in 'running' state.
    run = db.insert("scrape_runs", {
        "source": req.source,
        "actor_id": req.actor_id,
        "status": "running",
        "metadata": {"requested_max_items": req.max_items},
    })
    logger.log(
        step="scrape",
        status="started",
        role="apify-actor-runner",
        scrape_run_id=run["id"],
        details={"source": req.source, "actor_id": req.actor_id, "max_items": req.max_items},
    )

    # 2. Get items. 'synthetic' is just an alias for the cached fixture.
    try:
        if req.source in ("synthetic", "cached"):
            items = apify_client.load_cached(max_items=req.max_items)
            actor_run_id = f"{req.source}-fixture"
            mode_used = "cached"
            err = None
        else:
            result = apify_client.run_actor(actor_id=req.actor_id, max_items=req.max_items)
            items = result["items"]
            actor_run_id = result["actor_run_id"]
            mode_used = result["mode"]
            err = result["error"]
    except Exception as e:
        db.update("scrape_runs", run["id"], {
            "status": "failed",
            "finished_at": db.now_iso(),
            "metadata": {"error": str(e)},
        })
        logger.log(step="scrape", status="error", scrape_run_id=run["id"], details={"error": str(e)})
        raise HTTPException(status_code=502, detail=f"scrape failed: {e}") from e

    # 3. Normalize and insert competitor_prices rows.
    norm_rows = normalize.normalize_many(items)
    valid_count = 0
    for nr in norm_rows:
        db.insert("competitor_prices", {**nr, "scrape_run_id": run["id"]})
        if nr["is_valid"]:
            valid_count += 1
    logger.log(
        step="normalize",
        status="ok" if err is None else "fallback",
        role="data-cleaner",
        scrape_run_id=run["id"],
        details={"rows_in": len(items), "rows_valid": valid_count, "rows_invalid": len(items) - valid_count},
    )

    # 4. Mark the scrape_run finished.
    new_status = "succeeded" if mode_used in ("cached", "live") else "fallback_to_cache"
    db.update("scrape_runs", run["id"], {
        "status": new_status,
        "finished_at": db.now_iso(),
        "actor_run_id": actor_run_id,
        "row_count": len(items),
        "metadata": {
            "requested_max_items": req.max_items,
            "mode_used": mode_used,
            "apify_error": err,
        },
    })
    logger.log(
        step="scrape",
        status="fallback" if mode_used == "fallback" else "ok",
        role="apify-actor-runner",
        scrape_run_id=run["id"],
        details={"rows": len(items), "mode_used": mode_used, "apify_error": err},
    )

    # Read back the final row.
    final = db.query("select * from scrape_runs where id = ?", (run["id"],))[0]
    return _to_scrape_run_out(final)


# ─────────────────────────────────────────────────────────────────────────
# Analyze: compute experiment_results + recommendations for a scrape run
# ─────────────────────────────────────────────────────────────────────────

@app.post("/scrapes/{scrape_id}/analyze", response_model=AnalysisResponse, status_code=201)
def analyze_run(scrape_id: str) -> AnalysisResponse:
    run = db.query("select * from scrape_runs where id = ?", (scrape_id,))
    if not run:
        raise HTTPException(status_code=404, detail="scrape_run not found")

    rows = db.query(
        "select * from competitor_prices where scrape_run_id = ?",
        (scrape_id,),
    )
    logger.log(
        step="analyze",
        status="started",
        role="lab-ingestion",
        scrape_run_id=scrape_id,
        details={"input_rows": len(rows)},
    )

    result = analysis_engine.analyze_run(rows)

    experiment_count = 0
    recommendation_count = 0
    for p in result["products"]:
        for exp in p["experiments"]:
            db.insert("experiment_results", {
                "scrape_run_id": scrape_id,
                "experiment_name": exp["experiment_name"],
                "model_name": "hackathon.analysis.v0.1",
                "metric_name": exp["metric_name"],
                "metric_value": exp["metric_value"],
                "result": exp["result"],
            })
            experiment_count += 1
        if p["recommendation"]:
            rec = p["recommendation"]
            db.insert("recommendations", {
                "scrape_run_id": scrape_id,
                "product_name": rec["product_name"],
                "current_price": rec["current_price"],
                "recommended_price": rec["recommended_price"],
                "delta_pct": rec["delta_pct"],
                "confidence": rec["confidence"],
                "reason": rec["reason"],
                "status": "pending",
            })
            recommendation_count += 1

    logger.log(
        step="recommend",
        status="ok",
        role="lab-ingestion",
        scrape_run_id=scrape_id,
        details={
            "experiment_count": experiment_count,
            "recommendation_count": recommendation_count,
            "summary": result["summary"],
        },
    )

    return AnalysisResponse(
        scrape_run_id=scrape_id,
        products_analyzed=result["summary"]["products_analyzed"],
        products_skipped=result["summary"]["products_skipped"],
        rows_in=result["summary"]["rows_in"],
        rows_valid=result["summary"]["rows_valid"],
        experiment_count=experiment_count,
        recommendation_count=recommendation_count,
    )


# ─────────────────────────────────────────────────────────────────────────
# Recommendations
# ─────────────────────────────────────────────────────────────────────────

@app.get("/recommendations", response_model=list[RecommendationOut])
def list_recommendations(
    status: str | None = Query(default=None, description="filter: pending|approved|rejected|needs_review"),
    limit: int = Query(default=50, ge=1, le=500),
) -> list[RecommendationOut]:
    if status:
        rows = db.query(
            "select * from recommendations where status = ? order by created_at desc limit ?",
            (status, limit),
        )
    else:
        rows = db.query(
            "select * from recommendations order by created_at desc limit ?",
            (limit,),
        )
    return [_to_recommendation_out(r) for r in rows]


@app.post("/recommendations/{rec_id}/decision", response_model=RecommendationOut)
def decide_recommendation(rec_id: str, decision: RecommendationDecision) -> RecommendationOut:
    rows = db.query("select * from recommendations where id = ?", (rec_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="recommendation not found")

    status_map = {"approve": "approved", "reject": "rejected", "needs_review": "needs_review"}
    new_status = status_map[decision.action]

    db.update("recommendations", rec_id, {
        "status": new_status,
        "decided_at": db.now_iso(),
        "decided_by": decision.decided_by,
        "feedback": decision.feedback,
    })
    logger.log(
        step="approve" if decision.action == "approve" else "decide",
        status="ok",
        role="qa-reporter",
        scrape_run_id=rows[0].get("scrape_run_id"),
        details={
            "recommendation_id": rec_id,
            "decision": decision.action,
            "decided_by": decision.decided_by,
            "product_name": rows[0].get("product_name"),
            "feedback": decision.feedback,
        },
    )

    final = db.query("select * from recommendations where id = ?", (rec_id,))[0]
    return _to_recommendation_out(final)


# ─────────────────────────────────────────────────────────────────────────
# Scrape runs
# ─────────────────────────────────────────────────────────────────────────

@app.get("/scrape-runs", response_model=list[ScrapeRunOut])
def list_scrape_runs(limit: int = Query(default=25, ge=1, le=200)) -> list[ScrapeRunOut]:
    rows = db.query("select * from scrape_runs order by started_at desc limit ?", (limit,))
    return [_to_scrape_run_out(r) for r in rows]


# ─────────────────────────────────────────────────────────────────────────
# Agent log timeline
# ─────────────────────────────────────────────────────────────────────────

@app.get("/agent-logs", response_model=list[AgentLogOut])
def list_agent_logs(limit: int = Query(default=100, ge=1, le=500)) -> list[AgentLogOut]:
    rows = db.query(
        "select * from agent_log_timeline limit ?",
        (limit,),
    )
    return [_to_agent_log_out(r) for r in rows]


# ─────────────────────────────────────────────────────────────────────────
# Dashboard (one-shot data contract for the React frontend)
# ─────────────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_model=DashboardResponse)
def dashboard() -> DashboardResponse:
    latest_run = db.query("select * from scrape_runs order by started_at desc limit 1")
    products = db.query("select count(distinct product_name) as n from competitor_prices where is_valid = 1")
    competitors = db.query("select count(distinct competitor) as n from competitor_prices where is_valid = 1")
    pending = db.query("select count(*) as n from recommendations where status = 'pending'")
    avg_delta = db.query("select avg(delta_pct) as d from recommendations where status = 'pending'")
    recents = db.query("select * from recommendations order by created_at desc limit 10")
    feed = db.query("select * from scrape_runs order by started_at desc limit 8")
    log_count = db.query("select count(*) as n from agent_logs")

    kpis = KPIBlock(
        latest_scrape_status=(latest_run[0]["status"] if latest_run else None),
        latest_scrape_source=(latest_run[0]["source"] if latest_run else None),
        latest_scrape_at=(latest_run[0]["started_at"] if latest_run else None),
        products_tracked=int(products[0]["n"]) if products else 0,
        competitors_tracked=int(competitors[0]["n"]) if competitors else 0,
        pending_recommendations=int(pending[0]["n"]) if pending else 0,
        avg_delta_pct=float(avg_delta[0]["d"]) if avg_delta and avg_delta[0]["d"] is not None else None,
    )

    return DashboardResponse(
        kpis=kpis,
        recent_recommendations=[_to_recommendation_out(r) for r in recents],
        scrape_feed=[_to_scrape_run_out(r) for r in feed],
        agent_log_count=int(log_count[0]["n"]) if log_count else 0,
    )


# ─────────────────────────────────────────────────────────────────────────
# Row → response shaping helpers
# ─────────────────────────────────────────────────────────────────────────

def _coerce_meta(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if value in (None, ""):
        return {}
    if isinstance(value, str):
        import json
        try:
            v = json.loads(value)
            return v if isinstance(v, dict) else {}
        except (ValueError, json.JSONDecodeError):
            return {}
    return {}


def _to_scrape_run_out(r: dict[str, Any]) -> ScrapeRunOut:
    return ScrapeRunOut(
        id=r["id"],
        source=r["source"],
        actor_id=r.get("actor_id"),
        actor_run_id=r.get("actor_run_id"),
        status=r["status"],
        started_at=r["started_at"],
        finished_at=r.get("finished_at"),
        row_count=r.get("row_count") or 0,
        metadata=_coerce_meta(r.get("metadata")),
    )


def _to_recommendation_out(r: dict[str, Any]) -> RecommendationOut:
    return RecommendationOut(
        id=r["id"],
        scrape_run_id=r.get("scrape_run_id"),
        product_name=r["product_name"],
        current_price=r.get("current_price"),
        recommended_price=r.get("recommended_price"),
        delta_pct=r.get("delta_pct"),
        confidence=r.get("confidence"),
        reason=r.get("reason"),
        status=r["status"],
        feedback=r.get("feedback"),
        created_at=r["created_at"],
        decided_at=r.get("decided_at"),
        decided_by=r.get("decided_by"),
    )


def _to_agent_log_out(r: dict[str, Any]) -> AgentLogOut:
    return AgentLogOut(
        id=r["id"],
        created_at=r["created_at"],
        step=r["step"],
        role=r.get("role"),
        model=r.get("model"),
        reasoning_effort=r.get("reasoning_effort"),
        status=r["status"],
        details=_coerce_meta(r.get("details")),
        scrape_run_id=r.get("scrape_run_id"),
        scrape_source=r.get("scrape_source"),
    )
