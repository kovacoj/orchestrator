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

export default function Predictions() {
  return (
    <PageShell
      title="Predictions"
      subtitle="Forecasted outcomes under two scenarios: no action vs add one morning staff member for three days. Every forecast includes uncertainty."
    >
      {/* Scenario charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Sentiment recovery forecast"
          subtitle="Vinohrady · next 7 days"
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
          subtitle="Vinohrady 8–9 AM · next 7 days"
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
        subtitle="Vinohrady · minutes"
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

      {/* Prediction cards */}
      <div>
        <div className="text-sm font-semibold mb-3">Forecast details</div>
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
