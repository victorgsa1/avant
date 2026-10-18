import { useEffect, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SOCIAL_TABS, type SocialTab } from "../types";

/** O sublinhado passa um pouco do texto para os dois lados. */
const UNDERLINE_OVERHANG = 14;

type Measure = { x: number; width: number };

type SocialTabsProps = {
  active: SocialTab;
  onChange: (tab: SocialTab) => void;
};

/**
 * As três abas do Social, divididas por igual. O sublinhado desliza até a
 * aba escolhida, medindo o rótulo de cada uma — sem largura fixa, porque
 * "Competições" é o dobro de "Amigos".
 */
export function SocialTabs({ active, onChange }: SocialTabsProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [cells, setCells] = useState<Partial<Record<SocialTab, Measure>>>({});
  const [labels, setLabels] = useState<Partial<Record<SocialTab, Measure>>>({});

  const left = useSharedValue(0);
  const width = useSharedValue(0);
  const placed = useSharedValue(false);

  useEffect(() => {
    const cell = cells[active];
    const label = labels[active];
    if (!cell || !label) return;

    // Passa um pouco do texto, mas nunca da própria célula — "Competições"
    // encosta na borda da tela e o traço vazaria.
    const nextLeft = Math.max(cell.x, cell.x + label.x - UNDERLINE_OVERHANG);
    const nextRight = Math.min(cell.x + cell.width, cell.x + label.x + label.width + UNDERLINE_OVERHANG);
    const nextWidth = nextRight - nextLeft;
    // Primeira medida: posiciona sem animar, senão o traço "entra" do zero.
    if (!placed.value || reduceMotion) {
      left.value = nextLeft;
      width.value = nextWidth;
      placed.value = true;
      return;
    }
    const timing = { duration: 240, easing: Easing.out(Easing.cubic) };
    left.value = withTiming(nextLeft, timing);
    width.value = withTiming(nextWidth, timing);
  }, [active, cells, labels, left, placed, reduceMotion, width]);

  const underline = useAnimatedStyle(() => ({
    opacity: placed.value ? 1 : 0,
    transform: [{ translateX: left.value }],
    width: width.value,
  }));

  const measure =
    (setter: typeof setCells, key: SocialTab) =>
    ({ nativeEvent }: LayoutChangeEvent) => {
      const { x, width: w } = nativeEvent.layout;
      setter((current) =>
        current[key]?.x === x && current[key]?.width === w ? current : { ...current, [key]: { x, width: w } },
      );
    };

  return (
    <View className="mx-6" style={{ marginTop: 18 }}>
      <View className="flex-row" accessibilityRole="tablist">
        {SOCIAL_TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              haptic="selection"
              onPress={() => onChange(tab.key)}
              onLayout={measure(setCells, tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="flex-1 items-center"
              style={{ paddingBottom: 12, paddingTop: 4 }}
            >
              <View onLayout={measure(setLabels, tab.key)}>
                <AppText
                  family="archivo"
                  weight={isActive ? "extraBold" : "medium"}
                  style={{ fontSize: 16, letterSpacing: -0.2, color: isActive ? colors.ember : colors.textMuted }}
                >
                  {tab.label}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 1, backgroundColor: colors.line }} />
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", left: 0, bottom: 0, height: 3, borderRadius: 2, backgroundColor: colors.ember },
          underline,
        ]}
      />
    </View>
  );
}
