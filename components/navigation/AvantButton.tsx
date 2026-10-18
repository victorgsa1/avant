import { Image } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CUSTOM_TAB_BAR_HEIGHT } from "@/components/navigation/tabBar";
import { buttonGlow } from "@/constants/glow";

// A marca do Avant (o "A" com as divisas), recortada do splash e em branco.
const MARK = require("@/assets/avant-mark.png");
const MARK_WIDTH = 30;
const MARK_HEIGHT = Math.round((MARK_WIDTH * 762) / 776);

/**
 * O botão Avant da barra customizada (Android, web, iOS antigo): círculo
 * `ember` com a logo, ao lado da barra e da mesma altura dela. No iOS 26 o
 * mesmo botão é o círculo nativo da tab bar — ver `app/(tabs)/_layout.tsx`.
 */
export function AvantButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Avant"
      className="items-center justify-center rounded-full"
      style={{
        width: CUSTOM_TAB_BAR_HEIGHT,
        height: CUSTOM_TAB_BAR_HEIGHT,
        backgroundColor: colors.ember,
        boxShadow: buttonGlow(`0 12px 26px ${colors.ember}59`),
      }}
    >
      <Image
        source={MARK}
        resizeMode="contain"
        style={{ width: MARK_WIDTH, height: MARK_HEIGHT, tintColor: colors.onEmber }}
      />
    </Pressable>
  );
}
