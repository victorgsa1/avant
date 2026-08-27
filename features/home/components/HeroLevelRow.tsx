import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { FlameIcon } from "@/components/ui/icons";
import { RingProgress } from "@/components/ui/RingProgress";
import { useTheme } from "@/components/theme/ThemeProvider";

type HeroLevelRowProps = {
  level: number;
  nextLevel: number;
  progress: number;
  greeting: string;
  name: string;
  currentXP: number;
  remainingXP: number;
  streakDays: number;
};

export function HeroLevelRow({
  level,
  nextLevel,
  progress,
  greeting,
  name,
  currentXP,
  remainingXP,
  streakDays,
}: HeroLevelRowProps) {
  const { colors } = useTheme();
  return (
    <View className="mt-[22px] flex-row items-center gap-[22px] px-6">
      <RingProgress size={126} strokeWidth={8} progress={progress} trackColor={colors.emberChip} progressColor={colors.ember}>
        <AppText family="archivo" weight="black" style={{ fontSize: 46, lineHeight: 46, letterSpacing: -2.5, color: colors.text }}>
          {level}
        </AppText>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>
          nível
        </AppText>
      </RingProgress>

      <View className="flex-1">
        <AppText family="archivo" weight="medium" style={{ fontSize: 14, color: colors.textMuted }}>
          {greeting}, {name}.
        </AppText>
        <View className="mt-2 flex-row items-baseline gap-1.5">
          <AppText family="archivo" weight="black" style={{ fontSize: 28, letterSpacing: -1, color: colors.text }}>
            {currentXP.toLocaleString("pt-BR")}
          </AppText>
          <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: colors.ember }}>
            xp
          </AppText>
        </View>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 3 }}>
          {remainingXP.toLocaleString("pt-BR")} xp para o nível {nextLevel}
        </AppText>
        <View className="mt-3 flex-row items-center gap-1.5">
          <FlameIcon color={colors.ember} />
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.text }}>
            {streakDays} dias seguidos
          </AppText>
        </View>
      </View>
    </View>
  );
}
