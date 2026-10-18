import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * iOS 26+ usa a tab bar do próprio sistema (Liquid Glass de verdade); o resto
 * usa a barra flutuante customizada. Ver `app/(tabs)/_layout.tsx`.
 */
export const USES_NATIVE_TABS = Platform.OS === "ios" && Number.parseInt(String(Platform.Version), 10) >= 26;

/** A barra nativa do iOS 26 termina 49pt acima da área segura de baixo. */
export const NATIVE_TAB_BAR_TOP = 49;

/** Altura da barra customizada (Android, web, iOS antigo) e do botão Avant ao lado dela. */
export const CUSTOM_TAB_BAR_HEIGHT = 62;

/**
 * Espaço que uma tela de aba deixa embaixo, somado a `useSafeAreaInsets().bottom`.
 *
 * Na barra nativa o inset de baixo da tela já inclui a barra, então só falta
 * a folga. Na customizada o inset é só o do aparelho: a barra (62 de altura +
 * 12 da borda) entra aqui também.
 */
export const TAB_BAR_CLEARANCE = USES_NATIVE_TABS ? 22 : CUSTOM_TAB_BAR_HEIGHT + 12 + 22;

/** `paddingBottom` de uma tela de aba: o conteúdo termina acima da barra. */
export function useTabBarClearance() {
  return useSafeAreaInsets().bottom + TAB_BAR_CLEARANCE;
}
