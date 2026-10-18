import type { GlassStyle, GlassViewProps } from "expo-glass-effect";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useState, type ComponentType } from "react";
import { BackHandler, Pressable as RNPressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { hasNativeModule } from "@/services/native/optionalNative";

// Vidro de verdade só quando o binário tem o módulo e o sistema a API (iOS 26).
// Sem ele o painel cai numa superfície sólida com sombra.
let GlassView: ComponentType<GlassViewProps> | null = null;
if (hasNativeModule("ExpoGlassEffect")) {
  const glass = require("expo-glass-effect") as typeof import("expo-glass-effect");
  if (glass.isGlassEffectAPIAvailable()) GlassView = glass.GlassView;
}

export type AvantMenuAction = "changed" | "goal" | "complementary" | "log";

const ITEMS: { action: AvantMenuAction; title: string; subtitle: string; icon: SymbolViewProps["name"] }[] = [
  {
    action: "changed",
    title: "Algo mudou",
    subtitle: "Imprevistos acontecem. Vamos adaptar seus planos.",
    icon: { ios: "arrow.triangle.branch", android: "alt_route", web: "alt_route" },
  },
  {
    action: "goal",
    title: "Novo objetivo",
    subtitle: "Dê o primeiro passo para conquistar algo novo.",
    icon: { ios: "flag", android: "flag", web: "flag" },
  },
  {
    action: "complementary",
    title: "Nova tarefa complementar",
    subtitle: "Adicione uma atividade extra à sua rotina, sem alterar seu objetivo principal.",
    icon: { ios: "plus.circle", android: "add_circle", web: "add_circle" },
  },
  {
    action: "log",
    title: "Registrar algo",
    subtitle: "Conte algo importante para o Avant conhecer você melhor.",
    icon: { ios: "square.and.pencil", android: "edit_square", web: "edit_square" },
  },
];

type MenuItem = (typeof ITEMS)[number];

// O destaque de "pressionado" vem de estado próprio, numa View interna: o
// NativeWind descarta `style` em forma de função no Pressable.
function MenuRow({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      haptic="selection"
      accessibilityRole="menuitem"
      accessibilityLabel={item.title}
      accessibilityHint={item.subtitle}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginHorizontal: 8,
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: RADIUS - 8,
          backgroundColor: pressed ? `${colors.ember}24` : "transparent",
        }}
      >
        {/* Ícone num quadradinho da marca, como os de Ajustes do iPhone. */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.ember,
          }}
        >
          <SymbolView name={item.icon} size={18} tintColor={colors.onEmber} weight="semibold" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", color: colors.text }}>{item.title}</Text>
          <Text style={{ fontSize: 13, lineHeight: 17, color: colors.textMuted }}>{item.subtitle}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const PANEL_MAX_WIDTH = 320;
const RADIUS = 28;
/** Distância da borda direita do painel até o centro do botão Avant, que é de onde o menu "nasce". */
const ORIGIN_FROM_RIGHT = 31;

// Mola parecida com a dos menus do iOS: abre rápido, com um leve passar do
// ponto. Fechar é uma curva curta, sem mola — o sistema também não quica ao
// sair.
const OPEN_SPRING = { damping: 20, stiffness: 200, mass: 1 };
const CLOSE_TIMING = { duration: 170, easing: Easing.out(Easing.quad) };

type AvantMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: AvantMenuAction) => void;
  /** Distância da base do painel até o fundo da tela (fica logo acima da barra). */
  bottom: number;
  /** Distância da borda direita do painel até a da tela (alinhada ao botão Avant). */
  right: number;
};

/**
 * O menu do botão Avant, no molde dos menus do iOS 26: um painel de Liquid
 * Glass que cresce a partir do botão, com ícone, título e subtítulo por item.
 * Toque fora (ou o voltar do Android) fecha.
 *
 * Não é um UIMenu nativo porque o botão é um item da tab bar do sistema, e o
 * iOS não deixa pendurar um menu nele. O material é o mesmo (GlassView), e o
 * vidro "materializa" com a animação do próprio sistema enquanto o painel
 * cresce.
 */
export function AvantMenu({ visible, onClose, onSelect, bottom, right }: AvantMenuProps) {
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(PANEL_MAX_WIDTH, screenWidth - right * 2);

  const [mounted, setMounted] = useState(visible);
  const [glassStyle, setGlassStyle] = useState<GlassStyle>("none");
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setGlassStyle("regular");
      progress.value = withSpring(1, OPEN_SPRING);
      return;
    }
    setGlassStyle("none");
    progress.value = withTiming(0, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.25 + 0.75 * progress.value }],
    // O vidro nativo não pode ter opacidade animada (o UIKit para de
    // desenhá-lo); ele entra pela própria animação de material. Só o
    // fallback sólido usa opacidade.
    opacity: GlassView ? 1 : Math.min(1, progress.value * 1.6),
  }));

  // O conteúdo aparece um pouco depois do vidro, como no sistema.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, (progress.value - 0.35) / 0.5)),
  }));

  if (!mounted) return null;

  const rows = ITEMS.map((item) => (
    <MenuRow key={item.action} item={item} onPress={() => onSelect(item.action)} />
  ));

  const panelFrame = { width: panelWidth, borderRadius: RADIUS, paddingVertical: 8 };

  return (
    <View pointerEvents={visible ? "auto" : "none"} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      {/* Toque fora fecha. Transparente: menus de botão no iOS não escurecem a tela. */}
      <RNPressable accessibilityLabel="Fechar menu" onPress={onClose} style={{ flex: 1 }} />

      <Animated.View
        accessibilityRole="menu"
        style={[
          {
            position: "absolute",
            right,
            bottom,
            transformOrigin: `${panelWidth - ORIGIN_FROM_RIGHT}px 100%`,
          },
          panelStyle,
        ]}
      >
        {GlassView ? (
          <GlassView
            glassEffectStyle={{ style: glassStyle, animate: true, animationDuration: visible ? 0.35 : 0.17 }}
            // Um toque quente no vidro: ainda é vidro, mas puxa para a marca.
            tintColor={`${colors.ember}1A`}
            colorScheme={isDark ? "dark" : "light"}
            style={panelFrame}
          >
            <Animated.View style={contentStyle}>{rows}</Animated.View>
          </GlassView>
        ) : (
          <View
            style={[
              panelFrame,
              { backgroundColor: colors.surfaceRaised, boxShadow: `0 18px 48px ${colors.shadowStrong}` },
            ]}
          >
            <Animated.View style={contentStyle}>{rows}</Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
