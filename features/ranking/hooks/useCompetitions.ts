import { useCallback, useState } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { competitionsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/**
 * Competições do usuário, já separadas por estado pelo backend.
 *
 * Aceitar/recusar não é otimista: entrar numa competição pode falhar por
 * lotação, e mostrar a pessoa dentro para depois tirar seria pior do que
 * esperar meio segundo.
 */
export function useCompetitions() {
  const resource = useAsyncResource(useCallback(() => competitionsApi.list(), []));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = useCallback(
    (id: string, action: () => Promise<unknown>) => {
      if (busyId) return;
      setBusyId(id);
      setActionError(null);

      void action()
        .then(() => resource.refresh())
        .catch((caught) => setActionError(userMessage(caught)))
        .finally(() => setBusyId(null));
    },
    [busyId, resource],
  );

  return {
    ...resource,
    busyId,
    actionError,
    accept: (id: string) => run(id, () => competitionsApi.join(id)),
    decline: (id: string) => run(id, () => competitionsApi.decline(id)),
    leave: (id: string) => run(id, () => competitionsApi.leave(id)),
    cancel: (id: string) => run(id, () => competitionsApi.cancel(id)),
  };
}
