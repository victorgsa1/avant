import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Persistência da sessão, seguindo as recomendações do expo-secure-store:
 *
 * - Só o REFRESH token vai para o disco. O access token (15 min) vive em
 *   memória e é renovado sob demanda — guardar uma credencial que expira
 *   em minutos só aumenta a superfície de ataque, sem ganho.
 * - iOS: `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` — legível depois do primeiro
 *   desbloqueio (a renovação funciona com o app em segundo plano) e nunca
 *   sai do aparelho por backup ou iCloud Keychain.
 * - Android: Keystore/EncryptedSharedPreferences; o config plugin exclui o
 *   SecureStore do backup automático (`configureAndroidBackup`), senão uma
 *   restauração traria dados impossíveis de decifrar.
 * - Leitura que falha (chave do Keystore invalidada, dado corrompido) vira
 *   "sem sessão" — nunca um app travado na tela de carregamento.
 *
 * Web: `localStorage` — o SecureStore não existe lá e o web é só dev.
 * NUNCA guarde identidade ("sou admin") aqui: o backend deriva tudo do JWT.
 */

const REFRESH_KEY = "avant.session.refreshToken";

// Formato v1: access + refresh com as opções padrão. Migrado uma única vez.
const LEGACY_REFRESH_KEY = "avant.refreshToken";
const LEGACY_KEYS = ["avant.accessToken", LEGACY_REFRESH_KEY];

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const isWeb = Platform.OS === "web";

async function write(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, OPTIONS);
}

async function read(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key, OPTIONS);
}

/** Remover nunca falha: limpar a sessão não pode travar o logout. */
async function remove(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key, OPTIONS).catch(() => undefined);
}

async function clearAll(): Promise<void> {
  await Promise.all([REFRESH_KEY, ...LEGACY_KEYS].map(remove));
}

/** Leva a sessão do formato v1 para o atual, sem deslogar quem já estava logado. */
async function migrateLegacy(): Promise<string | null> {
  const legacy = await read(LEGACY_REFRESH_KEY);
  await Promise.all(LEGACY_KEYS.map(remove));
  if (legacy) await write(REFRESH_KEY, legacy);
  return legacy;
}

export const tokenStorage = {
  async saveRefreshToken(refreshToken: string): Promise<void> {
    await write(REFRESH_KEY, refreshToken);
  },

  async readRefreshToken(): Promise<string | null> {
    try {
      return (await read(REFRESH_KEY)) ?? (await migrateLegacy());
    } catch {
      // Dado ilegível: começa sem sessão em vez de travar o boot.
      await clearAll();
      return null;
    }
  },

  clear: clearAll,
};
