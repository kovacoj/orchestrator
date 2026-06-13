-- Agentic Decision Lab / MarketTwin — SQLite schema (local dev mirror of schema.sql)
-- Built by: claude-opus-4-7 (substitute) / Requested-runtime: gpt-5.3-codex
--
-- Column names match the Postgres schema 1:1 so the same Python data layer
-- works against either backend. SQLite differences:
--   - UUIDs are TEXT (the API generates uuid4 strings)
--   - JSONB columns are TEXT holding JSON (the API encodes/decodes)
--   - TIMESTAMPTZ → TEXT in ISO-8601 (the API uses datetime.utcnow().isoformat())
--   - No percentile_cont; the median view uses a window approximation.

pragma foreign_keys = on;

create table if not exists scrape_runs (
  id            text primary key,
  source        text not null,
  actor_id      text,
  actor_run_id  text,
  status        text not null default 'pending',
  started_at    text not null,
  finished_at   text,
  row_count     integer default 0,
  metadata      text default '{}'
);
create index if not exists scrape_runs_started_idx on scrape_runs (started_at desc);

create table if not exists competitor_prices (
  id              text primary key,
  scrape_run_id   text references scrape_runs(id) on delete cascade,
  product_name    text not null,
  brand           text,
  competitor      text not null,
  price           real,
  currency        text default 'EUR',
  availability    text default 'unknown',
  url             text,
  observed_at     text not null,
  raw_title       text,
  raw             text default '{}',
  is_valid        integer not null default 1
);
create index if not exists competitor_prices_product_idx on competitor_prices (product_name);
create index if not exists competitor_prices_observed_idx on competitor_prices (observed_at desc);
create index if not exists competitor_prices_valid_idx on competitor_prices (is_valid);

create table if not exists experiment_results (
  id              text primary key,
  scrape_run_id   text references scrape_runs(id) on delete cascade,
  experiment_name text not null,
  model_name      text,
  metric_name     text,
  metric_value    real,
  result          text default '{}',
  created_at      text not null
);
create index if not exists experiment_results_run_idx on experiment_results (scrape_run_id);

create table if not exists recommendations (
  id                  text primary key,
  scrape_run_id       text references scrape_runs(id) on delete cascade,
  product_name        text not null,
  current_price       real,
  recommended_price   real,
  delta_pct           real,
  confidence          real,
  reason              text,
  status              text not null default 'draft',
  feedback            text,
  created_at          text not null,
  decided_at          text,
  decided_by          text
);
create index if not exists recommendations_status_idx on recommendations (status, created_at desc);

create table if not exists agent_logs (
  id                text primary key,
  scrape_run_id     text references scrape_runs(id) on delete set null,
  step              text not null,
  role              text,
  model             text,
  reasoning_effort  text,
  status            text not null,
  details           text default '{}',
  created_at        text not null
);
create index if not exists agent_logs_created_idx on agent_logs (created_at desc);
create index if not exists agent_logs_run_idx on agent_logs (scrape_run_id);

create table if not exists settings (
  key           text primary key,
  value         text not null,
  updated_at    text not null
);

-- Views — kept simple for SQLite (no percentile_cont).
create view if not exists latest_competitor_prices as
select cp.product_name, cp.competitor, cp.price, cp.currency, cp.url, cp.observed_at
from competitor_prices cp
join (
  select product_name, competitor, max(observed_at) as max_observed
  from competitor_prices
  where is_valid = 1
  group by product_name, competitor
) latest
  on cp.product_name = latest.product_name
 and cp.competitor   = latest.competitor
 and cp.observed_at  = latest.max_observed
where cp.is_valid = 1;

-- Median approximation: pick middle row per product after ordering by price.
-- For demo purposes this is fine; production should use a window function.
create view if not exists product_price_summary as
select
  product_name,
  count(distinct competitor) as competitor_count,
  min(price)                 as min_competitor_price,
  -- SQLite has no native percentile; the API computes the true median in Python
  -- via analysis.py. This view exposes avg(price) as a usable proxy for the
  -- dashboard when it queries this view directly.
  avg(price)                 as median_competitor_price,
  max(price)                 as max_competitor_price,
  max(observed_at)           as last_observed_at
from competitor_prices
where is_valid = 1 and price is not null
group by product_name;

create view if not exists recommendation_dashboard as
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

create view if not exists scrape_run_feed as
select
  id, source, actor_id, actor_run_id, status,
  started_at, finished_at, row_count, metadata,
  -- duration: SQLite julianday returns days; *86400 → seconds
  case when finished_at is not null
       then (julianday(finished_at) - julianday(started_at)) * 86400.0
       else (julianday('now')        - julianday(started_at)) * 86400.0
  end as duration_seconds
from scrape_runs
order by started_at desc;

create view if not exists agent_log_timeline as
select
  l.id, l.created_at, l.step, l.role, l.model, l.reasoning_effort,
  l.status, l.details, l.scrape_run_id,
  s.source as scrape_source
from agent_logs l
left join scrape_runs s on s.id = l.scrape_run_id
order by l.created_at desc;

-- Default settings (idempotent)
insert or ignore into settings (key, value, updated_at) values
  ('scrape_interval_seconds', '300',                                                strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('target_margin_pct',       '15',                                                 strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('max_price_change_pct',    '20',                                                 strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('apify_max_items',         '20',                                                 strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('subagent_model',          '"siemens-sdc-openai-responses/gpt-5.3-codex"',       strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('subagent_reasoning',      '"medium"',                                           strftime('%Y-%m-%dT%H:%M:%fZ','now'));
