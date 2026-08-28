import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "@/services/api";
import { chatSocket, type TypingEvent } from "@/services/chat/chatSocket";
import { userMessage } from "@/services/http/ApiError";
import type { ConversationResponse, MessageResponse } from "@/services/http/types";

/** Gera um id de cliente para tornar o envio idempotente sob retry. */
function newClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const TYPING_IDLE_MS = 2_500;

export interface PendingMessage extends MessageResponse {
  /** Mensagem otimista ainda não confirmada pelo servidor. */
  pending?: boolean;
  failed?: boolean;
}

/**
 * Uma conversa: histórico paginado por cursor (REST) + mensagens novas
 * (socket). Reconexão é estado normal — ao reconectar, refazemos o join e
 * recarregamos a primeira página para não perder nada do intervalo.
 */
export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const mounted = useRef(true);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTypingSent = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, []);

  /** Carrega a página mais recente e marca como lida. */
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, page] = await Promise.all([
        chatApi.conversation(conversationId),
        chatApi.messages(conversationId),
      ]);
      if (!mounted.current) return;
      setConversation(detail);
      // A API devolve do mais novo para o mais antigo; a lista invertida
      // do FlatList espera exatamente essa ordem.
      setMessages(page.items);
      setCursor(page.nextCursor);
      setError(null);

      const newest = page.items[0];
      chatSocket.markRead(conversationId, newest?.id);
      void chatApi.markRead(conversationId, newest?.id).catch(() => undefined);
    } catch (caught) {
      if (mounted.current) setError(userMessage(caught));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // Socket: join, mensagens novas, digitação, reconexão.
  useEffect(() => {
    chatSocket.connect();
    chatSocket.joinConversation(conversationId);

    const offMessage = chatSocket.onMessage((incoming) => {
      if (incoming.conversationId !== conversationId) return;
      setMessages((current) => {
        // Substitui a versão otimista pelo registro real (mesmo clientId).
        const optimisticIndex = incoming.clientId
          ? current.findIndex((item) => item.clientId === incoming.clientId)
          : -1;
        if (optimisticIndex >= 0) {
          const next = [...current];
          next[optimisticIndex] = incoming;
          return next;
        }
        if (current.some((item) => item.id === incoming.id)) return current;
        return [incoming, ...current];
      });
      chatSocket.markRead(conversationId, incoming.id);
    });

    const offTyping = chatSocket.onTyping((event: TypingEvent) => {
      if (event.conversationId !== conversationId) return;

      clearTimeout(typingTimers.current[event.userId]);
      if (!event.isTyping) {
        setTypingUserIds((current) => current.filter((id) => id !== event.userId));
        return;
      }

      setTypingUserIds((current) =>
        current.includes(event.userId) ? current : [...current, event.userId],
      );
      typingTimers.current[event.userId] = setTimeout(() => {
        setTypingUserIds((current) => current.filter((id) => id !== event.userId));
      }, TYPING_IDLE_MS + 1_000);
    });

    const offReady = chatSocket.on<unknown>("ready", () => {
      chatSocket.joinConversation(conversationId);
      void loadInitial();
    });

    return () => {
      offMessage();
      offTyping();
      offReady();
    };
  }, [conversationId, loadInitial]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await chatApi.messages(conversationId, cursor);
      if (!mounted.current) return;
      setMessages((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      // Falha ao paginar não derruba a tela — a pessoa pode tentar de novo.
    } finally {
      if (mounted.current) setLoadingMore(false);
    }
  }, [conversationId, cursor, loadingMore]);

  /**
   * Envia otimista: aparece na hora, confirma pelo socket (ou REST, se o
   * socket estiver fora). O `clientId` garante que um retry não duplique.
   */
  const send = useCallback(
    async (body: string, senderId: string) => {
      const text = body.trim();
      if (!text) return;

      const clientId = newClientId();
      const optimistic: PendingMessage = {
        id: `local-${clientId}`,
        conversationId,
        sender: null,
        type: "TEXT",
        body: text,
        clientId,
        createdAt: new Date().toISOString(),
        editedAt: null,
        pending: true,
      };
      setMessages((current) => [optimistic, ...current]);

      const settle = (real: MessageResponse | null, failed = false) => {
        setMessages((current) =>
          current.map((item) =>
            item.clientId === clientId
              ? real
                ? real
                : { ...item, pending: false, failed }
              : item,
          ),
        );
      };

      try {
        const viaSocket = await chatSocket.sendMessage(conversationId, text, clientId);
        if (viaSocket) {
          settle(viaSocket);
          return;
        }
        // Socket fora ou sem ack: o REST é a fonte de verdade mesmo assim.
        const viaRest = await chatApi.send(conversationId, text, clientId);
        settle(viaRest);
      } catch {
        settle(null, true);
      }
      void senderId;
    },
    [conversationId],
  );

  /** Sinaliza digitação com throttle — evita um evento por tecla. */
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < TYPING_IDLE_MS) return;
    lastTypingSent.current = now;
    chatSocket.setTyping(conversationId, true);
  }, [conversationId]);

  return {
    conversation,
    messages,
    loading,
    loadingMore,
    error,
    hasMore: cursor !== null,
    typingUserIds,
    loadMore,
    send,
    notifyTyping,
    reload: loadInitial,
  };
}
