// Single-session context for the slice. Holds the active sessionId,
// a monotonic `refreshKey` (any data hook re-fetches when it changes),
// and a `lastRefreshed` timestamp displayed by the Topbar.
//
// `refreshNow()` triggers a backend POST /refresh and bumps the key on
// success. Errors are swallowed and recorded as `lastError` so the
// Topbar can surface them without breaking the rest of the dashboard.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { api, SESSION_ID } from "./api";

interface SessionContextValue {
  sessionId: string;
  refreshKey: number;
  lastRefreshed: string | null;
  isRefreshing: boolean;
  lastError: string | null;
  refreshNow: () => Promise<void>;
  bump: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  const refreshNow = useCallback(async () => {
    setIsRefreshing(true);
    setLastError(null);
    try {
      const r = await api.refresh();
      setLastRefreshed(r.dashboard_delta.last_updated);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessionId: SESSION_ID,
      refreshKey,
      lastRefreshed,
      isRefreshing,
      lastError,
      refreshNow,
      bump,
    }),
    [refreshKey, lastRefreshed, isRefreshing, lastError, refreshNow, bump],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
