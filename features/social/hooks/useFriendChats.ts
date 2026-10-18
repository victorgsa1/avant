import { useCallback, useMemo, useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { useConversations } from "@/features/chat/hooks/useConversations";
import { userMessage } from "@/services/http/ApiError";
import type { ConversationResponse } from "@/services/http/types";

/**
 * A conversa direta com cada amigo, para a lista de Amigos mostrar quem
 * mandou mensagem. Os contadores ficam vivos pelo socket (ver
 * `useConversations`): chega mensagem, o balão acende; você lê em qualquer
 * aparelho, ele apaga.
 */
export function useFriendChats() {
  const { user } = useSession();
  const conversations = useConversations();
  const { data, openDirect } = conversations;
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const byFriend = useMemo(() => {
    const map = new Map<string, ConversationResponse>();
    for (const conversation of data ?? []) {
      if (conversation.type !== "DIRECT") continue;
      const other = conversation.participants.find((participant) => participant.id !== user?.id);
      if (other) map.set(other.id, conversation);
    }
    return map;
  }, [data, user?.id]);

  /**
   * Devolve o id da conversa com o amigo — a que já existe, ou uma nova
   * (o servidor devolve a existente se houver corrida). Null se falhar.
   */
  const conversationIdFor = useCallback(
    async (friendId: string): Promise<string | null> => {
      const existing = byFriend.get(friendId);
      if (existing) return existing.id;

      setOpeningId(friendId);
      setError(null);
      try {
        return (await openDirect(friendId)).id;
      } catch (caught) {
        setError(userMessage(caught));
        return null;
      } finally {
        setOpeningId(null);
      }
    },
    [byFriend, openDirect],
  );

  const chatWith = useCallback((friendId: string) => byFriend.get(friendId) ?? null, [byFriend]);

  return {
    ...conversations,
    chatWith,
    conversationIdFor,
    openingId,
    error,
  };
}
