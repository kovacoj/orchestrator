"""Pydantic request/response models for the FastAPI shim."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ScrapeTriggerRequest(BaseModel):
    source: Literal["synthetic", "cached", "apify"] = Field(
        default="cached",
        description="Where to get data from. cached=fixture, synthetic=alias for cached, apify=live call (requires APIFY_TOKEN).",
    )
    actor_id: str = Field(default="apify/web-scraper")
    max_items: int = Field(default=20, ge=1, le=100)


class ScrapeRunOut(BaseModel):
    id: str
    source: str
    actor_id: Optional[str] = None
    actor_run_id: Optional[str] = None
    status: str
    started_at: str
    finished_at: Optional[str] = None
    row_count: int
    metadata: dict[str, Any] = Field(default_factory=dict)


class AnalysisResponse(BaseModel):
    scrape_run_id: str
    products_analyzed: int
    products_skipped: int
    rows_in: int
    rows_valid: int
    experiment_count: int
    recommendation_count: int


class RecommendationOut(BaseModel):
    id: str
    scrape_run_id: Optional[str] = None
    product_name: str
    current_price: Optional[float] = None
    recommended_price: Optional[float] = None
    delta_pct: Optional[float] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None
    status: str
    feedback: Optional[str] = None
    created_at: str
    decided_at: Optional[str] = None
    decided_by: Optional[str] = None


class RecommendationDecision(BaseModel):
    action: Literal["approve", "reject", "needs_review"]
    decided_by: str = Field(default="dashboard_user", max_length=120)
    feedback: Optional[str] = None


class KPIBlock(BaseModel):
    latest_scrape_status: Optional[str] = None
    latest_scrape_source: Optional[str] = None
    latest_scrape_at: Optional[str] = None
    products_tracked: int = 0
    competitors_tracked: int = 0
    pending_recommendations: int = 0
    avg_delta_pct: Optional[float] = None


class DashboardResponse(BaseModel):
    kpis: KPIBlock
    recent_recommendations: list[RecommendationOut]
    scrape_feed: list[ScrapeRunOut]
    agent_log_count: int


class AgentLogOut(BaseModel):
    id: str
    created_at: str
    step: str
    role: Optional[str] = None
    model: Optional[str] = None
    reasoning_effort: Optional[str] = None
    status: str
    details: dict[str, Any] = Field(default_factory=dict)
    scrape_run_id: Optional[str] = None
    scrape_source: Optional[str] = None


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    backend: str
    apify_mode: str
    subagent_model_requested: str
    subagent_reasoning_requested: str
    executor_model: str
