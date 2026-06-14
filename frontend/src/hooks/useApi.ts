// Generic typed fetcher hook. Re-fires whenever the SessionContext
// `refreshKey` changes (i.e. on every Refresh button click) and on
// mount. Caller passes a stable `key` (string identifier) plus an
// async `loader` returning T.
//
// State machine: { status: "loading" | "success" | "error", data, error }.
// `data` and `error` are sticky across reloads so the UI never
// flashes to empty while a refresh is in flight.

import { useEffect, useRef, useState } from "react";

import { useSession } from "../lib/SessionContext";

export type ApiState<T> =
  | { status: "loading"; data: T | null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: T | null; error: Error };

export function useApi<T>(key: string, loader: () => Promise<T>): ApiState<T> & { reload: () => void } {
  const { refreshKey } = useSession();
  const [state, setState] = useState<ApiState<T>>({ status: "loading", data: null, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [localKey, setLocalKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ status: "loading", data: prev.data, error: null }));
    loaderRef
      .current()
      .then((data) => {
        if (cancelled) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({ status: "error", data: prev.data, error }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshKey, localKey]);

  return { ...state, reload: () => setLocalKey((k) => k + 1) };
}
