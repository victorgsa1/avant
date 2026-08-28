import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Preferências locais de UI (não sensíveis). Nunca guarde aqui nada que
 * decida permissão — o backend é a autoridade.
 */
const SOCIAL_USERNAME_CONFIRMED = "avant.socialUsernameConfirmed";

export const uiPreferences = {
  async hasConfirmedUsername(userId: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(`${SOCIAL_USERNAME_CONFIRMED}.${userId}`);
    return value === "1";
  },

  async markUsernameConfirmed(userId: string): Promise<void> {
    await AsyncStorage.setItem(`${SOCIAL_USERNAME_CONFIRMED}.${userId}`, "1");
  },
};
