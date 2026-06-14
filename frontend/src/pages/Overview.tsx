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
  Legend,
} from "recharts";
import { PageShell } from "../components/layout/PageShell";
import { KpiCard } from "../components/dashboard/KpiCard";
import { AlertCard } from "../components/dashboard/AlertCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import {
  kpis as demoKpis,
  mainAlert as demoMainAlert,
  revenueByLocation,
  locationRiskRanking,
} from "../data/demoData";
import { riskColor } from "../utils/formatters";
import {
  useAlerts,
  useCards,
  useChartData,
  useForecastSales,
  useRefreshSnapshot,
} from "../hooks/useSessionData";
import { buildKpis, buildMainAlert } from "../lib/adapters";

const SENTIMENT_SERIES = [
  { key: "miners_vinohrady_sentiment", label: "Vinohrady", color: "#f43f5e" },
  { key: "miners_karlin_sentiment", label: "Karlín", color: "#3b82f6" },
  { key: "miners_letna_sentiment", label: "Letná", color: "#10b981" },
  { key: "miners_wenceslas_sentiment", label: "Wenceslas", color: "#a855f7" },
];

function formatTimeTick(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export default function Overview() {
  const refresh = useRefreshSnapshot();
  const cards = useCards();
  const alerts = useAlerts(25);
  const forecast = useForecastSales(14);
  const sentimentChart = useChartData("sentiment_trend_by_location");

  const liveKpis = buildKpis({
    refresh: refresh.data,
    alerts: alerts.data,
    forecast: forecast.data,
  });
  const liveAlert = buildMainAlert(refresh.data, cards.data);
  const usingDemoKpis = refresh.status !== "success" && refresh.data === null;
  const kpis = usingDemoKpis ? demoKpis : liveKpis;
  const alertToShow = liveAlert ?? demoMainAlert;

  const chartRows = sentimentChart.data?.data ?? [];

  return (
    <PageShell
      title="Overview"
      subtitle="Today's business health across all Prague locations, with the active warning surfaced at the top."
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      {/* Main alert */}
      <AlertCard alert={alertToShow} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Revenue by location (last 7 days)"
          subtitle="k CZK · demo data"
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
          title="Sentiment trend by location"
          subtitle={
            sentimentChart.status === "success"
              ? `live · ${chartRows.length} samples`
              : sentimentChart.status === "error"
              ? "live endpoint failed — empty"
              : "loading…"
          }
          interpretation="Vinohrady is consistently lowest. Re-hit Refresh in the topbar to pull a fresh snapshot."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartRows}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickFormatter={formatTimeTick}
                minTickGap={32}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0.4, 0.9]} />
              <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={formatTimeTick} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {SENTIMENT_SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={s.key === "miners_vinohrady_sentiment" ? 2.5 : 1.5}
                  dot={false}
                  name={s.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Location health list — demo data, no backend endpoint yet */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Location health</div>
            <div className="text-xs text-slate-500">
              Ranked by current risk level. Demo data — no per-location endpoint yet.
            </div>
          </div>
          <span className="chip chip-neutral">demo</span>
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
