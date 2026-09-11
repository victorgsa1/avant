import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { FlameIcon, SparkleIcon } from "@/components/ui/icons";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ConfettiBurst } from "@/features/rewards/components/ConfettiBurst";
import { playCelebrationHaptics } from "@/features/rewards/celebrationHaptics";

/** O XP "rola" até o valor ganho, desacelerando no fim. */
function useCountUp(target: number, durationMs: number, delayMs: number): number {
  const [value, setValue] = useState(durationMs === 0 ? target : 0);

  useEffect(() => {
    if (durationMs === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delayMs, durationMs, target]);

  return value;
}

/**
 * Fecha o ciclo da ação principal: confete subindo, o XP contando e a
 * barra de nível enchendo. Os números vêm da resposta do servidor. Com
 * "reduzir movimento" ligado no aparelho, tudo aparece sem animação.
 */
export default function ActionRewardScreen() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{
    title?: string;
    xp?: string;
    level?: string;
    progress?: string;
    remaining?: string;
    streak?: string;
    leveledUp?: string;
  }>();

  const xp = Number(params.xp ?? 0);
  const level = params.level ? Number(params.level) : null;
  const progress = Math.min(100, Math.max(0, Number(params.progress ?? 0)));
  const remaining = Number(params.remaining ?? 0);
  const streak = Number(params.streak ?? 0);
  const leveledUp = params.leveledUp === "1";

  const shownXp = useCountUp(xp, reduceMotion ? 0 : 900, 350);

  const confettiColors = useMemo(
    () => [colors.ember, colors.emberWarm, colors.arcStrong, colors.arcMid, colors.emberSoft, "#F2B53A"],
    [colors],
  );

  const fill = useSharedValue(reduceMotion ? progress : 0);
  useEffect(() => {
    if (reduceMotion) {
      fill.value = progress;
      return;
    }
    fill.value = withDelay(750, withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [fill, progress, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  // Vibra junto com o confete. Sem confete (reduzir movimento), só o "sucesso".
  useEffect(() => playCelebrationHaptics(!reduceMotion), [reduceMotion]);

  return (
    <Screen>
      <View className="flex-1 px-6" style={{ paddingTop: 52, paddingBottom: 34 }}>
        <View className="items-center">
          <Animated.View entering={ZoomIn.springify().damping(12).delay(120)}>
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 96,
                height: 96,
                backgroundColor: colors.ember,
                boxShadow: `0 18px 40px ${colors.ember}55`,
              }}
            >
              <SparkleIcon size={38} color={colors.onEmber} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(250)}>
            <AppText family="manrope" weight="bold" style={{ marginTop: 22, fontSize: 13, color: colors.emberInk }}>
              Ação principal concluída
            </AppText>
          </Animated.View>

          <AppText
            family="archivo"
            weight="black"
            style={{ marginTop: 6, fontSize: 64, lineHeight: 70, letterSpacing: -3, color: colors.ember }}
          >
            +{shownXp} XP
          </AppText>

          {params.title ? (
            <Animated.View entering={FadeIn.delay(400)}>
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ marginTop: 4, textAlign: "center", fontSize: 18, letterSpacing: -0.4, color: colors.text }}
              >
                {params.title}
              </AppText>
            </Animated.View>
          ) : null}
        </View>

        {leveledUp && level !== null ? (
          <Animated.View
            entering={ZoomIn.springify().delay(900)}
            style={{
              marginTop: 26,
              padding: 14,
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: colors.emberWash,
            }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.emberDeep }}>
              Você subiu para o nível {level}!
            </AppText>
          </Animated.View>
        ) : null}

        {level !== null ? (
          <Animated.View
            entering={FadeInDown.delay(550)}
            style={{
              marginTop: leveledUp ? 12 : 30,
              borderRadius: 24,
              padding: 18,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <View className="flex-row items-baseline justify-between">
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, color: colors.text }}>
                Nível {level}
              </AppText>
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.ember }}>
                {progress}%
              </AppText>
            </View>
            <View className="mt-3 overflow-hidden rounded-full" style={{ height: 8, backgroundColor: colors.bg }}>
              <Animated.View
                style={[{ height: "100%", borderRadius: 999, backgroundColor: colors.ember }, fillStyle]}
              />
            </View>
            <AppText family="manrope" weight="semiBold" style={{ marginTop: 10, fontSize: 12.5, color: colors.textMuted }}>
              Faltam {remaining} XP para o nível {level + 1}
            </AppText>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(700)}
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 24,
            gap: 12,
            padding: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <FlameIcon size={20} color={colors.ember} />
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, color: colors.text }}>
            {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
          </AppText>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeIn.delay(1000)}>
          <PrimaryButton label="Voltar para hoje" onPress={() => router.replace("/")} withArrow={false} />
        </Animated.View>
      </View>

      {reduceMotion ? null : <ConfettiBurst colors={confettiColors} />}
    </Screen>
  );
}
