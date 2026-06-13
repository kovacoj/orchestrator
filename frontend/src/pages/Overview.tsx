import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceArea,
  Legend,
} from "recharts";
import { PageShell } from "../components/layout/PageShell";
import { KpiCard } from "../components/dashboard/KpiCard";
import { AlertCard } from "../components/dashboard/AlertCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import {
  kpis,
  revenueByLocation,
  sentimentTrendVinohrady,
  locationRiskRanking,
} from "../data/demoData";
import { riskColor } from "../utils/formatters";

export default function Overview() {
  return (
    <PageShell
      title="Overview"
      subtitle="Today's business health across all 10 Prague locations, with the active warning surfaced at the top."
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      {/* Main alert */}
      <AlertCard />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Revenue by location (last 7 days)"
          subtitle="k CZK"
          interpretation="Vinohrady is material enough that reputation degradation matters operationally."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueByLocation}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => `${v}k CZK`}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="revenueK" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Vinohrady sentiment trend"
          subtitle="daily sentiment vs 7d rolling vs baseline"
          interpretation="The 7-day rolling sentiment falls materially below baseline during the incident window."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sentimentTrendVinohrady}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0.4, 0.8]} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceArea
                x1="Jun 4"
                x2="Jun 9"
                fill="#fee2e2"
                fillOpacity={0.45}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                dot={false}
                name="Baseline"
              />
              <Line
                type="monotone"
                dataKey="rolling7d"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="7d rolling"
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Daily"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Location health list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold">Location health</div>
          <div className="text-xs text-slate-500">
            Ranked by current risk level. Vinohrady is the only warning.
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {locationRiskRanking.map((l) => (
            <div
              key={l.id}
              className="px-5 py-3 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`chip ${riskColor(l.currentRiskLevel)}`}>
                  {l.currentRiskLevel}
                </span>
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500">{l.district}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <div className="text-slate-500">Sentiment</div>
                  <div className="font-medium text-slate-900">
                    {l.currentSentiment.toFixed(2)}{" "}
                    <span
                      className={
                        l.sentimentChangePct < -5
                          ? "text-rose-600"
                          : l.sentimentChangePct < 0
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      ({l.sentimentChangePct > 0 ? "+" : ""}
                      {l.sentimentChangePct}%)
                    </span>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-slate-500">Main topic</div>
                  <div className="font-medium text-slate-900">{l.mainTopic}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
