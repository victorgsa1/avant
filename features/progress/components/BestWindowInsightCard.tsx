import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

function WindowWaveChart() {
  const { colors } = useTheme();
  return (
    <Svg width={96} height={62} viewBox="0 0 96 62" fill="none">
      <Path d="M2 56 C22 56 26 20 48 20 C70 20 74 56 94 56 Z" fill={colors.emberTint} />
      <Path d="M2 56 C22 56 26 20 48 20 C70 20 74 56 94 56" stroke={colors.ember} strokeWidth={2} fill="none" />
      <Circle cx={48} cy={20} r={5} fill={colors.surface} stroke={colors.ember} strokeWidth={2.6} />
    </Svg>
  );
}

type BestWindowInsightCardProps = {
  /** Null enquanto não há conclusões suficientes para afirmar um padrão. */
  bestWindow: { title: string; phrase: string; share: number } | null;
};

export function BestWindowInsightCard({ bestWindow }: BestWindowInsightCardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center rounded-[26px] px-[22px] py-5"
      style={{ gap: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
    >
      <View className="flex-1">
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          {bestWindow ? "O Avant aprendeu" : "O Avant está aprendendo"}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ fontSize: 13, lineHeight: 18.9, color: colors.textMuted, marginTop: 6 }}
        >
          {bestWindow
            ? `${bestWindow.share}% das suas conclusões acontecem ${bestWindow.phrase}.`
            : "Depois de algumas conclusões, aparece aqui o horário em que você mais cumpre."}
        </AppText>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 19, letterSpacing: -0.6, color: colors.ember, marginTop: 12 }}
        >
          {bestWindow ? bestWindow.title : "—"}
        </AppText>
      </View>
      <WindowWaveChart />
    </View>
  );
}
