import { useState } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { InfoIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const PERIODS = ["Semana", "Mês"] as const;

export function PeriodToggle() {
  const { colors } = useTheme();
  const [active, setActive] = useState<(typeof PERIODS)[number]>("Semana");

  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 20 }}>
      <View className="flex-row rounded-full" style={{ backgroundColor: colors.surfaceRaised, padding: 3 }}>
        {PERIODS.map((period) => {
          const isActive = period === active;
          return (
            <Pressable
              key={period}
              onPress={() => setActive(period)}
              className="rounded-full"
              style={[
                { paddingVertical: 7, paddingHorizontal: 16 },
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
                {period}
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
