import { useState, useEffect, useRef } from "react";

type ApiFunction<T> = (...args: any[]) => Promise<{ data: T }>;

export function useApi<T>(apiFunc: ApiFunction<T>, ...args: any[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const argsRef = useRef(args);
  useEffect(() => {
    // Only update the ref if args actually changed deep-wise to avoid infinite loops,
    // For simplicity stringify check, assuming args are mostly simple types like ids
    if (JSON.stringify(argsRef.current) !== JSON.stringify(args)) {
      argsRef.current = args;
    }
  }, [args]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...argsRef.current);
      setData(response.data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || "Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunc, argsRef.current]);

  return { data, loading, error, refetch: fetchData };
}
