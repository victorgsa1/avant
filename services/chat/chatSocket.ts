import { io, type Socket } from "socket.io-client";
import { config } from "../config";
import { authTokens } from "../http/apiClient";
import type { MessageResponse } from "../http/types";

/**
 * Cliente do gateway de chat (Socket.IO, namespace `/chat`).
 *
 * O token vai no handshake — o servidor autentica ali e ainda revalida a
 * autorização em CADA evento (participação na conversa). O socket é só
 * transporte: histórico e estado vêm do REST, o socket entrega o que é novo.
 *
 * Uma única conexão para o app inteiro, compartilhada entre as telas.
 */

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadEvent {
  conversationId: string;
  userId: string;
  readAt: string;
}

type Ack<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

let socket: Socket | null = null;

function ensureSocket(): Socket | null {
  const tokens = authTokens.current;
  if (!tokens) return null;

  if (socket) {
    // Token renovado desde a última conexão: reconecta com o novo.
    const currentAuth = socket.auth as { token?: string } | undefined;
    if (currentAuth?.token !== tokens.accessToken) {
      socket.auth = { token: tokens.accessToken };
      if (socket.connected) socket.disconnect();
      socket.connect();
    }
    return socket;
  }

  socket = io(config.chatUrl, {
    transports: ["websocket"],
    auth: { token: tokens.accessToken },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
  });

  return socket;
}

export const chatSocket = {
  /** Abre (ou reaproveita) a conexão. Sem sessão, não faz nada. */
  connect(): Socket | null {
    return ensureSocket();
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
  },

  get connected(): boolean {
    return socket?.connected ?? false;
  },

  /** Assina um evento e devolve a função de cancelamento. */
  on<T>(event: string, handler: (payload: T) => void): () => void {
    const instance = ensureSocket();
    if (!instance) return () => undefined;
    instance.on(event, handler as (...args: unknown[]) => void);
    return () => {
      instance.off(event, handler as (...args: unknown[]) => void);
    };
  },

  onMessage(handler: (message: MessageResponse) => void): () => void {
    return chatSocket.on<MessageResponse>("message:new", handler);
  },

  onTyping(handler: (event: TypingEvent) => void): () => void {
    return chatSocket.on<TypingEvent>("typing", handler);
  },

  onRead(handler: (event: ReadEvent) => void): () => void {
    return chatSocket.on<ReadEvent>("conversation:read", handler);
  },

  /** Entra na sala de uma conversa (o servidor revalida a participação). */
  joinConversation(conversationId: string): void {
    ensureSocket()?.emit("conversation:join", { conversationId });
  },

  /**
   * Envia por socket. O REST continua sendo o caminho de fallback quando o
   * socket está fora — a mensagem é a mesma dos dois lados (mesmo clientId).
   */
  sendMessage(
    conversationId: string,
    body: string,
    clientId: string,
  ): Promise<MessageResponse | null> {
    const instance = ensureSocket();
    if (!instance?.connected) return Promise.resolve(null);

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 6_000);
      instance.emit(
        "message:send",
        { conversationId, body, clientId },
        (ack: Ack<MessageResponse>) => {
          clearTimeout(timer);
          resolve(ack?.ok ? ack.data : null);
        },
      );
    });
  },

  setTyping(conversationId: string, isTyping: boolean): void {
    const instance = ensureSocket();
    if (!instance?.connected) return;
    instance.emit("typing", { conversationId, isTyping });
  },

  markRead(conversationId: string, messageId?: string): void {
    const instance = ensureSocket();
    if (!instance?.connected) return;
    instance.emit("conversation:read", { conversationId, messageId });
  },
};
