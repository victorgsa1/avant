import { forwardRef } from "react";
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps,
  type View,
} from "react-native";
import { tapHaptic, type TapHaptic } from "@/services/native/haptics";

export type HapticPressableProps = PressableProps & {
  /** Vibração ao tocar. Padrão `light`; `selection` para abas/opções; `none` desliga. */
  haptic?: TapHaptic;
};

/**
 * O Pressable do app: igual ao do React Native, com resposta tátil.
 *
 * Vibra no `onPress` (ao soltar o dedo), não no toque inicial — rolar a tela
 * por cima de um botão não vibra. Desabilitado não dispara `onPress`, então
 * também não vibra. Toque longo vibra um pouco mais firme.
 */
export const Pressable = forwardRef<View, HapticPressableProps>(function Pressable(
  { haptic = "light", onPress, onLongPress, ...props },
  ref,
) {
  return (
    <RNPressable
      ref={ref}
      {...props}
      onPress={
        onPress
          ? (event: GestureResponderEvent) => {
              tapHaptic(haptic);
              onPress(event);
            }
          : undefined
      }
      onLongPress={
        onLongPress
          ? (event: GestureResponderEvent) => {
              tapHaptic(haptic === "none" ? "none" : "medium");
              onLongPress(event);
            }
          : undefined
      }
    />
  );
});
