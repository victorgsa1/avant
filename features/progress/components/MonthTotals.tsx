import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

type MonthTotalsProps = {
  done: number;
  planned: number;
  /** Null quando nada estava previsto: sem porcentagem inventada. */
  pct: number | null;
};

/** "18 de 24 ações previstas · 75% do plano" — só a principal conta. */
export function MonthTotals({ done, planned, pct }: MonthTotalsProps) {
  const { colors } = useTheme();

  if (planned === 0) {
    return (
      <View className="px-6" style={{ marginTop: 16 }}>
        <AppText family="manrope" weight="medium" style={{ fontSize: 14, lineHeight: 20, color: colors.textMuted }}>
          Nenhuma ação prevista neste mês até agora.
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between px-6" style={{ marginTop: 14, gap: 12 }}>
      <View className="flex-row items-baseline" style={{ gap: 9, flexShrink: 1 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 40, lineHeight: 46, letterSpacing: -1.6, color: colors.text }}
        >
          {done}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 14.5, color: colors.textMuted, flexShrink: 1 }}>
          de {planned} {planned === 1 ? "ação prevista" : "ações previstas"}
        </AppText>
      </View>

      {pct !== null ? (
        <View
          className="rounded-full"
          style={{ backgroundColor: colors.surfaceSunken, paddingVertical: 7, paddingHorizontal: 13 }}
        >
          <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: colors.textStrong }}>
            {pct}% do plano
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
