import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Preferências locais de UI (não sensíveis). Nunca guarde aqui nada que
 * decida permissão — o backend é a autoridade.
 */
const SOCIAL_USERNAME_CONFIRMED = "avant.socialUsernameConfirmed";
const THEME_MODE = "avant.themeMode";

/** "system" segue o aparelho; as outras duas fixam a aparência. */
export type ThemeMode = "system" | "light" | "dark";

export const uiPreferences = {
  async getThemeMode(): Promise<ThemeMode> {
    const value = await AsyncStorage.getItem(THEME_MODE);
    return value === "light" || value === "dark" ? value : "system";
  },

  async setThemeMode(mode: ThemeMode): Promise<void> {
    if (mode === "system") {
      await AsyncStorage.removeItem(THEME_MODE);
      return;
    }
    await AsyncStorage.setItem(THEME_MODE, mode);
  },

  async hasConfirmedUsername(userId: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(`${SOCIAL_USERNAME_CONFIRMED}.${userId}`);
    return value === "1";
  },

  async markUsernameConfirmed(userId: string): Promise<void> {
    await AsyncStorage.setItem(`${SOCIAL_USERNAME_CONFIRMED}.${userId}`, "1");
  },
};
