import { GlassView } from "expo-glass-effect";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { NavHojeIcon, NavProfileIcon, NavProgressIcon, NavRankingIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { tapHaptic } from "@/services/native/haptics";

const TABS: { href: Href; icon: typeof NavHojeIcon; label: string }[] = [
  { href: "/", icon: NavHojeIcon, label: "Hoje" },
  { href: "/ranking", icon: NavRankingIcon, label: "Ranking" },
  { href: "/progress", icon: NavProgressIcon, label: "Progresso" },
  { href: "/profile", icon: NavProfileIcon, label: "Perfil" },
];

const HIGHLIGHT_INSET = 6;
const DRAG_SLOP = 10;
const SPRING = { damping: 22, stiffness: 260, mass: 0.7 };

// Real native glass, not glassmorphism: the bar is one `GlassView`
// (UIVisualEffectView on iOS 26) that content scrolls under.
//
// The selection capsule is deliberately NOT a second GlassView. Apple's own
// guidance is to avoid layering Liquid Glass on Liquid Glass, and in practice
// a glass capsule tinted with `ember` over the dark bar renders as a muddy
// dark-red blob whose halo escapes `overflow: hidden`. The selected tab is
// signalled the way Apple does it — brand color on the icon and label — over a
// flat ember wash, the same one SimpleTabBar uses.
export function GlassTabBar({ activeIndex }: { activeIndex: number }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / TABS.length;
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (tabWidth > 0 && !isDragging.value) {
      translateX.value = withSpring(activeIndex * tabWidth, SPRING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, tabWidth]);

  const navigateToIndex = (index: number) => {
    const clamped = Math.min(TABS.length - 1, Math.max(0, index));
    tapHaptic("selection");
    router.navigate(TABS[clamped].href);
  };

  // Drag only — tapping is left to the Pressables below. A Pan is only ever
  // activated from a touch *move* event, so a bar driven by Pan alone can be
  // switched by dragging but never by a plain tap.
  const pan = Gesture.Pan()
    .activeOffsetX([-DRAG_SLOP, DRAG_SLOP])
    .onStart(() => {
      "worklet";
      isDragging.value = true;
    })
    .onUpdate((event) => {
      "worklet";
      if (tabWidth <= 0) return;
      translateX.value = Math.min(Math.max(event.x - tabWidth / 2, 0), barWidth - tabWidth);
    })
    .onEnd(() => {
      "worklet";
      if (tabWidth <= 0) return;
      const index = Math.round(translateX.value / tabWidth);
      translateX.value = withSpring(index * tabWidth, SPRING);
      runOnJS(navigateToIndex)(index);
    })
    // Not onEnd: a Pan that never activated skips onEnd entirely, and a stuck
    // `isDragging` freezes the highlight for good.
    .onFinalize(() => {
      "worklet";
      isDragging.value = false;
    });

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme="dark"
      tintColor={colors.inverse}
      style={{ height: 62, borderRadius: 31, overflow: "hidden" }}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      {barWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: HIGHLIGHT_INSET,
              bottom: HIGHLIGHT_INSET,
              width: tabWidth,
              padding: 4,
            },
            highlightStyle,
          ]}
        >
          <View style={{ flex: 1, borderRadius: 22, backgroundColor: `${colors.ember}29` }} />
        </Animated.View>
      ) : null}

      <GestureDetector gesture={pan}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                key={tab.label}
                haptic="selection"
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => router.navigate(tab.href)}
                style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 4 }}
              >
                <tab.icon color={isActive ? colors.ember : colors.onInverseMuted} />
                <AppText
                  family="manrope"
                  weight={isActive ? "extraBold" : "semiBold"}
                  numberOfLines={1}
                  style={{ fontSize: 10, color: isActive ? colors.ember : colors.onInverseMuted }}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </GestureDetector>
    </GlassView>
  );
}
