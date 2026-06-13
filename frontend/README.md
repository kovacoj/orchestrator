# frontend/ — Signal Foundry Reputation Monitor Dashboard

A React + TypeScript + Vite + Tailwind + Recharts dashboard for the Prague
coffee-chain reputation-monitor demo. Local artificial data only — no live
backend required.

Spec: [`docs/reputation-dashboard-spec.md`](../docs/reputation-dashboard-spec.md).

## Quickstart

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

For a production build:

```bash
npm run build      # output in dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## Pages

| Route            | Purpose                                                      |
|------------------|--------------------------------------------------------------|
| `/dashboard`     | Overview — KPIs, main alert, revenue & sentiment trend       |
| `/alerts`        | Active warning with evidence, findings, signal timeline      |
| `/locations`     | All 10 Prague locations, sentiment heatmap, complaint chart  |
| `/predictions`   | No-action vs extra-staff forecasts (sentiment / queue / wait)|
| `/competitors`   | Competitor moves and price index (treated as secondary)      |
| `/labs`          | Selected vs suppressed research labs                         |
| `/reports`       | Five business-readable report tabs                           |
| `/data-quality`  | Provenance, dataset summary, safety rules                    |

## Architecture

```
src/
  data/demoData.ts            All artificial data lives here. Edit to change the demo story.
  components/
    layout/{Sidebar,Topbar,PageShell}.tsx
    dashboard/{KpiCard,AlertCard,ChartCard,FindingCard,LabDecisionCard}.tsx
  pages/                       One file per route.
  utils/formatters.ts
  App.tsx                      Router + shell.
  main.tsx                     Entry point.
  index.css                    Tailwind directives + small component classes.
```

There is no API client and no router data-loader. Every page imports its
demo data directly from `src/data/demoData.ts`. To change the demo numbers
(e.g. swap Vinohrady's sentiment drop), edit that one file.

## Demo story (locked)

- Main alert: **Vinohrady sentiment dropped 23%**.
- Likely cause: slow service during the 8–9 AM morning peak.
- Recommended action: **add one morning-shift staff member for three days** and monitor recovery.
- Competitor A promotion is shown but treated as **secondary context**.
- Individual staff attribution is **suppressed** (Staff/Shift Mention lab is hidden).
- Every chart includes a one-sentence interpretation. Every finding includes evidence + confidence.

## Acceptance checklist (from the spec)

- [x] Demo-ready visually.
- [x] Main alert is Vinohrady -23%.
- [x] Recommended action is one morning staff member for 3 days.
- [x] Competitor promo is secondary, not main cause.
- [x] Staff attribution is suppressed (Lab 5 hidden, no per-employee blame).
- [x] Every chart has an interpretation line below it.
- [x] Every prediction includes drivers + uncertainty + confidence.
- [x] Every finding includes evidence + severity + confidence.
- [x] Artificial-data disclaimer visible (Topbar badge + Data Quality page).
- [x] Works with no live API or DB (`npm run dev` is enough).

## Hooking up a real backend later

The eventual backend contract lives in `../README.md` §11. When ready, swap
the imports in `pages/*.tsx` from `../data/demoData` to a small API client
that hits:

- `GET /sessions/{id}/dashboard` → KPIs + chart specs
- `GET /sessions/{id}/charts/{chart_id}/data` → chart payload
- `GET /sessions/{id}/alerts` → alert objects

The component contracts will not need to change.
