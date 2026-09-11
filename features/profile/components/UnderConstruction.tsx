import { useCallback, useState } from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

// Animações gratuitas do LottieFiles (Lottie Simple License), recoloridas com
// a paleta do Avant e sem os textos em inglês — a mensagem fica no app.
// `aspect` = largura/altura de cada arte: a estrada é bem mais larga que as
// outras, e numa caixa quadrada ficaria minúscula. Cada arte tem o próprio
// texto: o título fala da cena, o subtítulo diz o que importa sem repetir.
const ANIMATIONS = [
  {
    source: require("../../../assets/lottie/under-construction-worker.json"),
    aspect: 500 / 500,
    title: "Tijolo por tijolo",
    message: "Seu perfil ainda não está pronto. Volte em breve.",
  },
  {
    source: require("../../../assets/lottie/under-construction-sign.json"),
    aspect: 2500 / 2160,
    title: "Área isolada",
    message: "Estamos montando seu perfil. Logo você entra aqui.",
  },
  {
    source: require("../../../assets/lottie/under-construction-road.json"),
    aspect: 1080 / 422,
    title: "Máquinas trabalhando",
    message: "Seu perfil chega numa das próximas atualizações.",
  },
];

const ANIMATION_WIDTH = 300;

// Cada visita mostra a próxima; a primeira é sorteada.
let nextAnimation = Math.floor(Math.random() * ANIMATIONS.length);

type UnderConstructionProps = {
  title?: string;
  message?: string;
};

/** Área ainda em obra: animação + recado curto. Sem animação com "reduzir movimento". */
export function UnderConstruction({ title, message }: UnderConstructionProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(nextAnimation);

  // A aba fica montada entre visitas: a troca acontece a cada foco, não a cada montagem.
  useFocusEffect(
    useCallback(() => {
      setIndex(nextAnimation);
      nextAnimation = (nextAnimation + 1) % ANIMATIONS.length;
    }, []),
  );

  return (
    <View className="items-center px-8" style={{ paddingTop: 12 }}>
      <LottieView
        key={index}
        source={ANIMATIONS[index].source}
        autoPlay={!reduceMotion}
        loop
        progress={reduceMotion ? 0.5 : undefined}
        style={{ width: ANIMATION_WIDTH, height: ANIMATION_WIDTH / ANIMATIONS[index].aspect }}
      />

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 12, textAlign: "center", fontSize: 30, lineHeight: 33, letterSpacing: -1.2, color: colors.text }}
      >
        {title ?? ANIMATIONS[index].title}
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 8, textAlign: "center", fontSize: 14, lineHeight: 21, color: colors.textMuted }}
      >
        {message ?? ANIMATIONS[index].message}
      </AppText>
    </View>
  );
}
