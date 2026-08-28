import { config } from "../config";
import { tokenStorage, type StoredTokens } from "../storage/tokenStorage";
import { ApiError } from "./ApiError";
import type { AuthTokens } from "./types";

/**
 * Cliente HTTP tipado da API.
 *
 * Responsabilidades:
 *  - injeta `Authorization: Bearer <accessToken>` nas rotas privadas;
 *  - renova o access token em 401 (uma renovação por vez, compartilhada
 *    entre requisições concorrentes) e repete a requisição original;
 *  - normaliza erro para `ApiError` com `code` estável.
 *
 * Os tokens vivem em memória durante a sessão e são espelhados no
 * SecureStore. O backend continua sendo a autoridade: o cliente nunca
 * decide permissão, só transporta credencial.
 */

const REQUEST_TIMEOUT_MS = 20_000;

type Tokens = StoredTokens | null;

let tokens: Tokens = null;
let refreshPromise: Promise<AuthTokens> | null = null;
let onSessionExpired: (() => void) | null = null;

export const authTokens = {
  /** Carrega os tokens persistidos para a memória (boot do app). */
  async hydrate(): Promise<Tokens> {
    tokens = await tokenStorage.read();
    return tokens;
  },

  async set(next: AuthTokens): Promise<void> {
    tokens = next;
    await tokenStorage.save(next);
  },

  async clear(): Promise<void> {
    tokens = null;
    await tokenStorage.clear();
  },

  get current(): Tokens {
    return tokens;
  },

  /** Chamado quando o refresh falha — o SessionProvider desloga. */
  setOnSessionExpired(handler: (() => void) | null): void {
    onSessionExpired = handler;
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Rotas públicas (login/registro/refresh) não injetam o access token. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${config.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseError(response: Response): Promise<ApiError> {
  let code = "ERROR";
  let message = "Algo deu errado. Tente novamente.";
  let requestId: string | undefined;

  try {
    const data = (await response.json()) as {
      code?: string;
      message?: string;
      requestId?: string;
    };
    if (data.code) code = data.code;
    if (data.message) message = data.message;
    requestId = data.requestId;
  } catch {
    // resposta sem corpo JSON (502/504 do proxy, por exemplo)
  }

  return new ApiError(response.status, code, message, requestId);
}

async function rawFetch(url: string, init: RequestInit, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Encadeia o abort externo (desmontagem de tela) com o de timeout.
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw ApiError.network();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

/**
 * Renova o access token. Requisições concorrentes que tomarem 401 ao mesmo
 * tempo compartilham a MESMA promise — sem isso, N requisições disparariam
 * N rotações de refresh token e o backend detectaria reuso.
 */
async function refreshTokens(): Promise<AuthTokens> {
  if (refreshPromise) return refreshPromise;

  const current = tokens;
  if (!current) throw new ApiError(401, "NO_SESSION", "Sessão expirada.");

  refreshPromise = (async () => {
    const response = await rawFetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });

    if (!response.ok) throw await parseError(response);

    const data = (await response.json()) as { tokens: AuthTokens };
    await authTokens.set(data.tokens);
    return data.tokens;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = options;
  const url = buildUrl(path, query);

  const send = async (accessToken?: string): Promise<Response> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    return rawFetch(
      url,
      { method, headers, body: body === undefined ? undefined : JSON.stringify(body) },
      signal,
    );
  };

  let response = await send(auth ? tokens?.accessToken : undefined);

  // 401 numa rota privada → tenta renovar uma vez e repetir.
  if (response.status === 401 && auth && tokens) {
    try {
      const next = await refreshTokens();
      response = await send(next.accessToken);
    } catch {
      await authTokens.clear();
      onSessionExpired?.();
      throw new ApiError(401, "SESSION_EXPIRED", "Sua sessão expirou. Entre novamente.");
    }
  }

  if (!response.ok) throw await parseError(response);

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
