import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { PageShell } from "../components/layout/PageShell";
import { ChartCard } from "../components/dashboard/ChartCard";
import {
  predictions,
  sentimentRecoveryForecast,
  queuePressureForecast,
  waitTimeForecast,
} from "../data/demoData";
import { useForecastSales } from "../hooks/useSessionData";

const HORIZON_OPTIONS = [7, 14, 30] as const;

function formatEur(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M €`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k €`;
  return `${n.toFixed(0)} €`;
}

export default function Predictions() {
  const [horizon, setHorizon] = useState<(typeof HORIZON_OPTIONS)[number]>(14);
  const forecast = useForecastSales(horizon);

  const totals = forecast.data?.totals ?? null;
  const dailyRows = useMemo(
    () =>
      (forecast.data?.daily ?? []).map((row) => ({
        date: row.date.slice(5), // strip year for the axis
        baseline: row.baseline_eur,
        doNothing: row.do_nothing_eur,
        withIntervention: row.with_intervention_eur,
      })),
    [forecast.data],
  );

  return (
    <PageShell
      title="Predictions"
      subtitle="Live sales forecast from the backend's /forecasts/sales endpoint, plus the legacy demo scenario forecasts below."
    >
      {/* Live sales forecast */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Sales forecast (live)</div>
            <div className="text-xs text-slate-500">
              {forecast.status === "loading" && !forecast.data
                ? "Loading…"
                : forecast.status === "error"
                ? `Endpoint failed: ${forecast.error.message}`
                : forecast.data?.method ?? ""}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 mr-1">Horizon</span>
            {HORIZON_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setHorizon(d)}
                className={`h-7 px-2.5 text-xs font-medium rounded-md border ${
                  horizon === d
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 py-4 border-b border-slate-100">
            <Totals label="Baseline" value={formatEur(totals.baseline_horizon_revenue_eur)} />
            <Totals label="Do nothing" value={formatEur(totals.predicted_horizon_revenue_eur)} />
            <Totals
              label="With intervention"
              value={formatEur(totals.predicted_with_intervention_eur)}
              tone="good"
            />
            <Totals
              label="Net uplift"
              value={formatEur(totals.intervention_net_eur)}
              tone={totals.intervention_net_eur > 0 ? "good" : "warning"}
              hint={`gross ${formatEur(totals.intervention_uplift_eur)} − cost ${formatEur(
                totals.intervention_cost_eur,
              )}`}
            />
          </div>
        )}

        <div className="px-2 pt-2 pb-1 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyRows}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={16} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => formatEur(v)}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
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
                dataKey="doNothing"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                name="Do nothing"
              />
              <Line
                type="monotone"
                dataKey="withIntervention"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="With intervention"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {forecast.data?.narrative && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-600 italic">
            {forecast.data.narrative}
          </div>
        )}
      </div>

      {/* Legacy demo charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Sentiment recovery forecast"
          subtitle="Vinohrady · next 7 days · demo"
          interpretation="With extra morning staff, Vinohrady sentiment is expected to begin recovering within 3–5 days."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sentimentRecoveryForecast}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0.5, 0.75]} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="noAction"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                dot={false}
                name="No action"
              />
              <Line
                type="monotone"
                dataKey="extraStaff"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Extra staff"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Queue pressure forecast"
          subtitle="Vinohrady 8–9 AM · next 7 days · demo"
          interpretation="Extra staff lowers morning queue pressure by roughly 18% within a day."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={queuePressureForecast}
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0.5, 0.95]} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="noAction"
                stroke="#f43f5e"
                strokeDasharray="4 4"
                dot={false}
                name="No action"
              />
              <Line
                type="monotone"
                dataKey="extraStaff"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Extra staff"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Wait-time forecast"
        subtitle="Vinohrady · minutes · demo"
        interpretation="Expected wait-time reduction of about 2.5 minutes under the staffing action."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={waitTimeForecast}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[4, 9]} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="noAction"
              stroke="#f43f5e"
              fill="#fecdd3"
              fillOpacity={0.45}
              name="No action"
            />
            <Area
              type="monotone"
              dataKey="extraStaff"
              stroke="#10b981"
              fill="#a7f3d0"
              fillOpacity={0.55}
              name="Extra staff"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Prediction cards — demo */}
      <div>
        <div className="text-sm font-semibold mb-3">
          Forecast details <span className="text-xs text-slate-500 font-normal">(demo)</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {predictions.map((p) => (
            <div key={p.id} className="card card-pad">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="text-sm font-semibold">{p.title}</div>
                <span className="chip chip-neutral shrink-0">
                  Confidence {p.confidence.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{p.id}</div>
              <div className="text-sm text-slate-700">{p.summary}</div>
              <div className="mt-3">
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Drivers
                </div>
                <ul className="text-xs text-slate-700 space-y-0.5">
                  {p.drivers.map((d) => (
                    <li key={d} className="flex gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-[11px] italic text-slate-500 leading-snug">
                Uncertainty: {p.uncertainty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function Totals({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warning";
}) {
  const toneClass =
    tone === "good" ? "text-emerald-600" : tone === "warning" ? "text-rose-600" : "text-slate-900";
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}
