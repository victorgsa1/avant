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
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.ember }}>
          {area.pct}%
        </AppText>
      </View>
      <View className="mt-[9px] overflow-hidden rounded-full" style={{ height: 6, backgroundColor: colors.bg }}>
        <View className="h-full rounded-full" style={{ width: `${area.pct}%`, backgroundColor: colors.ember }} />
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
      <View className="mt-4" style={{ gap: 18 }}>
        {areas.map((area) => (
          <AreaRow key={area.name} area={area} />
        ))}
      </View>
    </View>
  );
}
