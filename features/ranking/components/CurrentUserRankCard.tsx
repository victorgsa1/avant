import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { TrendUpIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type CurrentUserRankCardProps = {
  rank: number;
  pct: number;
  positionsGained: number;
};

export function CurrentUserRankCard({ rank, pct, positionsGained }: CurrentUserRankCardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-5 mt-5 flex-row items-center rounded-[26px]"
      style={{ gap: 16, backgroundColor: colors.emberTint, padding: 18, paddingHorizontal: 20 }}
    >
      <AppText family="archivo" weight="black" style={{ fontSize: 38, letterSpacing: -1.8, color: colors.ember }}>
        #{rank}
      </AppText>
      <View style={{ flex: 1 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Você
        </AppText>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.emberDeep, marginTop: 3 }}>
          {pct}% de consistência
        </AppText>
      </View>
      <View
        className="flex-row items-center rounded-full"
        style={{ gap: 5, backgroundColor: colors.surface, paddingVertical: 6, paddingHorizontal: 11 }}
      >
        <TrendUpIcon color={colors.emberDeep} />
        <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberDeep }}>
          {positionsGained} posições
        </AppText>
      </View>
    </View>
  );
}
