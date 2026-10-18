import { useCallback, useEffect, useRef } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { chatApi } from "@/services/api";
import { chatSocket, type ReadEvent } from "@/services/chat/chatSocket";
import type { ConversationResponse, MessageResponse } from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";

type MessageDeletedEvent = { conversationId: string; messageId: string };

/**
 * Lista de conversas. O REST traz o estado; o socket mantém a lista viva
 * (nova mensagem sobe a conversa e incrementa o não-lido).
 *
 * Regras de consistência:
 * - mensagem minha (enviada daqui ou de outro aparelho) nunca vira não-lida;
 * - a mesma mensagem entregue duas vezes (reconexão) só conta uma vez;
 * - leitura minha em qualquer aparelho zera o contador na hora;
 * - ao reconectar, o REST é relido em silêncio — o que chegou enquanto o
 *   socket estava fora não passa pelo socket.
 */
export function useConversations() {
  const { user } = useSession();
  const myId = user?.id ?? null;

  const resource = useAsyncResource<ConversationResponse[]>(
    useCallback(() => chatApi.conversations(), []),
  );

  const { data, mutate, reload } = resource;

  // Lido fora do updater do `mutate`: decidir recarregar ali dentro seria
  // efeito colateral num updater de estado.
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    chatSocket.connect();

    const offMessage = chatSocket.onMessage((message: MessageResponse) => {
      const known = dataRef.current?.some((item) => item.id === message.conversationId);
      // Conversa nova (alguém acabou de abrir um DM): recarrega do REST.
      if (!known) {
        void reload();
        return;
      }

      const fromMe = message.sender?.id === myId;
      mutate((conversations) => {
        const index = conversations.findIndex((item) => item.id === message.conversationId);
        if (index === -1) return conversations;
        const current = conversations[index];
        if (current.lastMessage?.id === message.id) return conversations;

        const updated: ConversationResponse = {
          ...current,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: fromMe ? current.unreadCount : current.unreadCount + 1,
        };
        const rest = conversations.filter((_, i) => i !== index);
        return [updated, ...rest];
      });
    });

    const offRead = chatSocket.onRead((event: ReadEvent) => {
      if (event.userId !== myId) return;
      mutate((conversations) =>
        conversations.map((item) =>
          item.id === event.conversationId && item.unreadCount > 0 ? { ...item, unreadCount: 0 } : item,
        ),
      );
    });

    const offDeleted = chatSocket.on<MessageDeletedEvent>("message:deleted", (event) => {
      const affected = dataRef.current?.find((item) => item.id === event.conversationId);
      // A prévia mostrava a mensagem apagada: a nova prévia vem do REST.
      if (affected?.lastMessage?.id === event.messageId) void reload();
    });

    const offNew = chatSocket.on<ConversationResponse>("conversation:new", () => void reload());
    const offUpdated = chatSocket.on<unknown>("conversation:updated", () => void reload());
    const offReady = chatSocket.on<unknown>("ready", () => void reload());

    return () => {
      offMessage();
      offRead();
      offDeleted();
      offNew();
      offUpdated();
      offReady();
    };
  }, [mutate, myId, reload]);

  /** Abre (ou recupera) o DM com um amigo. */
  const openDirect = useCallback(
    async (userId: string) => {
      const conversation = await chatApi.createDirect(userId);
      await reload();
      return conversation;
    },
    [reload],
  );

  const totalUnread = data?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;

  return { ...resource, openDirect, totalUnread };
}
