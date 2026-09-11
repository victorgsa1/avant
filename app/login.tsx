import { useState } from "react";
import { View, type LayoutRectangle } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { lightColors as colors } from "@/constants/theme";
import { softEnter } from "@/features/auth/components/softEnter";
import { WELCOME_BG, WelcomeScene } from "@/features/auth/components/WelcomeScene";

/** Textos das ações ficam sobre a rocha escura: tons claros. */
const ON_ROCK = {
  text: "rgba(255, 255, 255, 0.78)",
  link: "#FF8A4C",
  whisper: "rgba(255, 255, 255, 0.46)",
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  // A cena se ajusta ao espaço entre o texto e o rodapé e à altura das
  // ações que ficam por cima da rocha — por isso os dois são medidos.
  const [stage, setStage] = useState<Pick<LayoutRectangle, "width" | "height">>({ width: 0, height: 0 });
  const [actionsHeight, setActionsHeight] = useState(0);

  // Entrada em cascata: texto de cima para baixo, depois a cena monta de
  // trás para a frente e, por fim, as ações.
  const drop = (delay: number) => (reduceMotion ? undefined : softEnter({ delay, dy: -8 }));
  const rise = (delay: number) => (reduceMotion ? undefined : softEnter({ delay, dy: 8 }));

  return (
    // A ilustração é clara e não tem versão escura: esta tela fica sempre no
    // tema claro, com o creme da cena de fundo.
    <View className="flex-1" style={{ backgroundColor: WELCOME_BG }}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 28 }}>
        <View style={{ marginTop: 24 }}>
          <Animated.View entering={drop(70)}>
            <AppText family="archivo" weight="black" style={headline(colors.text)}>
              Uma versão
            </AppText>
          </Animated.View>
          <Animated.View entering={drop(140)}>
            <AppText family="archivo" weight="black" style={headline(colors.ember)}>
              melhor de você
            </AppText>
          </Animated.View>
          <Animated.View entering={drop(210)}>
            <AppText family="archivo" weight="black" style={headline(colors.text)}>
              é possível.
            </AppText>
          </Animated.View>
        </View>

        <Animated.View entering={drop(280)}>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 14, maxWidth: 290, fontSize: 15.5, lineHeight: 23, color: colors.textMuted }}
          >
            Crie hábitos, conquiste seus objetivos e evolua todos os dias.
          </AppText>
        </Animated.View>
      </View>

      {/* Sem `overflow: hidden`: o céu pode subir um pouco com o parallax; o
          que afunda embaixo já é cortado pela borda da tela. */}
      <View
        style={{ flex: 1 }}
        onLayout={(e) => setStage({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        {actionsHeight > 0 ? (
          <WelcomeScene width={stage.width} height={stage.height} actionsHeight={actionsHeight} delay={300} />
        ) : null}
      </View>

      {/* As ações ficam por cima da rocha, que serve de fundo para elas. */}
      <View
        onLayout={(e) => setActionsHeight(e.nativeEvent.layout.height)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 26,
          paddingBottom: insets.bottom + 18,
        }}
      >
        <Animated.View entering={rise(800)}>
          <PrimaryButton label="Começar" emphasis="strong" onPress={() => router.push("/sign-up")} />
        </Animated.View>

        <Animated.View entering={rise(900)} className="items-center">
          <Pressable onPress={() => router.push("/sign-in")} hitSlop={8} style={{ marginTop: 20 }}>
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 14, color: ON_ROCK.text }}>
              Já tem conta?{" "}
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: ON_ROCK.link }}>
                Entrar
              </AppText>
            </AppText>
          </Pressable>

          <AppText
            family="manrope"
            weight="medium"
            style={{
              marginTop: 16,
              maxWidth: 260,
              fontSize: 11.5,
              lineHeight: 17,
              textAlign: "center",
              color: ON_ROCK.whisper,
            }}
          >
            Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do Avant.
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

function headline(color: string) {
  return { fontSize: 36, lineHeight: 40, letterSpacing: -1.6, color };
}
