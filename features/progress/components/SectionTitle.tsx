import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

/** O título das seções da tela, com algo opcional à direita (selo ou link). */
export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-between" style={{ marginBottom: 14, gap: 12 }}>
      <AppText
        family="archivo"
        weight="black"
        style={{ fontSize: 22, letterSpacing: -0.6, color: colors.text, flexShrink: 1 }}
      >
        {title}
      </AppText>
      {right}
    </View>
  );
}
