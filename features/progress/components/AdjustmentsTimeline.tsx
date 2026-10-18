import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { TimelineItem } from "../types";
import { SectionTitle } from "./SectionTitle";

/** O que mudou no plano neste mês, em ordem: o ajuste e o que veio depois. */
export function AdjustmentsTimeline({ items }: { items: TimelineItem[] }) {
  const { colors } = useTheme();

  return (
    <View className="px-5" style={{ marginTop: 36 }}>
      <View style={{ paddingHorizontal: 2 }}>
        <SectionTitle title="Ajustes do plano" />
      </View>

      <View style={{ paddingHorizontal: 4 }}>
        {items.map((item, index) => {
          const isAdjustment = item.kind === "ADJUSTMENT";
          const isLast = index === items.length - 1;
          return (
            <View key={item.key} className="flex-row" style={{ gap: 14 }}>
              <View className="items-center" style={{ width: 12 }}>
                <View
                  className="rounded-full"
                  style={{
                    marginTop: 5,
                    width: isAdjustment ? 10 : 8,
                    height: isAdjustment ? 10 : 8,
                    backgroundColor: isAdjustment ? colors.ember : colors.textFaint,
                  }}
                />
                {!isLast ? <View style={{ flex: 1, width: 1.5, marginVertical: 4, backgroundColor: colors.lineStrong }} /> : null}
              </View>

              <View style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                <AppText
                  family={isAdjustment ? "archivo" : "manrope"}
                  weight={isAdjustment ? "extraBold" : "medium"}
                  style={{ fontSize: 14.5, lineHeight: 20, color: colors.text }}
                >
                  {item.dateLabel} · {item.title}
                </AppText>
                {item.detail ? (
                  <AppText family="manrope" weight="medium" style={{ marginTop: 3, fontSize: 12.5, color: colors.textMuted }}>
                    {item.detail}
                  </AppText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
