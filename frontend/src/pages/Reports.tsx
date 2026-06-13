import { PageShell } from "../components/layout/PageShell";
import { reports } from "../data/demoData";

export default function Reports() {
  return (
    <PageShell
      title="Reports"
      subtitle="Generated executive reports summarising the current situation, the incident, the forecasts, and the methodology."
    >
      <div className="space-y-5">
        {reports.map((r) => (
          <article key={r.id} className="card">
            <header className="px-5 py-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.id}</div>
                </div>
                <span className="chip chip-neutral shrink-0">{r.type}</span>
              </div>
              <p className="text-sm text-slate-700 mt-2">{r.summary}</p>
            </header>
            <div className="px-5 py-4 space-y-3">
              {r.sections.map((s) => (
                <section key={s.heading}>
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                    {s.heading}
                  </div>
                  <div className="text-sm text-slate-700">{s.body}</div>
                </section>
              ))}
            </div>
            {(r.linkedFindings.length > 0 || r.linkedCharts.length > 0) && (
              <footer className="px-5 py-3 border-t border-slate-100 text-xs text-slate-600">
                {r.linkedFindings.length > 0 && (
                  <div>
                    <span className="font-medium">Linked findings: </span>
                    {r.linkedFindings.join(", ")}
                  </div>
                )}
                {r.linkedCharts.length > 0 && (
                  <div>
                    <span className="font-medium">Linked charts: </span>
                    {r.linkedCharts.join(", ")}
                  </div>
                )}
              </footer>
            )}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
