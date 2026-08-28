import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { InfoIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { RankingPeriod } from "@/services/http/types";

const PERIODS: { id: RankingPeriod; label: string }[] = [
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
  { id: "all", label: "Geral" },
];

type PeriodToggleProps = {
  active: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
};

export function PeriodToggle({ active, onChange }: PeriodToggleProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 20 }}>
      <View className="flex-row rounded-full" style={{ backgroundColor: colors.surfaceRaised, padding: 3 }}>
        {PERIODS.map((period) => {
          const isActive = period.id === active;
          return (
            <Pressable
              key={period.id}
              onPress={() => onChange(period.id)}
              className="rounded-full"
              style={[
                { paddingVertical: 7, paddingHorizontal: 14 },
                isActive
                  ? { backgroundColor: colors.surface, boxShadow: `0 1px 3px ${colors.shadow}` }
                  : null,
              ]}
            >
              <AppText
                family="manrope"
                weight={isActive ? "bold" : "semiBold"}
                style={{ fontSize: 12, color: isActive ? colors.text : colors.textMuted }}
              >
                {period.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center" style={{ gap: 5 }}>
        <InfoIcon />
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textMuted }}>
          por consistência
        </AppText>
      </View>
    </View>
  );
}
