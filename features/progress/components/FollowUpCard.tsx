import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { FollowUp } from "../types";

/**
 * O ajuste aceito, medido: as mesmas janelas de 14 dias que o motor usa
 * para decidir se ele funcionou — antes contra depois.
 */
export function FollowUpCard({ followUp }: { followUp: FollowUp }) {
  const { colors } = useTheme();

  return (
    <View
      className="mx-5 rounded-[24px]"
      style={{ marginTop: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 20 }}
    >
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View className="rounded-full" style={{ width: 8, height: 8, backgroundColor: colors.emberSoft }} />
        <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, color: colors.text }}>
          Acompanhando seu ajuste
        </AppText>
      </View>

      <AppText family="manrope" weight="medium" style={{ marginTop: 12, fontSize: 13, color: colors.textMuted }}>
        Após o ajuste: {followUp.summary}
      </AppText>

      <View className="flex-row flex-wrap items-center" style={{ marginTop: 8, columnGap: 12, rowGap: 4 }}>
        <AppText family="archivo" weight="black" style={{ fontSize: 21, letterSpacing: -0.4, color: colors.textMuted }}>
          {followUp.before}
        </AppText>
        <ArrowRightIcon width={22} color={colors.ember} />
        <AppText family="archivo" weight="black" style={{ fontSize: 21, letterSpacing: -0.4, color: colors.text }}>
          {followUp.after} sessões
        </AppText>
      </View>

      <AppText family="manrope" weight="medium" style={{ marginTop: 6, fontSize: 11.5, color: colors.textFaint }}>
        {followUp.footnote}
      </AppText>
    </View>
  );
}
