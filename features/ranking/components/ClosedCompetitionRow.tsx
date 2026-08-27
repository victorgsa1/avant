import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronRightIcon, HistoryBarsIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type ClosedCompetitionRowProps = {
  title: string;
  resultLabel: string;
};

export function ClosedCompetitionRow({ title, resultLabel }: ClosedCompetitionRowProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center" style={{ gap: 13, paddingTop: 16 }}>
      <View
        className="items-center justify-center rounded-xl"
        style={{ width: 36, height: 36, backgroundColor: colors.surfaceRaised }}
      >
        <HistoryBarsIcon />
      </View>
      <View style={{ flex: 1 }}>
        <AppText family="archivo" weight="bold" style={{ fontSize: 14, letterSpacing: -0.2, color: colors.text }}>
          {title}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
          {resultLabel}
        </AppText>
      </View>
      <ChevronRightIcon width={13} color={colors.textFaint} />
    </View>
  );
}
