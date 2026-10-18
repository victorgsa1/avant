import { useState } from "react";
import { Image, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

const NOTEBOOK = require("../../../assets/onboarding/caderno.png");

/** Caderno com uma lupa por cima: "o que foi anotado sobre você". */
function LearnedArt() {
  const { colors } = useTheme();
  return (
    <View style={{ width: 92, height: 92 }} accessible={false} importantForAccessibility="no-hide-descendants">
      <View
        className="absolute rounded-full"
        style={{ top: 4, right: 4, width: 58, height: 58, backgroundColor: colors.emberMid, opacity: 0.35 }}
      />
      <Image source={NOTEBOOK} style={{ position: "absolute", left: 2, top: 6, width: 68, height: 77 }} resizeMode="contain" />
      <Svg width={46} height={46} viewBox="0 0 46 46" style={{ position: "absolute", right: 0, bottom: 2 }}>
        <Circle cx={18} cy={18} r={12} fill={colors.paper} fillOpacity={0.55} stroke={colors.ember} strokeWidth={4.5} />
        <Path d="M27 27 40 40" stroke={colors.ember} strokeWidth={6} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

/**
 * A porta para o que o motor adaptativo aprendeu. Fica fora das listas, com
 * borda laranja, porque é a parte do Perfil que só o Avant tem.
 */
export function LearnedCard({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel="O que o Avant aprendeu. Veja os padrões, revise as memórias e escolha o que o Avant pode analisar."
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 18,
        paddingLeft: 20,
        paddingRight: 14,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: colors.ember,
        backgroundColor: pressed ? colors.emberChip : colors.emberTint,
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.emberInk }}>
          Personalização
        </AppText>
        <AppText
          family="archivo"
          weight="black"
          style={{ marginTop: 6, fontSize: 20, lineHeight: 24, letterSpacing: -0.6, color: colors.text }}
        >
          O que o Avant aprendeu
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.textMuted }}
        >
          Veja os padrões, revise as memórias e escolha o que o Avant pode analisar.
        </AppText>
      </View>

      <LearnedArt />
      <ChevronIcon size={14} color={colors.text} />
    </Pressable>
  );
}
