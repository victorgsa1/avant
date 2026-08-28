import { useCallback, useEffect } from "react";
import { chatApi } from "@/services/api";
import { chatSocket } from "@/services/chat/chatSocket";
import type { ConversationResponse, MessageResponse } from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";

/**
 * Lista de conversas. O REST traz o estado; o socket mantém a lista viva
 * (nova mensagem sobe a conversa e incrementa o não-lido).
 */
export function useConversations() {
  const resource = useAsyncResource<ConversationResponse[]>(
    useCallback(() => chatApi.conversations(), []),
  );

  const { mutate, refresh } = resource;

  useEffect(() => {
    chatSocket.connect();

    const offMessage = chatSocket.onMessage((message: MessageResponse) => {
      mutate((conversations) => {
        const index = conversations.findIndex((item) => item.id === message.conversationId);
        // Conversa nova (alguém acabou de abrir um DM): recarrega do REST.
        if (index === -1) {
          void refresh();
          return conversations;
        }
        const updated: ConversationResponse = {
          ...conversations[index],
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: conversations[index].unreadCount + 1,
        };
        const rest = conversations.filter((_, i) => i !== index);
        return [updated, ...rest];
      });
    });

    const offNew = chatSocket.on<ConversationResponse>("conversation:new", () => void refresh());
    const offUpdated = chatSocket.on<unknown>("conversation:updated", () => void refresh());

    return () => {
      offMessage();
      offNew();
      offUpdated();
    };
  }, [mutate, refresh]);

  /** Abre (ou recupera) o DM com um amigo. */
  const openDirect = useCallback(
    async (userId: string) => {
      const conversation = await chatApi.createDirect(userId);
      await refresh();
      return conversation;
    },
    [refresh],
  );

  const totalUnread =
    resource.data?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;

  return { ...resource, openDirect, totalUnread };
}
