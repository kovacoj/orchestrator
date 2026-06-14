import { AlertTriangle, MapPin, Lightbulb } from "lucide-react";
import { mainAlert as demoMainAlert, type MainAlert } from "../../data/demoData";
import { riskColor } from "../../utils/formatters";

export function AlertCard({ alert }: { alert?: MainAlert } = {}) {
  const mainAlert = alert ?? demoMainAlert;
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-rose-50/40 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-base font-semibold">{mainAlert.title}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {mainAlert.locationName} ·{" "}
              <span className={`chip ${riskColor(mainAlert.severity)} ml-1`}>
                {mainAlert.severity}
              </span>
              <span className="ml-2 text-slate-400">
                confidence {mainAlert.confidence.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold text-rose-600 leading-none">
          {mainAlert.primaryMetric.display}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        <Section title="Summary" body={mainAlert.summary} />
        <Section title="Likely cause" body={mainAlert.likelyCause} />
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Evidence
          </div>
          <ul className="space-y-1 text-sm text-slate-700">
            {mainAlert.evidence.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
        <Section
          title="External context"
          body={mainAlert.externalContext + " — treated as secondary context."}
        />
        <div className="md:col-span-2 mt-1 p-4 rounded-md bg-emerald-50/60 border border-emerald-200/70">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Lightbulb size={12} /> Recommended action
          </div>
          <div className="text-sm text-emerald-900">
            {mainAlert.recommendedAction}
          </div>
        </div>
        <div className="md:col-span-2 text-xs text-slate-500 italic">
          Caveats: {mainAlert.caveats}
        </div>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
        {title}
      </div>
      <div className="text-sm text-slate-700">{body}</div>
    </div>
  );
}
