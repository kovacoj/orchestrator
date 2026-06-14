import { PageShell } from "../components/layout/PageShell";
import { AlertCard } from "../components/dashboard/AlertCard";
import { FindingCard } from "../components/dashboard/FindingCard";
import { findings as demoFindings, mainAlert as demoMainAlert } from "../data/demoData";
import {
  useAlerts,
  useCards,
  useContextEntries,
  useRefreshSnapshot,
} from "../hooks/useSessionData";
import { alertToFinding, buildMainAlert, cardToFinding } from "../lib/adapters";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function Alerts() {
  const refresh = useRefreshSnapshot();
  const cards = useCards();
  const alertsResp = useAlerts(50);
  const contextResp = useContextEntries(10);

  const liveAlert = buildMainAlert(refresh.data, cards.data);
  const alertToShow = liveAlert ?? demoMainAlert;

  const cardFindings = (cards.data?.cards ?? []).map(cardToFinding);
  const alertFindings = (alertsResp.data?.alerts ?? []).map(alertToFinding);
  const liveFindings = [...alertFindings, ...cardFindings].filter(
    (f) => f.severity !== "suppressed",
  );
  const findings = liveFindings.length > 0 ? liveFindings : demoFindings.filter((f) => f.severity !== "suppressed");

  // Synthesize a live timeline from alerts + context entries so the
  // section keeps its narrative shape without requiring a dedicated
  // backend endpoint.
  const timeline = [
    ...(alertsResp.data?.alerts ?? []).map((a) => ({
      when: formatTimestamp(a.created_at),
      label: `${a.severity.toUpperCase()} · ${a.title}`,
      detail: a.body,
      kind: "alert" as const,
    })),
    ...(contextResp.data?.entries ?? []).map((e) => ({
      when: formatTimestamp(e.created_at),
      label: `Operator note · ${e.source}`,
      detail: e.message,
      kind: "note" as const,
    })),
  ].sort((a, b) => (a.when < b.when ? 1 : -1));

  return (
    <PageShell
      title="Alerts"
      subtitle="Live alerts from the backend, supporting findings from decision cards, plus the chronological signal timeline."
    >
      <AlertCard alert={alertToShow} />

      <div>
        <div className="text-sm font-semibold mb-3">
          Supporting findings{" "}
          <span className="text-xs text-slate-500 font-normal">
            ({liveFindings.length > 0 ? "live" : "demo fallback"})
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Signal timeline</div>
            <div className="text-xs text-slate-500">
              Chronological sequence of backend alerts + operator notes.
            </div>
          </div>
          <span className="chip chip-neutral">{timeline.length} events</span>
        </div>
        {timeline.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No alerts or operator notes recorded yet. Use the topbar to log evidence,
            then click Refresh.
          </div>
        ) : (
          <ol className="relative px-5 py-5">
            <span className="absolute left-[34px] top-5 bottom-5 w-px bg-slate-200" />
            {timeline.map((e, idx) => (
              <li key={idx} className="relative pl-10 pb-4 last:pb-0">
                <span
                  className={`absolute left-5 top-1 w-3 h-3 rounded-full border-2 ${
                    e.kind === "alert"
                      ? "bg-rose-500 border-rose-200"
                      : "bg-blue-500 border-blue-200"
                  }`}
                />
                <div className="text-xs text-slate-500">{e.when}</div>
                <div className="text-sm font-medium">{e.label}</div>
                <div className="text-xs text-slate-600">{e.detail}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageShell>
  );
}
