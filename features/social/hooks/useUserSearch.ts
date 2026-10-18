import { useCallback, useEffect, useRef, useState } from "react";
import { friendsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { UserSearchResult } from "@/services/http/types";

export const MIN_QUERY = 2;
const DEBOUNCE_MS = 350;

/** Tira o "@" e espaços: as pessoas colam o @usuário do jeito que receberam. */
function cleanQuery(value: string): string {
  return value.trim().replace(/^@+/, "");
}

/**
 * Busca de pessoas por @usuário e envio do pedido de amizade.
 *
 * Debounce para não buscar a cada tecla, e um contador de geração para uma
 * resposta atrasada não sobrescrever a busca mais nova.
 */
export function useUserSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const generation = useRef(0);

  const term = cleanQuery(query);

  useEffect(() => {
    const current = ++generation.current;
    if (term.length < MIN_QUERY) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await friendsApi.search(term);
        if (current !== generation.current) return;
        setResults(found);
        setError(null);
      } catch (caught) {
        if (current !== generation.current) return;
        setError(userMessage(caught));
      } finally {
        if (current === generation.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term]);

  /**
   * "Adicionar" e "aceitar" são a mesma chamada: o backend aceita sozinho
   * quando já existe um pedido na direção contrária.
   */
  const addFriend = useCallback(async (person: UserSearchResult): Promise<boolean> => {
    if (person.relation !== "none" && person.relation !== "request_received") return false;

    setPendingId(person.id);
    setError(null);
    try {
      const result = await friendsApi.sendRequest(person.username);
      const relation = result.status === "friends" ? "friends" : "request_sent";
      setResults((current) => current.map((item) => (item.id === person.id ? { ...item, relation } : item)));
      return true;
    } catch (caught) {
      setError(userMessage(caught));
      return false;
    } finally {
      setPendingId(null);
    }
  }, []);

  return {
    query,
    setQuery,
    term,
    results,
    searching,
    error,
    pendingId,
    addFriend,
    /** Já buscou e não achou ninguém — distinto de "ainda digitando". */
    noResults: term.length >= MIN_QUERY && !searching && !error && results.length === 0,
  };
}
