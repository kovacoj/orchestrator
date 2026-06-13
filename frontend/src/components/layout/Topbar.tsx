import { CalendarDays, Database, AlertTriangle } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">0 to 100</div>
        <span className="text-slate-300">/</span>
        <div className="text-sm text-slate-600">Prague Coffee Chain Monitor</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip chip-neutral">
          <CalendarDays size={12} />
          Last 120 days
        </span>
        <span className="chip chip-neutral">
          <Database size={12} />
          Artificial demo data
        </span>
        <span className="chip chip-warning">
          <AlertTriangle size={12} />
          1 active warning
        </span>
      </div>
    </header>
  );
}
