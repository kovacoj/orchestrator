# Lovable build brief: "0 to 100" reputation-monitoring dashboard

This document is a paste-ready, end-to-end prompt for [Lovable](https://lovable.dev)
to regenerate the Signal Foundry PoC dashboard as a polished React + TypeScript
app, rebranded as **0 to 100**.

The current reference implementation is the static HTML dashboard at
`experiment-lab/app/static/index.html`, served by the FastAPI backend at
`experiment-lab/app/api/main.py`. The Lovable build must reproduce its
information architecture and live behavior, with a more polished visual style.

---

## 0. How to use this file

1. Open Lovable, start a new project.
2. Paste section **1. Master prompt** into the first Lovable message.
3. Drag-and-drop the eight files from `experiment-lab/tmp/sessions/_bundle/`
   into the Lovable chat as project assets (they must live under
   `/public/bundle/` in the generated app).
4. After the first build, paste each "Iteration prompt" from section **8** one
   by one until acceptance criteria in section **9** are met.

To regenerate the bundle before uploading:

```bash
cd experiment-lab
uv run uvicorn app.api.main:app --reload --port 8000
# then in another shell:
curl -X POST http://localhost:8000/sessions/demo_miners/bundle/rebuild
ls tmp/sessions/_bundle/
```

The bundle contains:

| File                         | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `dashboard_payload.json`     | Top-level page data: meta, business, kpis, locations, alerts, findings, explanations, labs, predictions, recommendations, reports, chart_cards, time_series, data_quality |
| `chart_specs.json`           | Chart definitions (id, title, type, series, live_endpoint, interpretation) |
| `prediction_payload.json`    | Forecast data: sentiment_recovery, queue_pressure, staffing_action, competitor_impact |
| `finding_cards.json`         | Detailed findings with evidence, caveats, suppression reason |
| `explanation_cards.json`     | Plain-language + technical explanations per concept    |
| `reports.json`               | Executive brief, incident report, lab decision report, monitoring plan, evidence index |
| `seed_metadata.json`         | Scenario id, source mode, list of labs and their statuses |
| `lovable_prompt.md`          | A short alternate prompt (do not use; this `lovable.md` supersedes it) |

---

## 1. Master prompt (paste into Lovable first)

> Build a polished React + TypeScript + Vite + Tailwind dashboard called
> **0 to 100**. Use shadcn/ui for primitives, Recharts for charts, and
> TanStack Query for data fetching. The app is a premium B2B SaaS analytics
> dashboard for multi-location reputation monitoring. It must look like a
> production product, not a demo. Dark mode is the default theme.
>
> The brand name is **0 to 100**. Tagline: *"From signal to decision."*
> The product monitors customer sentiment, operational health, and competitor
> moves across physical retail locations and surfaces explainable findings
> with recommended actions.
>
> All page data is loaded from static JSON under `/bundle/*.json` (uploaded
> to `/public/bundle/`). Optionally, when `dashboard_payload.meta.live_backend_url`
> is non-empty OR a `VITE_LIVE_BACKEND_URL` env var is set, the app polls a
> live FastAPI backend every 5 seconds for the live chart, and a "Refresh now"
> button POSTs to the backend's `/refresh` and `/bundle/rebuild` endpoints
> before re-reading the bundle.
>
> Layout: persistent left sidebar with the brand wordmark and primary
> navigation; top bar with page title, contextual sub-title, live-poll
> indicator, and Refresh button; main content area with cards laid out on
> a 12-column grid.
>
> The eight pages are Overview, Alerts, Locations, Predictions, Research
> Labs, Findings, Why & How, and Reports. Each page is detailed in the
> follow-up prompts; render every page with real data from the uploaded
> bundle. No placeholder text, no lorem ipsum.

---

## 2. Brand and visual system

### 2.1 Identity

- **Name:** `0 to 100`
- **Wordmark:** show as `0 → 100` in the sidebar header. Use a tabular numeric
  font with the arrow as a neutral muted color.
- **Tagline (subtitle under wordmark):** `From signal to decision.`
- **Product label on dashboard pages:** `Reputation Monitor` (this is the
  current scenario; treat it as a switchable concept but only one scenario
  exists for now).
- **Do not** show "Signal Foundry" anywhere. Do not show "Data Foundry".
- Favicon: a simple `0→100` glyph on the brand accent color.

### 2.2 Color tokens (Tailwind config)

Dark theme by default. Provide a light variant for parity, but ship with
dark active.

```ts
// tailwind.config.ts
colors: {
  bg:        { DEFAULT: "#0b0f1a", subtle: "#131a2a" },
  surface:   { DEFAULT: "#131a2a", elevated: "#1a2236" },
  border:    "#243149",
  text:      { DEFAULT: "#e6edf7", muted: "#8da0bf" },
  accent:    { DEFAULT: "#5b8def", hover: "#7aa1f5" },
  status: {
    good:    "#4ade80",
    watch:   "#fbbf24",
    warning: "#f87171",
    info:    "#93c5fd",
  },
}
```

Map `status` directly to the `status` field on KPIs, locations, alerts, and
findings.

### 2.3 Typography

- Sans: Inter or system UI stack.
- Tabular numerics on every numeric value (KPI values, deltas, percentages).
- Section labels: `text-xs uppercase tracking-wider text-text-muted`.
- Page title: `text-xl font-semibold`.
- Card title: `text-sm font-semibold text-text-muted uppercase tracking-wider`.

### 2.4 Visual style

- 8px base spacing.
- Card radius `rounded-lg` (`8px`).
- Card border: 1px solid `border`, background `surface`.
- Headline alert card has a subtle gradient overlay tinted by severity, plus
  a one-second pulse ring on first render.
- Charts: thin lines (2px), area fills muted to 8% alpha, grid lines at
  10% alpha, axis ticks in `text-muted`.
- Buttons: primary is solid `accent` on dark; secondary is `border` outline.
- Toast notifications bottom-right, slide+fade.

---

## 3. Application architecture

### 3.1 Tech stack

| Concern         | Choice                                |
| --------------- | -------------------------------------- |
| Framework       | React 18 + Vite + TypeScript           |
| Styling         | Tailwind CSS, shadcn/ui                |
| Routing         | React Router v6                        |
| Data fetching   | TanStack Query v5                      |
| Charts          | Recharts                               |
| State           | TanStack Query cache + tiny Zustand store for UI flags |
| Icons           | lucide-react                           |
| Forms           | Not required for this build            |

### 3.2 Folder layout

```
src/
  app.tsx
  main.tsx
  router.tsx
  lib/
    api.ts            # fetch wrappers
    bundle.ts         # typed loaders for /bundle/*.json
    format.ts         # pct(), num(), date()
    config.ts         # reads VITE_LIVE_BACKEND_URL
  types/
    bundle.ts         # TypeScript types for every bundle file
  components/
    layout/
      Sidebar.tsx
      TopBar.tsx
      PageShell.tsx
    cards/
      KpiCard.tsx
      AlertCard.tsx
      FindingCard.tsx
      ExplanationCard.tsx
      LabCard.tsx
      ReportCard.tsx
      PredictionCard.tsx
    charts/
      LiveSentimentChart.tsx
      RankingChart.tsx
      RecoveryChart.tsx
      QueuePressureChart.tsx
    common/
      StatusBadge.tsx
      InterpretationBlock.tsx
      EvidenceList.tsx
      LoadingShimmer.tsx
      EmptyState.tsx
      Toast.tsx
  pages/
    OverviewPage.tsx
    AlertsPage.tsx
    LocationsPage.tsx
    PredictionsPage.tsx
    LabsPage.tsx
    FindingsPage.tsx
    ExplanationsPage.tsx
    ReportsPage.tsx
public/
  bundle/
    dashboard_payload.json
    chart_specs.json
    prediction_payload.json
    finding_cards.json
    explanation_cards.json
    reports.json
    seed_metadata.json
```

### 3.3 Data flow

1. On boot, TanStack Query prefetches `/bundle/dashboard_payload.json`,
   `/bundle/chart_specs.json`, `/bundle/finding_cards.json`,
   `/bundle/explanation_cards.json`, `/bundle/prediction_payload.json`,
   `/bundle/reports.json`, `/bundle/seed_metadata.json`.
2. The live sentiment chart subscribes via `useQuery` with
   `refetchInterval: 5000` against `${liveBackendUrl}${chartSpec.live_endpoint}`
   when a live backend is configured. When it isn't, fall back to
   `dashboard_payload.time_series.sentiment_trend`.
3. The Refresh button calls `POST {live}/sessions/demo_miners/refresh`, then
   `POST {live}/sessions/demo_miners/bundle/rebuild`, then invalidates every
   bundle query. Show a toast with the result.
4. If the live backend is not configured, hide the Refresh button and the
   live indicator and render a small "Static demo bundle" pill in the top bar.

### 3.4 Live backend resolution

```ts
// src/lib/config.ts
export function liveBackendUrl(payload?: DashboardPayload): string | null {
  const fromPayload = payload?.meta?.live_backend_url?.trim();
  const fromEnv = (import.meta.env.VITE_LIVE_BACKEND_URL as string | undefined)?.trim();
  return fromPayload || fromEnv || null;
}
```

---

## 4. Bundle data contracts (TypeScript types)

Generate these in `src/types/bundle.ts`. The samples are the actual values
the FastAPI backend emits today.

### 4.1 `dashboard_payload.json`

```ts
type Status = "good" | "watch" | "warning" | "info";

interface DashboardPayload {
  meta: {
    demo_name: string;          // "Signal Foundry - Multi-Location Reputation Monitor" — DO NOT show; replace with brand
    scenario: string;           // "reputation_monitor"
    session_id: string;         // "demo_miners"
    generated_at: string;       // ISO timestamp
    source_mode: string;        // "synthetic_fallback"
    live_backend_url: string | null;
  };
  business: {
    name: string;               // "Miners-style Coffee Chain"
    city: string;               // "Prague"
    country: string;            // "CZ"
    locations_count: number;
    focus_location: string;     // "Miners Vinohrady"
  };
  navigation: string[];         // ["Overview","Alerts","Locations","Predictions","Labs","Reports"]
  kpis: Array<{
    id: string;
    label: string;              // "Avg sentiment (recent)"
    value: string;              // already formatted, e.g. "0.68" or "29.9%"
    delta: string;              // e.g. "-11.3%"
    status: Status;
    explanation: string;
  }>;
  locations: Array<{
    location_name: string;
    recent_sentiment: number;   // 0..1
    baseline_sentiment: number;
    sentiment_drop_pct: number; // 0..1; positive means a drop
    recent_review_count: number;
    baseline_review_count: number;
    status: Status;
  }>;
  alerts: Array<{
    alert_id: string;
    created_at: string;
    severity: Status;
    location_name: string;
    title: string;
    summary: string;
    primary_metric: { name: string; value: number; display: string };
    likely_cause: string;
    recommended_action: string;
    confidence: number;
    evidence: string[];
    linked_finding_ids: string[];
  }>;
  findings: FindingCard[];      // mirrored from finding_cards.json
  explanations: ExplanationCard[];
  labs: Array<{
    lab_id: string;
    lab_name: string;
    status: "selected" | "warning" | "suppressed" | "hidden";
    frontend_visibility: "active" | "suppressed";
    score: number;
    confidence: number;
    summary: string;
    recommended_actions: Array<{ detail: string }>;
    limitations: string[];
  }>;
  predictions: PredictionPayload; // mirrored from prediction_payload.json
  recommendations: Array<{ title: string; detail: string }>;
  reports: Array<{ report_id: string; title: string }>;
  chart_cards: ChartSpec[];     // mirrored from chart_specs.json
  time_series: {
    sentiment_trend: Array<Record<string, number | string>>;
  };
  data_quality: { source_mode: string; notes: string[] };
}
```

### 4.2 `chart_specs.json`

```ts
interface ChartSpec {
  id: string;                   // "chart_sentiment_trend"
  title: string;
  type: "line" | "bar" | "area";
  description: string;
  live_endpoint: string | null; // e.g. "/sessions/demo_miners/charts/sentiment_trend_by_location/data"
  x_key: string;                // "time"
  series: Array<{ key: string; label: string }>;
  interpretation: string;
  linked_findings: string[];
}
```

### 4.3 `prediction_payload.json`

```ts
interface PredictionPayload {
  sentiment_recovery: Array<{
    date: string;
    predicted_sentiment_no_action: number;
    predicted_sentiment_with_extra_staff: number;
    lower_bound_no_action: number;
    upper_bound_no_action: number;
    lower_bound_with_extra_staff: number;
    upper_bound_with_extra_staff: number;
  }>;
  queue_pressure: Array<{
    date: string;
    location: string;
    hour: number;
    predicted_queue_pressure_no_action: number;
    predicted_queue_pressure_with_extra_staff: number;
    estimated_wait_time_no_action_min: number;
    estimated_wait_time_with_extra_staff_min: number;
  }>;
  staffing_action: {
    location_name: string;
    action: string;
    expected_queue_pressure_reduction_pct: number;
    expected_wait_time_reduction_min: number;
    expected_sentiment_recovery_days: number;
    expected_complaint_reduction_pct: number;
    confidence: number;
  };
  competitor_impact: {
    location_name: string;
    detected_move: string;
    estimated_revenue_risk_pct: number;
    interpretation: string;
    confidence: number;
  };
}
```

### 4.4 `finding_cards.json`

```ts
interface FindingCard {
  finding_id: string;
  lab_id: string;
  title: string;
  severity: Status;
  frontend_visibility: "active" | "suppressed";
  what_was_found: string;
  why_it_matters: string;
  evidence: Array<{ label: string; value: string | number | null; detail?: string }>;
  likely_cause: string;
  recommended_action: string;
  confidence: number;
  score: number;
  caveats: string[];
  why_suppressed: string | null;
}
```

### 4.5 `explanation_cards.json`

```ts
interface ExplanationCard {
  id: string;
  title: string;             // "Why this alert fired"
  plain_language: string;
  technical_detail: string;
  confidence: number;
  chart_refs: string[];      // chart ids
  source_refs: string[];     // finding ids
}
```

### 4.6 `reports.json`

```ts
interface ReportCard {
  report_id: string;
  title: string;
  type: "executive_brief" | "incident_report" | "lab_decision" | "monitoring_plan" | "evidence_index" | string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
  linked_finding_ids: string[];
}
```

### 4.7 Live chart endpoint response

`GET {live}/sessions/demo_miners/charts/sentiment_trend_by_location/data?limit=200`

```ts
interface ChartDataResponse {
  chart_id: string;
  data: Array<{ time: string } & Record<string, number>>;
}
```

### 4.8 Refresh response

`POST {live}/sessions/demo_miners/refresh`

```ts
interface RefreshResponse {
  session_id: string;
  scenario: string;
  prediction_changed: boolean;
  models: Array<{ model_id: string; chart_ids: string[] }>;
  alert: { should_notify: boolean; reason?: string };
  dashboard_delta: { updated_chart_ids: string[] };
}
```

---

## 5. Pages (detailed)

### 5.1 Common chrome

- **Sidebar (left, 240px):**
  - Brand block: wordmark `0 → 100`, tagline below.
  - Section header `Workspace` then a dropdown that shows
    `business.name` (read-only for now; render as a static selector).
  - Section header `Pages`, then nav items: Overview, Alerts, Locations,
    Predictions, Research Labs, Findings, Why & How, Reports.
  - Section header `Status` at the bottom: small pill showing
    `source_mode` from `meta.source_mode` (`synthetic_fallback` → label
    "Demo data"), and last-generated timestamp.

- **Top bar:**
  - Left: page title + sub-title (e.g. "Reputation Monitor · Prague, CZ").
  - Right (only when live backend is configured):
    - A live-poll indicator: animated 8px dot + text
      "Live · polling every 5s".
    - Primary button **Refresh now**. While in-flight, swap label to
      "Refreshing..." and disable.
  - Right (when no live backend): a `Static demo bundle` pill.

- **Page shell:** 24px outer padding, max width 1280px, 12-column grid.

### 5.2 Overview page (`/`)

Composed of:

1. **KPI strip**: render every item in `kpis` as a `KpiCard` (label, value,
   delta in `status` color, info icon that opens a popover with `explanation`).
2. **Headline alert**: render the first item in `alerts` as `AlertCard`.
   - Title, summary, likely cause, recommended action, confidence pill.
   - Evidence as a bulleted list (max 5 visible, "Show all" to expand).
   - Severity gradient overlay; one-second pulse ring on first paint.
3. **Live sentiment chart** (`LiveSentimentChart`):
   - One line per series in `chart_specs.charts[0].series`.
   - X axis: time of refresh (HH:MM:SS), Y axis: 0..1.
   - When live backend exists, pull from `live_endpoint`. Otherwise plot
     `dashboard_payload.time_series.sentiment_trend`.
   - Underneath: `chartSpec.interpretation`, plus a dynamic line
     "Live: N refresh point(s) so far." when live mode is active.
4. **Sentiment ranking** (`RankingChart`): grouped bar chart, one group per
   location, two bars (baseline vs recent).
5. **Recovery forecast** (`RecoveryChart`): line chart with two series
   (no action vs extra staff) from `prediction_payload.sentiment_recovery`,
   plus shaded confidence-interval areas from the `lower_bound_*` /
   `upper_bound_*` fields.

### 5.3 Alerts page (`/alerts`)

- A vertical list of `AlertCard`s for every item in `alerts`.
- Each card shows: created_at (formatted relative + absolute on hover),
  location, severity pill, title, summary, primary_metric.display,
  likely_cause, recommended_action, confidence as a small bar (0..1),
  evidence list, and a "Linked findings" footer that lists
  `linked_finding_ids` as chips linking to the Findings page anchors.

### 5.4 Locations page (`/locations`)

- A sortable table of `locations` with columns: Location, Recent, Baseline,
  Drop, Recent reviews, Baseline reviews, Status.
- Row click expands to show:
  - A mini sparkline of that location's series from
    `time_series.sentiment_trend` (if present).
  - Any findings whose evidence mentions the location.
- Color the Drop cell red when `>= 0.15`, amber `>= 0.05`, green otherwise.

### 5.5 Predictions page (`/predictions`)

Two top cards side-by-side:

1. **Sentiment recovery scenarios** (`RecoveryChart` from
   `prediction_payload.sentiment_recovery`). Two lines + shaded CIs. Legend
   at top right. Interpretation below: *"Action scenario closes the gap to
   baseline in ~5 days; no-action drifts back over ~14."*
2. **Morning queue pressure** (`QueuePressureChart` from
   `prediction_payload.queue_pressure`). Grouped bars per date for 8 AM
   hour; two series (no action vs extra staff). Interpretation below.

Two bottom cards side-by-side:

3. **Staffing action forecast** (`PredictionCard`): renders
   `prediction_payload.staffing_action` with action text and four metrics
   (queue pressure reduction, wait-time reduction, sentiment recovery days,
   complaint reduction) plus a confidence pill.
4. **Competitor impact** (`PredictionCard`): renders
   `prediction_payload.competitor_impact` with detected move,
   revenue risk percent, interpretation, confidence.

### 5.6 Research Labs page (`/labs`)

- "Active labs" section: every lab in `labs` with `frontend_visibility ===
  "active"` as a `LabCard`.
  - Header: `lab_name` + `StatusBadge` (selected / warning).
  - Meta line: score, confidence.
  - Body: summary.
  - "Action" line: first item from `recommended_actions[0].detail`.
  - "Caveat" line: first `limitations[0]` if present, muted italic.
- "Suppressed weak signals" collapsible section: same card layout but
  visually deemphasized (75% opacity, no action line), defaulted open
  for the demo.

### 5.7 Findings page (`/findings`)

- "Active findings" vertical list (`FindingCard`):
  - Title + severity badge.
  - Meta: finding_id · lab_id · confidence.
  - "What was found", "Why it matters", "Recommended action".
  - Evidence grid (label : value · detail).
- "Suppressed findings" collapsible: same card with `why_suppressed`
  rendered as an italic muted line at the bottom.

### 5.8 Why & How page (`/explanations`)

- One `ExplanationCard` per item in `explanations`:
  - Title.
  - Confidence pill.
  - Plain-language paragraph.
  - Collapsible "Technical detail" disclosure.
  - Footer: chart refs as chips linking to anchors, source refs to findings.

### 5.9 Reports page (`/reports`)

- One long-form `ReportCard` per item in `reports.reports`:
  - Title, type tag (badge), report_id (muted small).
  - Summary paragraph.
  - Sections: render each `sections[]` item as `<h5>heading</h5><p>body</p>`.
  - Linked findings as chip footer.
- Provide a "Print / export" affordance per report that opens
  `window.print()` on a print-styled view (single column, white background).

---

## 6. Interactions

### 6.1 Refresh button

```ts
async function onRefresh() {
  const base = liveBackendUrl(dashboardPayload);
  if (!base) return;
  setRefreshing(true);
  try {
    const r1 = await fetch(`${base}/sessions/demo_miners/refresh`, { method: "POST" });
    const refresh = await r1.json();
    await fetch(`${base}/sessions/demo_miners/bundle/rebuild`, { method: "POST" });
    await queryClient.invalidateQueries({ queryKey: ["bundle"] });
    await queryClient.invalidateQueries({ queryKey: ["liveChart"] });
    toast.success(`Refreshed: ${refresh.models.length} models, prediction_changed=${refresh.prediction_changed}`);
  } catch (err) {
    toast.error(`Refresh failed: ${(err as Error).message}`);
  } finally {
    setRefreshing(false);
  }
}
```

### 6.2 Live chart polling

```ts
const { data } = useQuery({
  queryKey: ["liveChart", chartSpec.id],
  queryFn: async () => {
    const base = liveBackendUrl(payload);
    if (!base) return { chart_id: chartSpec.id, data: payload.time_series.sentiment_trend };
    const res = await fetch(`${base}${chartSpec.live_endpoint}?limit=200`);
    return res.json() as Promise<ChartDataResponse>;
  },
  refetchInterval: 5000,
  enabled: !!chartSpec.live_endpoint || !!payload.time_series.sentiment_trend,
});
```

### 6.3 Navigation deep-link

Each finding card has an `id={finding_id}` anchor so the chips in alert
cards (`linked_finding_ids`) can deep-link via `/findings#FINDING_001`.

---

## 7. Empty, loading, and error states

- **Loading:** skeleton shimmer cards matching final layout. Never spin in
  the center of the page.
- **Empty alerts / findings / labs:** small empty-state card with a neutral
  icon, "No active items" headline, and one-sentence body.
- **Bundle file missing:** show a banner at top of page: "Demo data not
  loaded. Run `POST /sessions/demo_miners/bundle/rebuild` on the backend."
- **Live backend unreachable:** keep showing the static bundle; replace the
  poll indicator with an amber "Live offline" pill and disable the
  Refresh button with a tooltip explaining why.

---

## 8. Iteration prompts (paste one per turn after the first build)

Iteration 1 - bootstrap:

> Wire React Router with routes `/`, `/alerts`, `/locations`, `/predictions`,
> `/labs`, `/findings`, `/explanations`, `/reports`. Build the Sidebar and
> TopBar components per section 5.1. Read `/bundle/dashboard_payload.json`
> via TanStack Query and show `business.name` in the workspace selector.
> No data rendering yet — just the chrome and routes.

Iteration 2 - Overview:

> Build the Overview page exactly as section 5.2. Use Recharts for the live
> chart, ranking chart, and recovery chart. The live chart must use the
> polling pattern from section 6.2 with a 5s `refetchInterval`. The KPI
> cards must use the exact `status` color tokens.

Iteration 3 - Alerts + Locations + Findings:

> Build `/alerts`, `/locations`, `/findings` per sections 5.3, 5.4, 5.7.
> Make sure `linked_finding_ids` chips deep-link to `/findings#<id>` and
> scroll into view.

Iteration 4 - Predictions + Labs + Why&How + Reports:

> Build `/predictions`, `/labs`, `/explanations`, `/reports` per sections
> 5.5, 5.6, 5.8, 5.9. Implement the print-export on report cards.

Iteration 5 - Live behaviors:

> Add the Refresh button per section 6.1, the live indicator, and the live
> offline fallback per section 7. Read backend URL per section 3.4. Add
> toast notifications using shadcn/ui's `toast`.

Iteration 6 - polish:

> Add subtle motion: 150ms fade-up on card mount, one-second pulse ring on
> the headline alert card on first paint, smooth chart transitions on
> data updates. Verify every chart shows its `interpretation` underneath
> exactly as the field text. Verify no hard-coded English strings disagree
> with the bundle data.

---

## 9. Acceptance criteria (must be true before declaring done)

1. The brand wordmark `0 → 100` is the only product name visible anywhere.
   No occurrence of "Signal Foundry" or "Data Foundry".
2. All eight pages render real data from the uploaded `/bundle/*.json` files.
3. The Overview live chart polls every 5 seconds when a live backend URL is
   configured, and falls back to `time_series.sentiment_trend` otherwise.
4. The Refresh button calls `/refresh` then `/bundle/rebuild`, invalidates
   the bundle queries, and triggers a toast describing the result.
5. Suppressed labs and suppressed findings are visually demoted and live
   under a collapsible panel; they never appear in the active lists.
6. The headline alert on Overview is the first item from `alerts` and shows
   title, summary, likely_cause, recommended_action, confidence, evidence.
7. Every chart shows its `interpretation` underneath verbatim.
8. Linked finding chips deep-link to anchored finding cards.
9. The Reports page renders all four report types and exposes a print view.
10. With no live backend configured, the app still loads, navigates, and
    renders all content from the static bundle without errors.

---

## 10. Reference: example values from the current bundle

These are taken straight from a fresh `bundle/rebuild`. Use them only to
verify your TypeScript types and your visual layout; do not hard-code.

```json
// dashboard_payload.kpis[0]
{
  "id": "kpi_avg_sentiment",
  "label": "Avg sentiment (recent)",
  "value": "0.68",
  "delta": "-11.3%",
  "status": "good",
  "explanation": "Mean recent-period sentiment across all monitored locations."
}

// dashboard_payload.locations[0]
{
  "location_name": "Miners Vinohrady",
  "recent_sentiment": 0.55,
  "baseline_sentiment": 0.785,
  "sentiment_drop_pct": 0.2994,
  "recent_review_count": 2,
  "baseline_review_count": 2,
  "status": "watch"
}

// dashboard_payload.alerts[0]
{
  "alert_id": "ALERT_001",
  "created_at": "2026-06-13T14:41:30+00:00",
  "severity": "warning",
  "location_name": "Miners Vinohrady",
  "title": "Miners Vinohrady sentiment dropped by 23% with slow service complaints clustering in recent feedback.",
  "summary": "Miners Vinohrady sentiment dropped by 23% with slow service complaints clustering in recent feedback.",
  "primary_metric": { "name": "sentiment_drop_pct", "value": 0.2994, "display": "-29.9%" },
  "likely_cause": "Investigate morning operations",
  "recommended_action": "Add one morning-shift staff member for three days",
  "confidence": 0.84,
  "evidence": [ "..." ],
  "linked_finding_ids": [ "FINDING_001" ]
}

// prediction_payload.staffing_action
{
  "location_name": "Miners Vinohrady",
  "action": "Add one morning-shift staff member for three days",
  "expected_queue_pressure_reduction_pct": 0.29,
  "expected_wait_time_reduction_min": 3.3,
  "expected_sentiment_recovery_days": 5,
  "expected_complaint_reduction_pct": 0.22,
  "confidence": 0.84
}

// chart_specs.charts[0]
{
  "id": "chart_sentiment_trend",
  "title": "Sentiment by location (live)",
  "type": "line",
  "description": "Per-location mean sentiment per refresh. Live; grows when /refresh is called.",
  "live_endpoint": "/sessions/demo_miners/charts/sentiment_trend_by_location/data",
  "x_key": "time",
  "series": [
    { "key": "miners_vinohrady_sentiment",  "label": "Miners Vinohrady"  },
    { "key": "miners_wenceslas_sentiment",  "label": "Miners Wenceslas"  },
    { "key": "miners_letna_sentiment",      "label": "Miners Letna"      }
  ],
  "interpretation": "..."
}
```

---

## 11. Rebrand notes for the bundle

The bundle still includes some legacy "Signal Foundry" strings inside
`meta.demo_name`. Treat these fields as **untrusted display strings**:

- Never show `meta.demo_name` to users. Replace with the fixed brand
  `0 to 100 · Reputation Monitor` derived from `business.name` and `business.city`.
- The lab and finding identifiers (`location_sentiment`, `peak_hours`, etc.)
  may be shown verbatim — they are not brand-bearing.

When the backend ships a brand-clean bundle later, the same component
will read it correctly without code changes.

---

## 12. Out of scope

- Auth, multi-tenant, multi-scenario switching.
- Writing back to the backend (only `/refresh` and `/bundle/rebuild` are POSTed).
- Mobile layout below 768px — design for desktop demo only.
- Real-time websockets — polling is sufficient.

---

End of brief.
