import { useCallback, useState } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { PreferencesResponse } from "@/services/http/types";

type PreferencesPatch = Partial<Omit<PreferencesResponse, "id" | "userId">>;

/**
 * Preferências do usuário com escrita otimista.
 *
 * Toggles precisam responder no toque; a chamada confirma depois. Se o
 * servidor recusar, o valor volta ao que era — o backend continua sendo a
 * autoridade, a tela só antecipa o resultado provável.
 */
export function usePreferences() {
  const resource = useAsyncResource(useCallback(() => usersApi.getPreferences(), []));
  const { mutate } = resource;

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const patch = useCallback(
    (input: PreferencesPatch) => {
      let previous: PreferencesResponse | null = null;

      mutate((current) => {
        previous = current;
        return { ...current, ...input };
      });

      setSaving(true);
      setError(null);

      void usersApi
        .updatePreferences(input)
        .then((updated) => mutate(() => updated))
        .catch((caught) => {
          setError(userMessage(caught));
          if (previous) mutate(() => previous as PreferencesResponse);
        })
        .finally(() => setSaving(false));
    },
    [mutate],
  );

  return { ...resource, patch, saving, actionError: error };
}

/** "19:00" a partir de minutos desde a meia-noite. */
export function minuteLabel(minute: number | null | undefined): string {
  if (minute == null) return "—";
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Avança o horário em passos de 30 min, dando a volta no fim do dia. */
export function nextHalfHour(minute: number | null | undefined, step = 30): number {
  const base = minute ?? 0;
  return (base + step) % (24 * 60);
}
