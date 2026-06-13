import { PageShell } from "../components/layout/PageShell";
import { AlertCard } from "../components/dashboard/AlertCard";
import { FindingCard } from "../components/dashboard/FindingCard";
import { findings, alertTimeline } from "../data/demoData";

export default function Alerts() {
  const active = findings.filter((f) => f.severity !== "suppressed");
  return (
    <PageShell
      title="Alerts"
      subtitle="One active warning. Below: the alert, the supporting findings, and the chronological timeline of the signals that combined to fire it."
    >
      <AlertCard />

      <div>
        <div className="text-sm font-semibold mb-3">Supporting findings</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {active.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold">Signal timeline</div>
          <div className="text-xs text-slate-500">
            Chronological sequence of signals that combined into the alert.
          </div>
        </div>
        <ol className="relative px-5 py-5">
          <span className="absolute left-[34px] top-5 bottom-5 w-px bg-slate-200" />
          {alertTimeline.map((e, idx) => (
            <li key={idx} className="relative pl-10 pb-4 last:pb-0">
              <span
                className={`absolute left-5 top-1 w-3 h-3 rounded-full border-2 ${
                  e.label === "Alert generated"
                    ? "bg-rose-500 border-rose-200"
                    : e.label === "Recommended action proposed"
                    ? "bg-emerald-500 border-emerald-200"
                    : "bg-slate-300 border-white"
                }`}
              />
              <div className="text-xs text-slate-500">{e.when}</div>
              <div className="text-sm font-medium">{e.label}</div>
              <div className="text-xs text-slate-600">{e.detail}</div>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
