import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Area } from "../types";

function AreaRow({ area }: { area: Area }) {
  const { colors } = useTheme();
  return (
    <View>
      <View className="flex-row items-baseline justify-between">
        <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}>
          {area.name}
        </AppText>
        <AppText
          family={area.pct === null ? "manrope" : "archivo"}
          weight={area.pct === null ? "semiBold" : "extraBold"}
          style={{ fontSize: area.pct === null ? 12 : 13.5, color: area.pct === null ? colors.textMuted : colors.ember }}
        >
          {area.pct === null ? "sem dados ainda" : `${area.pct}%`}
        </AppText>
      </View>
      <View className="mt-[9px] overflow-hidden rounded-full" style={{ height: 6, backgroundColor: colors.bg }}>
        <View className="h-full rounded-full" style={{ width: `${area.pct ?? 0}%`, backgroundColor: colors.ember }} />
      </View>
    </View>
  );
}

type AreaProgressListProps = {
  areas: Area[];
};

export function AreaProgressList({ areas }: AreaProgressListProps) {
  const { colors } = useTheme();
  return (
    <View className="px-6 pt-[34px]">
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
        Progresso por área
      </AppText>
      <AppText family="manrope" weight="medium" style={{ marginTop: 4, fontSize: 12, color: colors.textMuted }}>
        Últimos 30 dias
      </AppText>
      <View className="mt-4" style={{ gap: 18 }}>
        {areas.map((area) => (
          <AreaRow key={area.name} area={area} />
        ))}
      </View>
    </View>
  );
}
