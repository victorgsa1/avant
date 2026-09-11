import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Piece = {
  x: number;
  drift: number;
  /** Altura (y) onde o papel para de subir. */
  peak: number;
  delay: number;
  rise: number;
  size: number;
  color: string;
  spin: number;
  round: boolean;
};

/** Queda depois do pico, em px — um pouco de gravidade antes de sumir. */
const FALL_DISTANCE = 220;
const FALL_DURATION_MS = 1600;

function ConfettiPiece({ piece, height }: { piece: Piece; height: number }) {
  // 0 → 1: sobe do rodapé até o pico. 1 → 2: cai um pouco e some.
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(1, { duration: piece.rise, easing: Easing.out(Easing.cubic) }),
        withTiming(2, { duration: FALL_DURATION_MS, easing: Easing.in(Easing.quad) }),
      ),
    );
  }, [piece, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const rising = Math.min(p, 1);
    const falling = Math.max(p - 1, 0);
    const start = height + 30;
    return {
      opacity: p < 1.4 ? 1 : Math.max(0, 1 - (p - 1.4) / 0.6),
      transform: [
        { translateX: piece.x + piece.drift * p },
        { translateY: start - rising * (start - piece.peak) + falling * FALL_DISTANCE },
        { rotate: `${piece.spin * p}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.45,
          borderRadius: piece.round ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

type ConfettiBurstProps = {
  colors: string[];
  count?: number;
};

/**
 * Confete que sai do rodapé para cima, abre no alto e cai devagar. Roda
 * inteiro na UI thread (Reanimated) e não bloqueia toques.
 */
export function ConfettiBurst({ colors, count = 44 }: ConfettiBurstProps) {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 140,
        peak: height * (0.06 + Math.random() * 0.45),
        delay: Math.random() * 280,
        rise: 900 + Math.random() * 500,
        size: 7 + Math.random() * 7,
        color: colors[index % colors.length] ?? "#EA5A17",
        spin: (Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 420),
        round: Math.random() < 0.3,
      })),
    [colors, count, height, width],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} piece={piece} height={height} />
      ))}
    </View>
  );
}
