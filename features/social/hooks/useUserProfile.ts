import { useCallback, useState } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { friendsApi, usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { PublicProfileResponse } from "@/services/http/types";

/**
 * O perfil de outra pessoa e o que dá para fazer com o pedido de amizade
 * dali mesmo. Como em `useFriends`, nada é otimista: aceitar pode falhar
 * (bloqueio, pedido desfeito do outro lado), então espera o servidor.
 */
export function useUserProfile(userId: string) {
  const resource = useAsyncResource<PublicProfileResponse>(
    useCallback(() => usersApi.profile(userId), [userId]),
  );

  const { reload } = resource;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  /** `true` se deu certo — quem chama decide se fica ou volta. */
  const run = useCallback(async (operation: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    setActionError(null);
    try {
      await operation();
      return true;
    } catch (error) {
      setActionError(userMessage(error));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  /** Aceitar deixa a pessoa como amiga: relê para o perfil mostrar isso. */
  const accept = useCallback(
    async (requestId: string) => {
      const ok = await run(() => friendsApi.accept(requestId));
      if (ok) await reload();
      return ok;
    },
    [reload, run],
  );

  /**
   * Recusar um recebido e cancelar um enviado são a mesma chamada. Sem o
   * pedido, o perfil pode sair do alcance (quem não aparece na busca), então
   * não relê: a tela volta.
   */
  const removeRequest = useCallback(
    (requestId: string) => run(() => friendsApi.removeRequest(requestId)),
    [run],
  );

  const sendRequest = useCallback(
    async (username: string) => {
      const ok = await run(() => friendsApi.sendRequest(username));
      if (ok) await reload();
      return ok;
    },
    [reload, run],
  );

  return { ...resource, busy, actionError, accept, removeRequest, sendRequest };
}
