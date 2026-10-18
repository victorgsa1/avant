import { useState } from "react";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon, LogoutIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Sair fica sozinho no fim, contornado e sem preenchimento: está à mão, mas
 * não chama mais atenção que os ajustes.
 */
export function SignOutButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      haptic="medium"
      accessibilityRole="button"
      style={{
        marginHorizontal: 16,
        marginTop: 26,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        minHeight: 60,
        paddingLeft: 20,
        paddingRight: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        backgroundColor: pressed ? colors.surface : "transparent",
      }}
    >
      <LogoutIcon size={24} color={colors.text} />
      <AppText family="manrope" weight="semiBold" style={{ flex: 1, fontSize: 16, color: colors.text }}>
        Sair da conta
      </AppText>
      <ChevronIcon size={14} color={colors.text} />
    </Pressable>
  );
}
