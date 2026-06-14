// Typed client for the experiment-lab FastAPI backend.
// Same-origin: the React bundle is served from /app/ on the same host
// that exposes /sessions/* — so base URL is empty by default.

import type {
  AlertsResponse,
  CardsResponse,
  ChartDataResponse,
  ContextListResponse,
  DashboardSpec,
  ForecastResponse,
  RefreshResponse,
  UserContextCreated,
} from "./types";

export const SESSION_ID = "demo_miners";

const RAW_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
export const API_BASE = RAW_BASE && RAW_BASE.length > 0 ? RAW_BASE.replace(/\/$/, "") : "";

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(`${init?.method ?? "GET"} ${path} -> ${res.status}`, res.status, body);
  }
  return res.json() as Promise<T>;
}

export const api = {
  refresh(sessionId: string = SESSION_ID, body: Record<string, unknown> = {}) {
    return request<RefreshResponse>(`/sessions/${sessionId}/refresh`, {
      method: "POST",
      body: JSON.stringify({ source: "frontend", mode: "demo", ...body }),
    });
  },
  cards(sessionId: string = SESSION_ID) {
    return request<CardsResponse>(`/sessions/${sessionId}/cards`);
  },
  alerts(sessionId: string = SESSION_ID, limit = 25) {
    return request<AlertsResponse>(`/sessions/${sessionId}/alerts?limit=${limit}`);
  },
  context(sessionId: string = SESSION_ID, limit = 10) {
    return request<ContextListResponse>(`/sessions/${sessionId}/context?limit=${limit}`);
  },
  logContext(
    message: string,
    opts: { sessionId?: string; source?: string; tags?: string[] } = {},
  ) {
    const sessionId = opts.sessionId ?? SESSION_ID;
    return request<UserContextCreated>(`/sessions/${sessionId}/context`, {
      method: "POST",
      body: JSON.stringify({
        message,
        source: opts.source ?? "frontend-chat",
        tags: opts.tags ?? [],
      }),
    });
  },
  chartData(chartId: string, sessionId: string = SESSION_ID) {
    return request<ChartDataResponse>(`/sessions/${sessionId}/charts/${chartId}/data`);
  },
  forecastSales(sessionId: string = SESSION_ID, horizonDays = 14) {
    return request<ForecastResponse>(
      `/sessions/${sessionId}/forecasts/sales?horizon_days=${horizonDays}`,
    );
  },
  dashboard(sessionId: string = SESSION_ID) {
    return request<DashboardSpec>(`/sessions/${sessionId}/dashboard`);
  },
};
