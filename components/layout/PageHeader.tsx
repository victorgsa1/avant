import type { ReactNode } from "react";
import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type PageHeaderProps = {
  title: string;
  subtitle?: string | null;
  onBack: () => void;
  right?: ReactNode;
};

/**
 * Cabeçalho das telas internas (ajustes, competição, notificações, chat).
 */
export function PageHeader({ title, subtitle, onBack, right }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center"
      style={{
        gap: 12,
        paddingTop: 12,
        paddingBottom: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        backgroundColor: colors.bg,
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={10}
        className="items-center justify-center rounded-full"
        style={{
          width: 36,
          height: 36,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <ChevronLeftIcon color={colors.textMuted} />
      </Pressable>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          family="archivo"
          weight="black"
          numberOfLines={1}
          style={{ fontSize: 18, letterSpacing: -0.6, color: colors.text }}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            family="manrope"
            weight="medium"
            numberOfLines={1}
            style={{ marginTop: 1, fontSize: 12, color: colors.textMuted }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right}
    </View>
  );
}
