import type * as HapticsLib from "expo-haptics";
import { hasNativeModule } from "./optionalNative";

/** expo-haptics, só quando o binário tem o módulo nativo (ver optionalNative). */
export const Haptics: typeof HapticsLib | null = hasNativeModule("ExpoHaptics")
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("expo-haptics") as typeof HapticsLib)
  : null;

/**
 * - `light`: toque padrão de botão.
 * - `medium`: toque longo / ação mais pesada.
 * - `selection`: troca de aba, opção ou interruptor.
 * - `none`: sem vibração.
 */
export type TapHaptic = "light" | "medium" | "selection" | "none";

/** Resposta tátil de toque. Nunca lança: vibração é detalhe, não pode quebrar um botão. */
export function tapHaptic(kind: TapHaptic = "light"): void {
  if (!Haptics || kind === "none") return;
  const request =
    kind === "selection"
      ? Haptics.selectionAsync()
      : Haptics.impactAsync(
          kind === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
        );
  void request.catch(() => undefined);
}
