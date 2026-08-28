import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Persistência dos tokens de sessão.
 *
 * Nativo: `expo-secure-store` (Keychain no iOS, EncryptedSharedPreferences
 * no Android). Web: `localStorage` — o SecureStore não existe lá, e o app
 * web é usado só em dev.
 *
 * NUNCA guarde identidade ("sou admin") aqui: o backend deriva tudo do JWT.
 * Isto guarda apenas as credenciais opacas de sessão.
 */

const ACCESS_KEY = "avant.accessToken";
const REFRESH_KEY = "avant.refreshToken";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async save(tokens: StoredTokens): Promise<void> {
    await Promise.all([
      setItem(ACCESS_KEY, tokens.accessToken),
      setItem(REFRESH_KEY, tokens.refreshToken),
    ]);
  },

  async read(): Promise<StoredTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_KEY),
      getItem(REFRESH_KEY),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async clear(): Promise<void> {
    await Promise.all([removeItem(ACCESS_KEY), removeItem(REFRESH_KEY)]);
  },
};
