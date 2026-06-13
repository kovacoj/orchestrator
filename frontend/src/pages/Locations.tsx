import { PageShell } from "../components/layout/PageShell";
import { ChartCard } from "../components/dashboard/ChartCard";
import {
  locations,
  locationRiskRanking,
  sentimentHeatmap,
  vinohrady,
} from "../data/demoData";
import { riskColor } from "../utils/formatters";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function heatColor(v: number): string {
  // 0.4 (red) → 0.55 (amber) → 0.7+ (green)
  if (v < 0.55) return "#fda4af";
  if (v < 0.62) return "#fcd34d";
  if (v < 0.7) return "#bbf7d0";
  return "#86efac";
}

export default function Locations() {
  return (
    <PageShell
      title="Locations"
      subtitle="All 10 Prague locations ranked by risk, with sentiment heatmap and complaint counts."
    >
      {/* Risk ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {locationRiskRanking.slice(0, 3).map((l) => (
          <div key={l.id} className="card card-pad">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold">{l.name}</div>
              <span className={`chip ${riskColor(l.currentRiskLevel)}`}>
                {l.currentRiskLevel}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{l.district}</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Stat label="Sentiment" value={l.currentSentiment.toFixed(2)} />
              <Stat
                label="Δ vs baseline"
                value={`${l.sentimentChangePct > 0 ? "+" : ""}${
                  l.sentimentChangePct
                }%`}
                color={
                  l.sentimentChangePct < -5
                    ? "text-rose-600"
                    : l.sentimentChangePct < 0
                    ? "text-amber-600"
                    : "text-emerald-600"
                }
              />
              <Stat label="Main topic" value={l.mainTopic} />
              <Stat
                label="8–9 AM queue"
                value={l.queuePressure8to9am.toFixed(2)}
              />
            </div>
            {l.id === vinohrady.id && (
              <div className="mt-3 p-2.5 rounded bg-emerald-50/70 text-xs text-emerald-900 border border-emerald-200/70">
                <span className="font-medium">Recommendation: </span>
                Add one morning-shift staff member for three days.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold">
            Sentiment heatmap by location · last 14 days
          </div>
          <div className="text-xs text-slate-500">
            Each cell is the daily sentiment score (0..1). Cooler colors are
            better.
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="text-xs border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-slate-500 font-medium pr-3 pb-2">
                  Location
                </th>
                {sentimentHeatmap[0].cells.map((c) => (
                  <th
                    key={c.day}
                    className="text-slate-500 font-medium px-1 pb-2 text-center"
                  >
                    {c.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sentimentHeatmap.map((row) => (
                <tr key={row.id}>
                  <td className="pr-3 py-0.5 font-medium whitespace-nowrap">
                    {row.name}
                  </td>
                  {row.cells.map((c) => (
                    <td key={c.day} className="px-0.5 py-0.5">
                      <div
                        className="w-8 h-6 rounded text-[10px] flex items-center justify-center text-slate-800/70"
                        style={{ backgroundColor: heatColor(c.value) }}
                        title={`${row.name} · ${c.day}: ${c.value}`}
                      >
                        {c.value.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-600 italic">
          Vinohrady is the only location with a sustained warning-level
          sentiment drop in the last 7 days.
        </div>
      </div>

      {/* Complaint counts */}
      <ChartCard
        title="Complaint count by location (last 7 days)"
        interpretation="Vinohrady's complaint volume is well above any other location."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={locations.map((l) => ({
              name: l.name,
              complaints: l.complaintsLast7d,
            }))}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="complaints" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className={`font-medium ${color ?? "text-slate-900"}`}>{value}</div>
    </div>
  );
}
