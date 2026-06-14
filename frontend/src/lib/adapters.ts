// Adapters that translate backend RefreshResponse / AlertsResponse /
// ForecastResponse shapes into the view-model shapes the existing demo
// components understand (`Kpi`, `MainAlert`, etc.). Keeping the
// translation in one place means the visual components stay
// shape-agnostic and the demoData fallbacks remain drop-in
// replacements.

import type {
  Finding,
  Kpi,
  LabDecision,
  MainAlert,
  Severity as DemoSeverity,
} from "../data/demoData";
import type {
  AlertRecord,
  AlertsResponse,
  CardsResponse,
  DecisionCard,
  ForecastResponse,
  LabModelSummary,
  RefreshResponse,
  Severity as BackendSeverity,
} from "./types";

function mapSeverity(s: BackendSeverity | null | undefined): DemoSeverity {
  if (s === "critical" || s === "warning") return "warning";
  if (s === "info") return "good";
  return "watch";
}

/** Pull the most relevant alert envelope from a refresh payload. */
export function pickTopAlert(refresh: RefreshResponse | null): AlertRecord | null {
  return null !== refresh && refresh.alert.should_notify
    ? {
        alert_id: refresh.alert.dedupe_key ?? "refresh-alert",
        session_id: refresh.session_id,
        scenario: refresh.scenario,
        lab_id: "refresh",
        title: refresh.alert.title ?? "Active alert",
        body: refresh.alert.body ?? "",
        severity: (refresh.alert.severity ?? "warning") as BackendSeverity,
        location: null,
        sentiment_score: null,
        recommended_action: refresh.alert.recommended_action,
        dedupe_key: refresh.alert.dedupe_key ?? "refresh-alert",
        created_at: refresh.dashboard_delta.last_updated,
      }
    : null;
}

/**
 * Build a `MainAlert` view-model from the latest refresh + decision
 * cards. The refresh alert envelope only carries title/body/severity;
 * we enrich with the highest-priority decision card to fill in
 * evidence + recommended action + caveats.
 */
export function buildMainAlert(
  refresh: RefreshResponse | null,
  cards: CardsResponse | null,
): MainAlert | null {
  if (!refresh || !refresh.alert.should_notify) return null;

  const card = cards?.cards?.[0] ?? refresh.decision_cards[0];
  const evidence = (card?.evidence ?? [])
    .map((e) => e?.detail || e?.label)
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  const action =
    refresh.alert.recommended_action ||
    card?.recommended_actions?.[0]?.detail ||
    card?.recommended_actions?.[0]?.title ||
    "Review the latest evidence and decide next steps.";

  const caveats =
    (card?.caveats ?? []).join(" · ") ||
    "Backend assigned warning severity. Treat as advisory until operator confirms.";

  // Try to lift a sentiment-style headline number out of the first
  // numeric evidence item; otherwise fall back to a generic label.
  const numericEv = card?.evidence?.find(
    (e) => typeof e?.value === "number" || /-?\d+(\.\d+)?%?/.test(String(e?.value ?? "")),
  );
  let metricValue = 0;
  let metricDisplay = refresh.alert.severity?.toUpperCase() ?? "ALERT";
  if (numericEv) {
    const raw = numericEv.value;
    const num = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (!Number.isNaN(num)) {
      metricValue = num;
      metricDisplay =
        Math.abs(num) <= 1 ? `${(num * 100).toFixed(0)}%` : `${num.toFixed(0)}`;
    }
  }

  return {
    id: card?.card_id ?? refresh.alert.dedupe_key ?? "alert.live",
    severity: mapSeverity(refresh.alert.severity),
    title: refresh.alert.title ?? card?.title ?? "Active alert",
    locationId: "LIVE",
    locationName: card?.title?.split("·")[0]?.trim() ?? refresh.scenario,
    summary: refresh.alert.body ?? card?.summary ?? "Backend flagged a change worth reviewing.",
    primaryMetric: { name: numericEv?.label ?? "Signal", value: metricValue, display: metricDisplay },
    likelyCause: card?.summary ?? "See evidence list below.",
    externalContext: refresh.external_provenance
      ? `Live Apify stream merged (${
          refresh.external_provenance.row_count ?? "n"
        } rows).`
      : "No external stream merged into this refresh.",
    recommendedAction: action,
    confidence: card?.evidence?.[0]?.confidence ?? 0.8,
    evidence: evidence.length > 0 ? evidence : [refresh.alert.body ?? ""].filter(Boolean),
    caveats,
  };
}

/**
 * Derive the KPI strip from a refresh payload + alerts count + forecast.
 * Falls back to demoData-equivalent strings when a number isn't
 * available yet so the cards never render blank.
 */
export function buildKpis(opts: {
  refresh: RefreshResponse | null;
  alerts: AlertsResponse | null;
  forecast: ForecastResponse | null;
}): Kpi[] {
  const { refresh, alerts, forecast } = opts;

  const horizonRevenue =
    forecast?.totals.predicted_horizon_revenue_eur ??
    forecast?.totals.baseline_horizon_revenue_eur ??
    null;
  const horizonLabel = forecast
    ? `${forecast.horizon_days}-Day Revenue (€)`
    : "7-Day Revenue";

  const intervention = forecast?.totals.intervention_uplift_eur ?? null;

  const activeAlerts = alerts?.count ?? (refresh?.alert.should_notify ? 1 : 0);

  const userContextCount = refresh?.user_context?.count_recent ?? 0;
  const confidenceBand = refresh?.user_context?.confidence_band ?? "—";

  const labCount = refresh?.models.length ?? 0;
  const predictionChanged = refresh?.prediction_changed;

  const fmtEur = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M €`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}k €`
      : `${n.toFixed(0)} €`;

  return [
    {
      id: "kpi.revenue",
      label: horizonLabel,
      value: horizonRevenue !== null ? fmtEur(horizonRevenue) : "—",
      delta: forecast
        ? `vs baseline ${fmtEur(forecast.totals.baseline_horizon_revenue_eur)}`
        : undefined,
      status: predictionChanged ? "warning" : "good",
      hint: forecast?.method ?? "Sales forecast endpoint /forecasts/sales.",
    },
    {
      id: "kpi.alerts",
      label: "Active Alerts",
      value: String(activeAlerts),
      status: activeAlerts > 0 ? "warning" : "good",
      hint: "Open alerts persisted by the backend /alerts endpoint.",
    },
    {
      id: "kpi.prediction",
      label: "Prediction Drift",
      value: predictionChanged ? "Changed" : "Stable",
      status: predictionChanged ? "warning" : "good",
      hint: "Whether the latest /refresh detected a change in any monitored prediction.",
    },
    {
      id: "kpi.labs",
      label: "Active Labs",
      value: String(labCount),
      status: "watch",
      hint: "Labs returned by the latest refresh (deterministic analysis modules).",
    },
    {
      id: "kpi.uplift",
      label: "Intervention Uplift",
      value: intervention !== null ? fmtEur(intervention) : "—",
      delta: forecast
        ? `over next ${forecast.horizon_days} days`
        : undefined,
      status: "opportunity",
      hint: "Predicted revenue uplift if the recommended action is taken (vs do-nothing).",
    },
    {
      id: "kpi.context",
      label: "Operator Notes",
      value: String(userContextCount),
      delta: confidenceBand,
      status: userContextCount > 0 ? "watch" : "good",
      hint: "Recent operator-logged evidence. Treated as low-confidence supplementary signal.",
    },
  ];
}

/**
 * Map backend card priority / status into the demo Severity vocabulary.
 * `priority` is a 0..1 fraction in the current backend slice.
 */
function cardSeverity(card: DecisionCard): DemoSeverity {
  if (card.status === "suppressed") return "suppressed";
  if (card.card_type === "opportunity") return "opportunity";
  if (card.priority >= 0.8) return "warning";
  if (card.priority >= 0.5) return "watch";
  return "good";
}

/** Convert a backend DecisionCard into a Finding view-model. */
export function cardToFinding(card: DecisionCard): Finding {
  const evidence = (card.evidence ?? [])
    .map((e) => e?.detail || e?.label)
    .filter((s): s is string => typeof s === "string" && s.length > 0);
  const action =
    card.recommended_actions?.[0]?.detail ??
    card.recommended_actions?.[0]?.title ??
    undefined;
  return {
    id: card.card_id,
    title: card.title,
    severity: cardSeverity(card),
    confidence: card.evidence?.[0]?.confidence ?? 0.75,
    whatWasFound: card.summary,
    evidence: evidence.length > 0 ? evidence : undefined,
    recommendedAction: action,
    important: card.caveats?.join(" · ") || undefined,
  };
}

/** Convert a backend AlertRecord into a Finding view-model. */
export function alertToFinding(alert: AlertRecord): Finding {
  return {
    id: alert.alert_id,
    title: alert.title,
    severity: mapSeverity(alert.severity),
    confidence: alert.sentiment_score !== null ? Math.abs(alert.sentiment_score) : 0.8,
    whatWasFound: alert.body,
    recommendedAction: alert.recommended_action ?? undefined,
    important: alert.location ? `Location: ${alert.location}` : undefined,
  };
}

/** Convert a backend LabModelSummary into the demo LabDecision shape. */
export function modelToLabDecision(m: LabModelSummary): LabDecision {
  const isActive = m.status === "selected" || m.status === "active";
  return {
    id: m.lab_id,
    name: m.lab_name ?? m.lab_id,
    decision: isActive ? "Selected" : "Hidden",
    confidence: m.confidence ?? m.score ?? 0,
    summary: m.summary ?? "(no summary)",
    visibility: isActive ? "active" : "suppressed",
  };
}
