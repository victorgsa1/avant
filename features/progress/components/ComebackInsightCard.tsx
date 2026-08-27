import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

function ComebackSparkline() {
  const { colors } = useTheme();
  return (
    <Svg
      width={150}
      height={82}
      viewBox="0 0 150 82"
      fill="none"
      style={{ position: "absolute", right: -4, bottom: -4, opacity: 0.7 }}
    >
      <Path d="M0 82 L34 46 L54 60 L88 20 L116 46 L150 12 L150 82 Z" fill={colors.arcLight} />
      <Path d="M0 82 L34 46 L54 60 L88 20 L116 46 L150 12" stroke={colors.arcStrong} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

function ComebackArrow() {
  const { colors } = useTheme();
  return (
    <Svg width={26} height={10} viewBox="0 0 26 10" fill="none" style={{ marginBottom: 6 }}>
      <Path d="M0 5h20M17 1.4 21 5l-4 3.6" stroke={colors.ember} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

type ComebackInsightCardProps = {
  previousLabel: string;
  currentLabel: string;
  recoveriesCount: number;
};

export function ComebackInsightCard({ previousLabel, currentLabel, recoveriesCount }: ComebackInsightCardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="overflow-hidden rounded-[26px] px-[22px] py-5"
      style={{ backgroundColor: colors.emberTint, position: "relative" }}
    >
      <ComebackSparkline />
      <View style={{ position: "relative" }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Você está mudando
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ fontSize: 13, lineHeight: 18.9, color: colors.emberDeep, marginTop: 6, maxWidth: 236 }}
        >
          Você volta mais rápido quando a rotina quebra.
        </AppText>

        <View className="mt-[18px] flex-row items-baseline" style={{ gap: 12 }}>
          <AppText family="archivo" weight="black" style={{ fontSize: 28, letterSpacing: -1.2, color: colors.emberWarm }}>
            {previousLabel}
          </AppText>
          <ComebackArrow />
          <AppText family="archivo" weight="black" style={{ fontSize: 34, letterSpacing: -1.4, color: colors.ember }}>
            {currentLabel}
          </AppText>
        </View>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.emberDeep, marginTop: 4 }}>
          tempo médio para retomar
        </AppText>

        <View
          className="mt-4 flex-row items-center pt-3.5"
          style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.arcLight }}
        >
          <AppText family="archivo" weight="black" style={{ fontSize: 17, color: colors.text }}>
            {recoveriesCount}
          </AppText>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.emberDeep }}>
            retomadas neste mês
          </AppText>
        </View>
      </View>
    </View>
  );
}
