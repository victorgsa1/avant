import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { authApi, usersApi } from "@/services/api";
import { chatSocket } from "@/services/chat/chatSocket";
import { authTokens } from "@/services/http/apiClient";
import { ApiError } from "@/services/http/ApiError";
import type { MeResponse } from "@/services/http/types";

/**
 * Sessão real do app.
 *
 * `loading`    → hidratando tokens do SecureStore no boot
 * `signedOut`  → sem sessão válida
 * `onboarding` → autenticado, mas ainda sem "direção" definida
 * `ready`      → autenticado e com onboarding concluído
 *
 * O provider não decide permissão: ele só reflete o que o backend responde.
 * Um 401 que sobrevive ao refresh derruba a sessão automaticamente.
 */
export type SessionStatus = "loading" | "signedOut" | "onboarding" | "ready";

type SessionValue = {
  status: SessionStatus;
  user: MeResponse | null;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) => Promise<void>;
  /** Marca o onboarding como concluído (após a identidade ser salva). */
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
  /** Recarrega `/me` — usado após editar perfil, ganhar XP, etc. */
  refreshUser: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

const deviceName = `${Platform.OS} ${Platform.Version ?? ""}`.trim();

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<MeResponse | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearSession = useCallback(async () => {
    // O socket carrega o token no handshake — derrubá-lo junto evita que
    // uma conexão antiga continue viva depois do logout.
    chatSocket.disconnect();
    await authTokens.clear();
    if (!mounted.current) return;
    setUser(null);
    setStatus("signedOut");
  }, []);

  /** Decide entre `onboarding` e `ready` perguntando ao backend. */
  const resolveStatusFor = useCallback(async (me: MeResponse) => {
    setUser(me);
    try {
      const identity = await usersApi.getIdentity();
      setStatus(identity?.statement ? "ready" : "onboarding");
    } catch {
      // Sem identidade acessível, o caminho seguro é refazer o onboarding —
      // ele é idempotente (upsert), então nada se perde.
      setStatus("onboarding");
    }
  }, []);

  // Boot: hidrata tokens e valida a sessão contra /me.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await authTokens.hydrate();
      if (cancelled) return;

      if (!stored) {
        setStatus("signedOut");
        return;
      }

      try {
        const me = await usersApi.me();
        if (cancelled) return;
        await resolveStatusFor(me);
      } catch (error) {
        if (cancelled) return;
        // Rede fora: mantém a sessão (não desloga por falta de sinal).
        if (error instanceof ApiError && error.isNetwork) {
          setStatus("ready");
          return;
        }
        await clearSession();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, resolveStatusFor]);

  // Um refresh que falhou já limpou os tokens no client — reflete aqui.
  useEffect(() => {
    authTokens.setOnSessionExpired(() => {
      chatSocket.disconnect();
      if (!mounted.current) return;
      setUser(null);
      setStatus("signedOut");
    });
    return () => authTokens.setOnSessionExpired(null);
  }, []);

  const signIn = useCallback<SessionValue["signIn"]>(
    async ({ email, password }) => {
      const auth = await authApi.login({ email, password, deviceName });
      await authTokens.set(auth.tokens);
      const me = await usersApi.me();
      await resolveStatusFor(me);
    },
    [resolveStatusFor],
  );

  const signUp = useCallback<SessionValue["signUp"]>(async (input) => {
    const auth = await authApi.register(input);
    await authTokens.set(auth.tokens);
    const me = await usersApi.me();
    setUser(me);
    // Conta nova sempre começa pelo onboarding.
    setStatus("onboarding");
  }, []);

  const completeOnboarding = useCallback(() => setStatus("ready"), []);

  const signOut = useCallback(async () => {
    const tokens = authTokens.current;
    if (tokens) {
      // Revoga no servidor (derruba também os sockets de chat). Se falhar,
      // a sessão local é limpa mesmo assim.
      await authApi.logout(tokens.refreshToken).catch(() => undefined);
    }
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const me = await usersApi.me();
    if (mounted.current) setUser(me);
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, completeOnboarding, signOut, refreshUser }),
    [completeOnboarding, refreshUser, signIn, signOut, signUp, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside a SessionProvider");
  }
  return value;
}
