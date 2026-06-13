import { LabDecision } from "../../data/demoData";
import { riskColor } from "../../utils/formatters";

export function LabDecisionCard({ lab }: { lab: LabDecision }) {
  const isActive = lab.visibility === "active";
  return (
    <div
      className={`card card-pad ${
        isActive ? "" : "opacity-80 bg-slate-50/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{lab.name}</div>
        <span
          className={`chip ${
            isActive ? riskColor("good") : riskColor("suppressed")
          }`}
        >
          {lab.decision}
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-1">
        Confidence {lab.confidence.toFixed(2)}
      </div>
      <div className="text-sm text-slate-700 mt-2">{lab.summary}</div>
      {!isActive && (
        <div className="text-[11px] italic text-slate-500 mt-2 leading-snug">
          Suppressed: weak signal — not used for active recommendations.
        </div>
      )}
    </div>
  );
}
