import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./useAuth";

export function useResource(path) {
  const { user } = useAuth();
  const key = (user?.id ?? "public") + ":" + path;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    key,
  });
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    api.get(path, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null, key });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error, key });
      },
    );
    return () => controller.abort();
  }, [path, revision, key]);
  return { ...state, loading: state.key !== key || state.loading, reload };
}
