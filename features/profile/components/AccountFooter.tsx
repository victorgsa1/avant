import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { LogoutIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AppText } from "@/components/ui/AppText";

type AccountFooterProps = {
  versionLabel: string;
  onPressSignOut?: () => void;
};

/**
 * Sair é um botão de verdade: pílula laranja centralizada, texto branco e
 * ícone. Estilo fixo de propósito — o NativeWind descarta `style` em forma
 * de função no Pressable, então o "pressionado" vem de estado.
 */
export function AccountFooter({ versionLabel, onPressSignOut }: AccountFooterProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <View style={{ alignItems: "center", gap: 12, paddingHorizontal: 24 }}>
      <Pressable
        onPress={onPressSignOut}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        haptic="medium"
        accessibilityRole="button"
        style={{
          height: 54,
          paddingHorizontal: 32,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          backgroundColor: pressed ? colors.emberInk : colors.ember,
          boxShadow: `0 12px 26px ${colors.ember}42`,
        }}
      >
        <LogoutIcon size={18} color={colors.onEmber} />
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 15.5, color: colors.onEmber }}>
          Sair da conta
        </AppText>
      </Pressable>
      <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textFaint }}>
        {versionLabel}
      </AppText>
    </View>
  );
}
