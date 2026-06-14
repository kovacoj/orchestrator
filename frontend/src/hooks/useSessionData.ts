// High-level data hooks tied to the active session. Each wraps
// `useApi` with a stable cache key derived from sessionId + relevant
// inputs, so they re-fetch automatically on Topbar Refresh.

import { useCallback } from "react";

import { api } from "../lib/api";
import { useSession } from "../lib/SessionContext";
import { useApi } from "./useApi";

export function useCards() {
  const { sessionId } = useSession();
  return useApi(`cards:${sessionId}`, () => api.cards(sessionId));
}

export function useAlerts(limit = 25) {
  const { sessionId } = useSession();
  return useApi(`alerts:${sessionId}:${limit}`, () => api.alerts(sessionId, limit));
}

export function useContextEntries(limit = 10) {
  const { sessionId } = useSession();
  return useApi(`context:${sessionId}:${limit}`, () => api.context(sessionId, limit));
}

export function useChartData(chartId: string) {
  const { sessionId } = useSession();
  return useApi(`chart:${sessionId}:${chartId}`, () => api.chartData(chartId, sessionId));
}

export function useForecastSales(horizonDays = 14) {
  const { sessionId } = useSession();
  return useApi(`forecast:${sessionId}:${horizonDays}`, () =>
    api.forecastSales(sessionId, horizonDays),
  );
}

export function useDashboard() {
  const { sessionId } = useSession();
  return useApi(`dashboard:${sessionId}`, () => api.dashboard(sessionId));
}

export function useRefreshSnapshot() {
  // The latest refresh payload includes models[], alert, decision_cards
  // and user_context. We hit /refresh on mount so the dashboard always
  // shows fresh derived state, even if the user never clicks Refresh.
  const { sessionId } = useSession();
  return useApi(`refresh:${sessionId}`, () => api.refresh(sessionId));
}

export function useLogContext() {
  const { sessionId, bump } = useSession();
  return useCallback(
    async (message: string, tags: string[] = []) => {
      const r = await api.logContext(message, { sessionId, tags });
      bump();
      return r;
    },
    [sessionId, bump],
  );
}
