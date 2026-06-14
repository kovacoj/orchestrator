import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { PageShell } from "../components/layout/PageShell";
import { ChartCard } from "../components/dashboard/ChartCard";
import { LabDecisionCard } from "../components/dashboard/LabDecisionCard";
import { labDecisions as demoLabs } from "../data/demoData";
import { useRefreshSnapshot } from "../hooks/useSessionData";
import { modelToLabDecision } from "../lib/adapters";

export default function Labs() {
  const refresh = useRefreshSnapshot();
  const liveLabs = (refresh.data?.models ?? []).map(modelToLabDecision);
  const labs = liveLabs.length > 0 ? liveLabs : demoLabs;
  const isLive = liveLabs.length > 0;

  const active = labs.filter((l) => l.visibility === "active");
  const suppressed = labs.filter((l) => l.visibility === "suppressed");

  const confidenceData = labs.map((l) => ({
    name: l.name,
    confidence: l.confidence,
    decision: l.decision,
  }));

  return (
    <PageShell
      title="Research Labs"
      subtitle={
        isLive
          ? `Live labs from the latest refresh. ${active.length} selected, ${suppressed.length} suppressed.`
          : "Demo data — backend refresh did not return models yet."
      }
    >
      <ChartCard
        title="Lab confidence"
        subtitle={isLive ? "live · 0.0 → 1.0" : "demo · 0.0 → 1.0"}
        interpretation="The 0.60 threshold separates active evidence from suppressed weak signals."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={confidenceData}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <ReferenceLine
              y={0.6}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: "selection threshold",
                fontSize: 10,
                fill: "#64748b",
                position: "insideTopRight",
              }}
            />
            <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
              {confidenceData.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.decision === "Selected" ? "#3b82f6" : "#cbd5e1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <div className="text-sm font-semibold mb-3">Selected labs</div>
        {active.length === 0 ? (
          <div className="text-sm text-slate-500">No active labs in this refresh.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {active.map((lab) => (
              <LabDecisionCard key={lab.id} lab={lab} />
            ))}
          </div>
        )}
      </div>

      {suppressed.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3">Suppressed labs</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {suppressed.map((lab) => (
              <LabDecisionCard key={lab.id} lab={lab} />
            ))}
          </div>
          <div className="mt-3 text-[11px] italic text-slate-500 leading-snug max-w-2xl">
            Suppressed labs are never used for active recommendations. The
            Staff/Shift Mention Lab explicitly cannot produce individual staff
            attribution.
          </div>
        </div>
      )}
    </PageShell>
  );
}
