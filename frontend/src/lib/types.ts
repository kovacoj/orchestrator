// Typed contracts for the experiment-lab FastAPI backend.
// Mirrors app/api/schemas.py — keep in sync when adding fields.

export type Severity = "info" | "warning" | "critical";

export interface AlertEnvelope {
  should_notify: boolean;
  title: string | null;
  body: string | null;
  severity: Severity | null;
  recommended_action: string | null;
  dedupe_key: string | null;
}

export interface DashboardDelta {
  updated_chart_ids: string[];
  last_updated: string;
}

export interface UserContextEntryRecord {
  entry_id: string;
  message: string;
  source: string;
  tags: string[];
  created_at: string;
}

export interface UserContextSummary {
  count_recent: number;
  count_total: number;
  latest_at: string | null;
  entries: UserContextEntryRecord[];
  confidence_band: string;
}

export interface LabModelSummary {
  lab_id: string;
  lab_name?: string;
  status: string;
  score?: number;
  confidence?: number;
  summary?: string;
}

export interface DecisionCard {
  card_id: string;
  scenario: string;
  title: string;
  card_type: string;
  summary: string;
  priority: number;
  status: string;
  supporting_lab_ids: string[];
  evidence: Array<{
    source: string;
    label: string;
    value: unknown;
    detail: string;
    confidence: number;
  }>;
  recommended_actions: Array<{ title: string; detail: string; urgency: string }>;
  caveats?: string[];
}

export interface RefreshResponse {
  session_id: string;
  scenario: string;
  prediction_changed: boolean;
  models: LabModelSummary[];
  anomalies: Array<Record<string, unknown>>;
  alert: AlertEnvelope;
  decision_cards: DecisionCard[];
  dashboard_delta: DashboardDelta;
  external_provenance: Record<string, unknown> | null;
  user_context: UserContextSummary | null;
}

export interface CardsResponse {
  session_id: string;
  scenario: string;
  generated_at: string;
  cards: DecisionCard[];
}

export interface AlertRecord {
  alert_id: string;
  session_id: string;
  scenario: string;
  lab_id: string;
  title: string;
  body: string;
  severity: Severity;
  location: string | null;
  sentiment_score: number | null;
  recommended_action: string | null;
  dedupe_key: string;
  created_at: string;
}

export interface AlertsResponse {
  session_id: string;
  count: number;
  alerts: AlertRecord[];
}

export interface ChartDataRow {
  time: string;
  [seriesKey: string]: string | number;
}

export interface ChartDataResponse {
  chart_id: string;
  data: ChartDataRow[];
}

export interface ContextListResponse {
  session_id: string;
  count: number;
  entries: UserContextEntryRecord[];
}

export interface UserContextCreated {
  session_id: string;
  entry_id: string;
  message: string;
  source: string;
  tags: string[];
  created_at: string;
  total_entries: number;
}

export interface ForecastScenario {
  scenario_id: string;
  label: string;
  description?: string;
  total_revenue_eur: number;
}

export interface ForecastDailyPoint {
  date: string;
  baseline_eur: number;
  do_nothing_eur: number;
  with_intervention_eur: number;
}

export interface ForecastResponse {
  session_id: string;
  scenario: string;
  generated_at: string;
  horizon_days: number;
  method: string;
  totals: {
    baseline_horizon_revenue_eur: number;
    predicted_horizon_revenue_eur: number;
    predicted_with_intervention_eur: number;
    do_nothing_gap_eur: number;
    intervention_uplift_eur: number;
    intervention_uplift_pct: number;
    intervention_cost_eur: number;
    intervention_net_eur: number;
  };
  scenarios: ForecastScenario[];
  daily: ForecastDailyPoint[];
  narrative: string;
  user_context: UserContextSummary | null;
}

export interface DashboardSpec {
  session_id: string;
  scenario: string;
  title: string;
  headline: string | null;
  last_updated: string | null;
  cards: Array<Record<string, unknown>>;
  charts: Array<{
    chart_id: string;
    title: string;
    description: string;
    type: string;
    x_key: string;
    series: Array<{ key: string; label: string }>;
    data_endpoint: string;
  }>;
  alerts: Array<Record<string, unknown>>;
}
