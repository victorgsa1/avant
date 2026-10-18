import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

type SocialSectionTitleProps = {
  title: string;
  /** "• 12" ao lado do título. */
  count?: number;
  /** Ação ou rótulo à direita ("+ Criar", "Conversar"). */
  right?: ReactNode;
};

export function SocialSectionTitle({ title, count, right }: SocialSectionTitleProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-between px-6" style={{ gap: 12, marginBottom: 14 }}>
      <View className="flex-row items-baseline" style={{ gap: 8, flexShrink: 1 }}>
        <AppText
          accessibilityRole="header"
          family="archivo"
          weight="black"
          style={{ fontSize: 22, letterSpacing: -0.6, color: colors.text }}
        >
          {title}
        </AppText>
        {count !== undefined ? (
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 17, color: colors.textMuted }}>
            • {count}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}
