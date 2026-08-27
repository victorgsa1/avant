import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import type { WeekDay } from "../types";

function dayDotStyle(state: WeekDay["state"], colors: ThemeColors) {
  switch (state) {
    case "done":
      return { backgroundColor: colors.ember };
    case "today":
      return { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.ember };
    case "miss":
      return { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.textMuted };
    default:
      return { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.bg };
  }
}

function WeekDayDot({ day }: { day: WeekDay }) {
  const { colors } = useTheme();
  return (
    <View className="items-center" style={{ gap: 8 }}>
      <View
        className="items-center justify-center rounded-full"
        style={[{ width: 30, height: 30 }, dayDotStyle(day.state, colors)]}
      >
        {day.state === "done" ? <CheckmarkIcon size={11} color={colors.onEmber} /> : null}
      </View>
      <AppText
        family="manrope"
        weight={day.state === "today" ? "extraBold" : "semiBold"}
        style={{ fontSize: 11, color: day.state === "today" ? colors.ember : colors.textMuted }}
      >
        {day.label}
      </AppText>
    </View>
  );
}

type WeeklyConsistencyProps = {
  week: WeekDay[];
  doneCount: number;
  totalCount: number;
};

export function WeeklyConsistency({ week, doneCount, totalCount }: WeeklyConsistencyProps) {
  const { colors } = useTheme();
  return (
    <View className="px-6 pt-7">
      <View className="flex-row items-baseline justify-between">
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Consistência semanal
        </AppText>
        <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          {doneCount} de {totalCount} ações
        </AppText>
      </View>
      <View className="mt-4 flex-row justify-between">
        {week.map((day, index) => (
          <WeekDayDot key={index} day={day} />
        ))}
      </View>
    </View>
  );
}
