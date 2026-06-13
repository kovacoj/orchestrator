# Signal Foundry — Reputation Monitor Frontend

React + TypeScript + Vite + Tailwind + Recharts dashboard for the Prague
coffee-chain reputation-monitor demo. Reference implementation of
[`docs/reputation-dashboard-spec.md`](../docs/reputation-dashboard-spec.md).

This is a self-contained subsystem. It ships with local artificial data
(`src/data/demoData.ts`) and does **not** require any live backend.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run typecheck  # type-check only
```

## Layout

- `src/App.tsx` — router; 8 pages mounted under the spec routes.
- `src/components/layout/` — `Sidebar`, `Topbar`, `PageShell`.
- `src/components/dashboard/` — `KpiCard`, `AlertCard`, `ChartCard`,
  `FindingCard`, `LabDecisionCard`.
- `src/pages/` — one file per route (`Overview`, `Alerts`, `Locations`,
  `Predictions`, `Competitors`, `Labs`, `Reports`, `DataQuality`).
- `src/data/demoData.ts` — single source of artificial demo data; edit here
  to change the demo story.
- `src/utils/formatters.ts` — number/currency/risk-color helpers.

## Demo story

A 10-location Prague coffee chain. Vinohrady (LOC_001) has a 23% sentiment
drop driven by slow service during the 8–9 AM peak; staffing was below
normal; a nearby competitor promotion is secondary context. The dashboard
recommends adding one morning-shift staff member for three days. See the
spec for the full narrative and acceptance criteria.

## Relationship to other subsystems

- `experiment-lab/app/static/index.html` — single-file dashboard served by
  the FastAPI slice at `/ui`. Same information architecture, served from
  the backend.
- `lovable.md` (repo root) — paste-ready Lovable prompt to regenerate this
  dashboard as a polished `0 to 100` product app from the backend bundle.
- `frontend/` (this dir) — in-repo TypeScript reference implementation that
  runs without a backend.
