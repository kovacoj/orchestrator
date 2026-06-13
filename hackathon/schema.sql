-- Agentic Decision Lab / MarketTwin — Postgres / Supabase schema
-- Built by: claude-opus-4-7 (substitute) / Requested-runtime: gpt-5.3-codex
--
-- Apply via Supabase SQL editor (or `psql -f schema.sql`).
-- A SQLite-flavored mirror lives at hackathon/schema_sqlite.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Core tables
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists scrape_runs (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,                    -- 'synthetic' | 'apify' | 'cached_fixture'
  actor_id      text,                             -- apify actor identifier when source='apify'
  actor_run_id  text,                             -- apify run id (or 'synthetic-N' / 'cached')
  status        text not null default 'pending',  -- pending | running | succeeded | failed | fallback_to_cache
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  row_count     integer default 0,
  metadata      jsonb default '{}'::jsonb
);

create index if not exists scrape_runs_started_idx on scrape_runs (started_at desc);

create table if not exists competitor_prices (
  id              uuid primary key default gen_random_uuid(),
  scrape_run_id   uuid references scrape_runs(id) on delete cascade,
  product_name    text not null,
  brand           text,
  competitor      text not null,
  price           numeric,
  currency        text default 'EUR',
  availability    text default 'unknown',         -- in_stock | out_of_stock | unknown
  url             text,
  observed_at     timestamptz not null default now(),
  raw_title       text,
  raw             jsonb default '{}'::jsonb,
  is_valid        boolean not null default true   -- false when normalization dropped required fields
);

create index if not exists competitor_prices_product_idx on competitor_prices (product_name);
create index if not exists competitor_prices_observed_idx on competitor_prices (observed_at desc);
create index if not exists competitor_prices_valid_idx on competitor_prices (is_valid);

create table if not exists experiment_results (
  id              uuid primary key default gen_random_uuid(),
  scrape_run_id   uuid references scrape_runs(id) on delete cascade,
  experiment_name text not null,                  -- e.g. 'competitor_price_analysis'
  model_name      text,                           -- analysis engine / model that produced this
  metric_name     text,
  metric_value    numeric,
  result          jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists experiment_results_run_idx on experiment_results (scrape_run_id);

create table if not exists recommendations (
  id                  uuid primary key default gen_random_uuid(),
  scrape_run_id       uuid references scrape_runs(id) on delete cascade,
  product_name        text not null,
  current_price       numeric,
  recommended_price   numeric,
  delta_pct           numeric,                    -- (recommended - current) / current * 100
  confidence          numeric,                    -- 0.0–1.0
  reason              text,
  status              text not null default 'draft',  -- draft | pending | approved | rejected | needs_review
  feedback            text,
  created_at          timestamptz not null default now(),
  decided_at          timestamptz,
  decided_by          text
);

create index if not exists recommendations_status_idx on recommendations (status, created_at desc);

create table if not exists agent_logs (
  id                uuid primary key default gen_random_uuid(),
  scrape_run_id     uuid references scrape_runs(id) on delete set null,
  step              text not null,                -- 'scrape' | 'normalize' | 'analyze' | 'recommend' | 'approve'
  role              text,                         -- subagent name when applicable
  model             text,                         -- model id that ran this step
  reasoning_effort  text,                         -- 'low' | 'medium' | 'high' | null
  status            text not null,                -- 'started' | 'ok' | 'fallback' | 'error'
  details           jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists agent_logs_created_idx on agent_logs (created_at desc);
create index if not exists agent_logs_run_idx on agent_logs (scrape_run_id);

create table if not exists settings (
  key           text primary key,
  value         jsonb not null,
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Views (dashboard data contract)
-- The frontend reads these views, not raw tables.
-- ─────────────────────────────────────────────────────────────────────────

create or replace view latest_competitor_prices as
select distinct on (product_name, competitor)
  product_name,
  competitor,
  price,
  currency,
  url,
  observed_at
from competitor_prices
where is_valid = true
order by product_name, competitor, observed_at desc;

create or replace view product_price_summary as
select
  product_name,
  count(distinct competitor)                                     as competitor_count,
  min(price)                                                     as min_competitor_price,
  percentile_cont(0.5) within group (order by price)             as median_competitor_price,
  max(price)                                                     as max_competitor_price,
  max(observed_at)                                               as last_observed_at
from competitor_prices
where is_valid = true and price is not null
group by product_name;

create or replace view recommendation_dashboard as
select
  r.id,
  r.product_name,
  r.current_price,
  r.recommended_price,
  r.delta_pct,
  r.confidence,
  r.reason,
  r.status,
  s.status     as scrape_status,
  s.source     as scrape_source,
  r.created_at,
  r.decided_at,
  r.decided_by
from recommendations r
left join scrape_runs s on s.id = r.scrape_run_id;

create or replace view scrape_run_feed as
select
  id,
  source,
  actor_id,
  actor_run_id,
  status,
  started_at,
  finished_at,
  row_count,
  metadata,
  extract(epoch from (coalesce(finished_at, now()) - started_at)) as duration_seconds
from scrape_runs
order by started_at desc;

create or replace view agent_log_timeline as
select
  l.id,
  l.created_at,
  l.step,
  l.role,
  l.model,
  l.reasoning_effort,
  l.status,
  l.details,
  l.scrape_run_id,
  s.source as scrape_source
from agent_logs l
left join scrape_runs s on s.id = l.scrape_run_id
order by l.created_at desc;

-- ─────────────────────────────────────────────────────────────────────────
-- Default settings
-- ─────────────────────────────────────────────────────────────────────────

insert into settings (key, value) values
  ('scrape_interval_seconds', '300'::jsonb),
  ('target_margin_pct',       '15'::jsonb),
  ('max_price_change_pct',    '20'::jsonb),
  ('apify_max_items',         '20'::jsonb),
  ('subagent_model',          '"siemens-sdc-openai-responses/gpt-5.3-codex"'::jsonb),
  ('subagent_reasoning',      '"medium"'::jsonb)
on conflict (key) do nothing;
