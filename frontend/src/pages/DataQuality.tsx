import { PageShell } from "../components/layout/PageShell";
import { reports } from "../data/demoData";

const dqReport = reports.find((r) => r.id === "REP_005");

export default function DataQuality() {
  return (
    <PageShell
      badge={{ label: "demo data — no data-quality endpoint yet", tone: "warning" }}
      title="Data Quality"
      subtitle="Data provenance, coverage, and known limitations for this demo."
    >
      <div className="card card-pad bg-amber-50/60 border-amber-200">
        <div className="flex items-start gap-3">
          <span className="chip chip-warning shrink-0">Disclaimer</span>
          <div className="text-sm text-amber-900">
            All data shown in this dashboard is{" "}
            <span className="font-semibold">artificial demo data</span>. No live
            Apify, no live review APIs, no real customer or employee data. Do
            not use these numbers or forecasts for real business decisions.
          </div>
        </div>
      </div>

      {dqReport && (
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="text-sm font-semibold">{dqReport.title}</div>
            <p className="text-sm text-slate-700 mt-1">{dqReport.summary}</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {dqReport.sections.map((s) => (
              <section key={s.heading}>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                  {s.heading}
                </div>
                <div className="text-sm text-slate-700">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="card card-pad">
        <div className="text-sm font-semibold mb-2">Safety rules</div>
        <ul className="text-sm text-slate-700 space-y-1">
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>
              Findings use hedged language: "Evidence suggests…", "Likely cause
              is…", "Treated as secondary context…".
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Issues are never attributed to individual employees.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Recovery is never claimed as guaranteed.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>
              The artificial-data disclaimer is visible on every page through
              the topbar badge.
            </span>
          </li>
        </ul>
      </div>
    </PageShell>
  );
}
