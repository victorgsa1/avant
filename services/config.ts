import Constants from "expo-constants";

/**
 * Base da API. Em dev, `EXPO_PUBLIC_API_URL` (em `.env`) sobrescreve para
 * apontar para uma máquina local. Sem ela, cai na produção do Railway.
 *
 * NUNCA coloque segredo aqui: tudo que é `EXPO_PUBLIC_*` vai para o bundle
 * do cliente e é público.
 */
const FALLBACK_API_URL = "https://avant-api-production.up.railway.app";

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, "");

  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (fromExtra) return fromExtra.replace(/\/+$/, "");

  return FALLBACK_API_URL;
}

export const API_URL = resolveApiUrl();

/** Prefixo global de versão da API (`app.setGlobalPrefix('v1')` no backend). */
export const API_PREFIX = "/v1";

/** Namespace do Socket.IO do chat. */
export const CHAT_NAMESPACE = "/chat";

export const config = {
  apiUrl: API_URL,
  apiBaseUrl: `${API_URL}${API_PREFIX}`,
  chatUrl: `${API_URL}${CHAT_NAMESPACE}`,
} as const;
