import { Finding } from "../../data/demoData";
import { riskColor } from "../../utils/formatters";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="text-sm font-semibold leading-snug">{finding.title}</div>
        <span className={`chip ${riskColor(finding.severity)} shrink-0`}>
          {finding.severity}
        </span>
      </div>
      <div className="text-xs text-slate-500 mb-3">
        Confidence {finding.confidence.toFixed(2)}
      </div>
      <Block label="What was found" body={finding.whatWasFound} />
      {finding.whyItMatters && (
        <Block label="Why it matters" body={finding.whyItMatters} />
      )}
      {finding.interpretation && (
        <Block label="Interpretation" body={finding.interpretation} />
      )}
      {finding.evidence && finding.evidence.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Evidence
          </div>
          <ul className="text-xs text-slate-700 space-y-0.5">
            {finding.evidence.map((e) => (
              <li key={e} className="flex gap-1.5">
                <span className="text-slate-400">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {finding.recommendedAction && (
        <div className="mt-3 p-2.5 rounded bg-emerald-50/70 text-xs text-emerald-900 border border-emerald-200/70">
          <span className="font-medium">Recommended action: </span>
          {finding.recommendedAction}
        </div>
      )}
      {finding.important && (
        <div className="mt-3 text-[11px] italic text-slate-500 leading-snug">
          {finding.important}
        </div>
      )}
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-2">
      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-xs text-slate-700">{body}</div>
    </div>
  );
}
