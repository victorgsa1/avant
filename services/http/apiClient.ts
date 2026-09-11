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
  /**
   * Boot: só o refresh token é persistido. O access token fica vazio até a
   * primeira requisição, que renova antes de chamar a rota (ver `request`).
   */
  async hydrate(): Promise<Tokens> {
    const refreshToken = await tokenStorage.readRefreshToken();
    tokens = refreshToken ? { accessToken: "", refreshToken } : null;
    return tokens;
  },

  async set(next: AuthTokens): Promise<void> {
    tokens = next;
    await tokenStorage.saveRefreshToken(next.refreshToken);
  },

  async clear(): Promise<void> {
    tokens = null;
    await tokenStorage.clear();
  },

  get current(): Tokens {
    return tokens;
  },

  /**
   * Access token válido para quem não passa pelo `request` (o socket do
   * chat). Renova antes se ainda não houver um — caso do boot, em que só o
   * refresh token vem do disco. Null sem sessão ou sem conseguir renovar.
   */
  async accessToken(): Promise<string | null> {
    if (!tokens) return null;
    if (!tokens.accessToken) await renewOrExpire().catch(() => undefined);
    return tokens?.accessToken || null;
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
  /** Upload de foto em rede móvel precisa de mais tempo que o padrão. */
  timeoutMs?: number;
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

/** O que o cliente usa de uma resposta — atendido tanto pelo fetch quanto pelo upload via XHR. */
type HttpResponse = Pick<Response, "ok" | "status" | "json" | "text">;

async function parseError(response: HttpResponse): Promise<ApiError> {
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

async function rawFetch(
  url: string,
  init: RequestInit,
  signal?: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // Encadeia o abort externo (desmontagem de tela) com o de timeout.
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    // Sem isto, "erro de conexão" esconde a causa real (timeout, upload
    // interrompido, certificado...). Só em dev: em produção não há console.
    if (__DEV__) console.warn(`[http] ${init.method ?? "GET"} ${url} falhou:`, error);
    if (controller.signal.aborted) {
      throw new ApiError(0, "TIMEOUT", "A conexão demorou demais. Tente de novo com uma rede melhor.");
    }
    throw ApiError.network();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

/**
 * Upload multipart pelo XMLHttpRequest do React Native.
 *
 * O `fetch` global do Expo (expo/fetch) não entende arquivos no formato do
 * RN — `{ uri, name, type }` dentro do FormData — e falha antes de enviar,
 * o que aparecia como "erro de conexão". O XHR do RN lê o arquivo direto do
 * disco e é o caminho de upload suportado.
 */
function xhrUpload(
  url: string,
  init: { method: string; headers: Record<string, string>; body: FormData },
  signal?: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init.method, url);
    for (const [name, value] of Object.entries(init.headers)) xhr.setRequestHeader(name, value);
    xhr.timeout = timeoutMs;

    const onExternalAbort = () => xhr.abort();
    signal?.addEventListener("abort", onExternalAbort);
    const cleanup = () => signal?.removeEventListener("abort", onExternalAbort);

    xhr.onload = () => {
      cleanup();
      const text = xhr.responseText ?? "";
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        text: async () => text,
        json: async () => JSON.parse(text),
      });
    };
    xhr.onerror = () => {
      cleanup();
      if (__DEV__) console.warn(`[http] upload ${init.method} ${url} falhou (status ${xhr.status})`);
      reject(ApiError.network());
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new ApiError(0, "TIMEOUT", "A conexão demorou demais. Tente de novo com uma rede melhor."));
    };
    xhr.onabort = () => {
      cleanup();
      reject(signal?.reason ?? new Error("Upload cancelado."));
    };

    xhr.send(init.body);
  });
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

/** Só 401/403 do servidor significam sessão morta (expirada, revogada, reuso). */
function isSessionRejected(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/**
 * Renova; se o SERVIDOR recusou a sessão, desloga. Falta de rede, timeout
 * ou API fora do ar (5xx/429) não desloga ninguém — antes, um restart da
 * API no meio de uma renovação apagava a sessão para sempre.
 */
async function renewOrExpire(): Promise<AuthTokens> {
  try {
    return await refreshTokens();
  } catch (error) {
    if (isSessionRejected(error)) {
      await authTokens.clear();
      onSessionExpired?.();
      throw new ApiError(401, "SESSION_EXPIRED", "Sua sessão expirou. Entre novamente.");
    }
    throw error;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal, timeoutMs } = options;
  const url = buildUrl(path, query);
  // FormData define o próprio Content-Type (com boundary) e sobe pelo XHR
  // do RN — ver `xhrUpload`.
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const send = async (accessToken?: string): Promise<HttpResponse> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    if (isForm) {
      return xhrUpload(url, { method, headers, body: body as FormData }, signal, timeoutMs);
    }

    return rawFetch(
      url,
      { method, headers, body: body === undefined ? undefined : JSON.stringify(body) },
      signal,
      timeoutMs,
    );
  };

  // Sessão restaurada do disco ainda sem access token: renova antes de
  // chamar, em vez de gastar uma ida ao servidor só para tomar 401.
  if (auth && tokens && !tokens.accessToken) {
    await renewOrExpire();
  }

  let response = await send(auth ? tokens?.accessToken : undefined);

  // 401 numa rota privada → tenta renovar uma vez e repetir.
  if (response.status === 401 && auth && tokens) {
    const next = await renewOrExpire();
    response = await send(next.accessToken);
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
