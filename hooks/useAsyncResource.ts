import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { userMessage } from "@/services/http/ApiError";

export interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  /** Recarregando com dados já na tela (pull-to-refresh). */
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Atualização otimista local, sem ida ao servidor. */
  mutate: (updater: (current: T) => T) => void;
}

/**
 * Busca assíncrona com recarga ao focar a tela.
 *
 * Evita repetir loading/erro/refresh em cada hook de feature. Requisições
 * de telas desmontadas são descartadas por um contador de geração — sem
 * `setState` depois do unmount.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  options: { refetchOnFocus?: boolean } = {},
): AsyncResource<T> {
  const { refetchOnFocus = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generation = useRef(0);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    const current = ++generation.current;
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetcherRef.current();
      if (!mounted.current || current !== generation.current) return;
      setData(result);
      setError(null);
    } catch (caught) {
      if (!mounted.current || current !== generation.current) return;
      setError(userMessage(caught));
    } finally {
      if (mounted.current && current === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) return;
      // Na primeira montagem o efeito acima já carregou; aqui é só o
      // retorno para a aba (ex.: completou algo em outra tela).
      if (generation.current > 0) void load("refresh");
    }, [load, refetchOnFocus]),
  );

  const refresh = useCallback(() => load("refresh"), [load]);

  const mutate = useCallback((updater: (current: T) => T) => {
    setData((current) => (current === null ? current : updater(current)));
  }, []);

  return { data, loading, refreshing, error, refresh, mutate };
}
