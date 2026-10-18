import { View } from "react-native";
import { useTheme } from "@/components/theme/ThemeProvider";

/** Acima disso os gomos ficam finos demais para ler — vira barra contínua. */
const MAX_SEGMENTS = 14;

type SegmentedProgressProps = {
  done: number;
  total: number;
};

/** Progresso em gomos (um por ação planejada), sobre o papel claro. */
export function SegmentedProgress({ done, total }: SegmentedProgressProps) {
  const { colors } = useTheme();
  const safeTotal = Math.max(total, 1);
  const filled = Math.min(Math.max(done, 0), safeTotal);

  if (safeTotal > MAX_SEGMENTS) {
    return (
      <View className="overflow-hidden rounded-full" style={{ height: 12, backgroundColor: colors.paperSunken }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${(filled / safeTotal) * 100}%`, backgroundColor: colors.ember }}
        />
      </View>
    );
  }

  return (
    <View className="flex-row" style={{ gap: 5 }}>
      {Array.from({ length: safeTotal }, (_, index) => (
        <View
          key={index}
          className="flex-1 rounded-full"
          style={{ height: 12, backgroundColor: index < filled ? colors.ember : colors.paperSunken }}
        />
      ))}
    </View>
  );
}
