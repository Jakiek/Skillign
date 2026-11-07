import { useEffect, useState } from 'react';
import { getApi } from '../data/api';

export function useApi<T>(path: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ path: string; data?: T; error?: string }>({ path });
  useEffect(() => {
    const controller = new AbortController();
    setState({ path });
    getApi<T>(path, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ path, data });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ path, error: error instanceof Error ? error.message : 'Data belum dapat dimuat. Coba lagi.' });
    });
    return () => controller.abort();
  }, [path, attempt]);
  const current = state.path === path ? state : { path };
  return { ...current, loading: current.data === undefined && !current.error, retry: () => setAttempt((n) => n + 1) };
}
