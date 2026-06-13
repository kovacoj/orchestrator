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
import { labDecisions, labConfidenceData } from "../data/demoData";

export default function Labs() {
  const active = labDecisions.filter((l) => l.visibility === "active");
  const suppressed = labDecisions.filter((l) => l.visibility === "suppressed");

  return (
    <PageShell
      title="Research Labs"
      subtitle="Which research labs contributed evidence and which were suppressed as weak signals. Hidden labs never become recommendations."
    >
      <ChartCard
        title="Lab confidence"
        subtitle="0.0 (weakest) → 1.0 (strongest)"
        interpretation="The 0.60 threshold separates active evidence from suppressed weak signals."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={labConfidenceData}
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
              {labConfidenceData.map((d) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {active.map((lab) => (
            <LabDecisionCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>

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
    </PageShell>
  );
}
