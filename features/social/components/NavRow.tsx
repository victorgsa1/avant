import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type NavRowProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  /** Ilustração antes do chevron ("Convidar por link"). */
  trailing?: ReactNode;
  /** `card`: caixa com borda. `plain`: linha solta, para fechar uma lista. */
  variant?: "card" | "plain";
  accessibilityHint?: string;
};

/** Uma linha que leva a outro lugar: ícone, rótulo e chevron. */
export function NavRow({ icon, label, onPress, trailing, variant = "card", accessibilityHint }: NavRowProps) {
  const { colors } = useTheme();
  const card = variant === "card";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      className="flex-row items-center"
      style={{
        gap: 14,
        minHeight: 56,
        paddingHorizontal: card ? 18 : 2,
        paddingVertical: card ? 14 : 10,
        borderRadius: card ? 18 : 0,
        backgroundColor: card ? colors.surface : "transparent",
        borderWidth: card ? 1 : 0,
        borderColor: colors.line,
      }}
    >
      <View style={{ width: 24, alignItems: "center" }}>{icon}</View>
      <AppText
        family="manrope"
        weight="semiBold"
        numberOfLines={1}
        style={{ flex: 1, fontSize: 15.5, color: colors.text }}
      >
        {label}
      </AppText>
      {trailing}
      <ChevronIcon size={13} color={colors.textMuted} />
    </Pressable>
  );
}
