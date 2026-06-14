import { useState } from "react";
import { AlertTriangle, Database, RefreshCw, Send } from "lucide-react";

import { useSession } from "../../lib/SessionContext";
import { useAlerts, useLogContext } from "../../hooks/useSessionData";

function formatAgo(iso: string | null): string {
  if (!iso) return "never";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "never";
  const secs = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export function Topbar() {
  const { lastRefreshed, isRefreshing, refreshNow, lastError } = useSession();
  const alertsState = useAlerts(50);
  const logContext = useLogContext();

  const [note, setNote] = useState("");
  const [logBusy, setLogBusy] = useState(false);
  const [logFlash, setLogFlash] = useState<string | null>(null);

  const activeAlerts = alertsState.data?.count ?? null;

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    const message = note.trim();
    if (!message || logBusy) return;
    setLogBusy(true);
    setLogFlash(null);
    try {
      const r = await logContext(message);
      setNote("");
      setLogFlash(`Logged · ${r.total_entries} note${r.total_entries === 1 ? "" : "s"}`);
      window.setTimeout(() => setLogFlash(null), 2500);
    } catch (err) {
      setLogFlash(err instanceof Error ? err.message : "Failed to log");
    } finally {
      setLogBusy(false);
    }
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-sm font-semibold">0 to 100</div>
        <span className="text-slate-300">/</span>
        <div className="text-sm text-slate-600">Prague Coffee Chain Monitor</div>
      </div>

      <form onSubmit={submitNote} className="flex items-center gap-2 flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Log evidence (e.g. 12-min wait at Vinohrady)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={logBusy}
          className="flex-1 h-8 px-3 text-xs border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={logBusy || note.trim().length === 0}
          className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium rounded-md bg-slate-900 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Send size={12} />
          Log
        </button>
      </form>

      <div className="flex items-center gap-2 flex-shrink-0">
        {logFlash && <span className="text-[11px] text-slate-500">{logFlash}</span>}
        <span className="chip chip-neutral" title={lastRefreshed ?? ""}>
          <Database size={12} />
          {lastRefreshed ? `Updated ${formatAgo(lastRefreshed)}` : "Demo data"}
        </span>
        {typeof activeAlerts === "number" && activeAlerts > 0 && (
          <span className="chip chip-warning">
            <AlertTriangle size={12} />
            {activeAlerts} active alert{activeAlerts === 1 ? "" : "s"}
          </span>
        )}
        <button
          type="button"
          onClick={() => void refreshNow()}
          disabled={isRefreshing}
          title={lastError ?? "Trigger a backend refresh"}
          className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </header>
  );
}
