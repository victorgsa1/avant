import { Easing, withDelay, withTiming, type EntryExitAnimationFunction } from "react-native-reanimated";

// Desacelera longamente no fim (ease-out quint): o elemento chega e
// "assenta", sem o tranco de mola nem o deslizamento longo dos presets.
const SETTLE = Easing.bezier(0.22, 1, 0.36, 1);

type SoftEnterOptions = {
  delay?: number;
  duration?: number;
  /** Deslocamento inicial em pontos — pequeno de propósito. */
  dx?: number;
  dy?: number;
};

/**
 * Entrada suave: fade-in com um deslocamento curto até a posição final.
 * Usada na tela de boas-vindas no lugar de FadeInUp/springify, que
 * pareciam fazer as coisas pularem.
 */
export function softEnter({ delay = 0, duration = 900, dx = 0, dy = 10 }: SoftEnterOptions = {}): EntryExitAnimationFunction {
  return () => {
    "worklet";
    const timing = (to: number) => withDelay(delay, withTiming(to, { duration, easing: SETTLE }));
    return {
      initialValues: { opacity: 0, transform: [{ translateX: dx }, { translateY: dy }] },
      animations: { opacity: timing(1), transform: [{ translateX: timing(0) }, { translateY: timing(0) }] },
    };
  };
}
