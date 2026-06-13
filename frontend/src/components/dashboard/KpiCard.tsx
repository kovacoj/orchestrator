import { Kpi } from "../../data/demoData";
import { riskColor } from "../../utils/formatters";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {kpi.label}
        </div>
        <span className={`chip ${riskColor(kpi.status)}`}>{kpi.status}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{kpi.value}</div>
      {kpi.delta && (
        <div className="text-xs text-slate-500 mt-1">{kpi.delta}</div>
      )}
      <div className="text-[11px] text-slate-400 mt-3 leading-snug">
        {kpi.hint}
      </div>
    </div>
  );
}
