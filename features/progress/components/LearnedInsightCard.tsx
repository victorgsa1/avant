import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { SparkleIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { InsightResponse } from "@/services/http/types";

function periodLabel(insight: InsightResponse): string | null {
  if (!insight.periodStart || !insight.periodEnd) return null;
  const [, startMonth, startDay] = insight.periodStart.slice(0, 10).split("-");
  const [, endMonth, endDay] = insight.periodEnd.slice(0, 10).split("-");
  return `${Number(startDay)}/${Number(startMonth)} a ${Number(endDay)}/${Number(endMonth)}`;
}

/**
 * O que o Avant aprendeu na semana.
 *
 * O texto pode ter sido escrito pelo modelo, mas os NÚMEROS que o
 * sustentam vêm sempre do progresso real — o backend não deixa a IA
 * inventar estatística.
 */
export function LearnedInsightCard({
  insight,
  onArchive,
}: {
  insight: InsightResponse;
  onArchive?: (id: string) => void;
}) {
  const { colors } = useTheme();
  const period = periodLabel(insight);

  return (
    <View
      className="rounded-[24px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 18 }}
    >
      <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
        <View className="flex-row items-center" style={{ gap: 7 }}>
          <SparkleIcon size={14} color={colors.ember} />
          <AppText
            family="manrope"
            weight="bold"
            style={{ fontSize: 11, letterSpacing: 0.5, color: colors.emberDeep }}
          >
            APRENDI NA SUA SEMANA
          </AppText>
        </View>

        {period ? (
          <AppText family="manrope" weight="medium" style={{ fontSize: 11, color: colors.textFaint }}>
            {period}
          </AppText>
        ) : null}
      </View>

      <AppText
        family="archivo"
        weight="extraBold"
        style={{ marginTop: 11, fontSize: 16, letterSpacing: -0.3, color: colors.text }}
      >
        {insight.title}
      </AppText>

      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 7, fontSize: 13, lineHeight: 19.5, color: colors.textMuted }}
      >
        {insight.body}
      </AppText>

      {onArchive ? (
        <Pressable onPress={() => onArchive(insight.id)} hitSlop={8} style={{ marginTop: 12 }}>
          <AppText family="archivo" weight="bold" style={{ fontSize: 12.5, color: colors.textFaint }}>
            Dispensar
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
