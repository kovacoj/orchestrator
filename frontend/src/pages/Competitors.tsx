import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { PageShell } from "../components/layout/PageShell";
import { ChartCard } from "../components/dashboard/ChartCard";
import { competitors, competitorPriceIndex } from "../data/demoData";

function statusChip(status: string): string {
  switch (status) {
    case "Promotion detected":
      return "chip-warning";
    case "Price increase":
      return "chip-watch";
    case "New seasonal menu":
      return "chip-opportunity";
    default:
      return "chip-good";
  }
}

export default function Competitors() {
  return (
    <PageShell
      badge={{ label: "demo data — no competitor endpoint yet" }}
      title="Competitors"
      subtitle="Tracked competitor moves across Prague. Promotions and price changes are treated as secondary context to operational signals."
    >
      <ChartCard
        title="Competitor price index"
        subtitle="indexed to 100 on May 27"
        interpretation="Competitor A cut prices ~12–14% from Jun 6, overlapping the Vinohrady incident window."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={competitorPriceIndex}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[80, 115]} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={100}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ value: "baseline", fontSize: 10, fill: "#64748b" }}
            />
            <Line
              type="monotone"
              dataKey="compA"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Competitor A (Vinohrady)"
            />
            <Line
              type="monotone"
              dataKey="compC"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Competitor C (Old Town)"
            />
            <Line
              type="monotone"
              dataKey="compD"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Competitor D (Wenceslas)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold">Tracked competitors</div>
          <div className="text-xs text-slate-500">
            Five competitor locations monitored for pricing and menu changes.
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {competitors.map((c) => (
            <div
              key={c.id}
              className="px-5 py-3 flex items-start justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-slate-500 mb-1">{c.district}</div>
                <div className="text-xs text-slate-700">{c.detail}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`chip ${statusChip(c.status)}`}>
                  {c.status}
                </span>
                <span className="text-[11px] text-slate-500">
                  Detected {c.detectedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-600 italic">
          Competitor moves are context, not primary cause. The Vinohrady alert
          is driven by operational service quality.
        </div>
      </div>
    </PageShell>
  );
}
