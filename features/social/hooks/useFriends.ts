import { useCallback, useState } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { friendsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { FriendRequestsResponse, FriendResponse } from "@/services/http/types";

interface FriendsPayload {
  friends: FriendResponse[];
  requests: FriendRequestsResponse;
}

/**
 * Amigos e pedidos de amizade. Nada aqui é otimista: aceitar muda as duas
 * listas e pode falhar (bloqueio, pedido já desfeito do outro lado), então a
 * tela espera o servidor e relê.
 */
export function useFriends() {
  const resource = useAsyncResource<FriendsPayload>(
    useCallback(async () => {
      const [friends, requests] = await Promise.all([friendsApi.list(), friendsApi.requests()]);
      return { friends, requests };
    }, []),
  );

  const { reload } = resource;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = useCallback(
    async (id: string, operation: () => Promise<unknown>) => {
      setBusyId(id);
      setActionError(null);
      try {
        await operation();
        await reload();
      } catch (error) {
        setActionError(userMessage(error));
      } finally {
        setBusyId(null);
      }
    },
    [reload],
  );

  const accept = useCallback((requestId: string) => run(requestId, () => friendsApi.accept(requestId)), [run]);

  /** Recusar um recebido e cancelar um enviado são a mesma chamada. */
  const removeRequest = useCallback(
    (requestId: string) => run(requestId, () => friendsApi.removeRequest(requestId)),
    [run],
  );

  const removeFriend = useCallback((userId: string) => run(userId, () => friendsApi.remove(userId)), [run]);

  return {
    ...resource,
    friends: resource.data?.friends ?? [],
    incoming: resource.data?.requests.incoming ?? [],
    outgoing: resource.data?.requests.outgoing ?? [],
    busyId,
    actionError,
    accept,
    removeRequest,
    removeFriend,
  };
}
