import { GlassContainer, GlassView } from "expo-glass-effect";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { NavHojeIcon, NavProfileIcon, NavProgressIcon, NavRankingIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const TABS: { href: Href; icon: typeof NavHojeIcon; label: string }[] = [
  { href: "/", icon: NavHojeIcon, label: "Hoje" },
  { href: "/ranking", icon: NavRankingIcon, label: "Ranking" },
  { href: "/progress", icon: NavProgressIcon, label: "Progresso" },
  { href: "/profile", icon: NavProfileIcon, label: "Perfil" },
];

const HIGHLIGHT_INSET = 6;
const SPRING = { damping: 22, stiffness: 260, mass: 0.7 };

// Real native glass, not glassmorphism: the selection highlight is a second
// `GlassView` sharing a `GlassContainer` with the pill background, so on
// iOS 26 it visually merges with it (UIVisualEffectView), and it follows the
// finger while dragging via Reanimated worklets instead of just snapping.
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
    router.navigate(TABS[clamped].href);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      "worklet";
      if (tabWidth <= 0) return;
      isDragging.value = true;
      const target = Math.min(Math.max(event.x - tabWidth / 2, 0), barWidth - tabWidth);
      translateX.value = target;
    })
    .onUpdate((event) => {
      "worklet";
      if (tabWidth <= 0) return;
      const target = Math.min(Math.max(event.x - tabWidth / 2, 0), barWidth - tabWidth);
      translateX.value = target;
    })
    .onEnd(() => {
      "worklet";
      if (tabWidth <= 0) return;
      const index = Math.round(translateX.value / tabWidth);
      translateX.value = withSpring(index * tabWidth, SPRING);
      isDragging.value = false;
      runOnJS(navigateToIndex)(index);
    });

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GlassContainer
      spacing={20}
      style={{ height: 62, borderRadius: 31, overflow: "hidden" }}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        tintColor={colors.inverse}
        style={StyleSheet.absoluteFill}
      />

      {barWidth > 0 ? (
        <Animated.View
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
          <GlassView
            isInteractive
            glassEffectStyle="regular"
            tintColor={colors.ember}
            style={{ flex: 1, borderRadius: 22 }}
          />
        </Animated.View>
      ) : null}

      <GestureDetector gesture={pan}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {TABS.map((tab, index) => (
            <View key={tab.label} pointerEvents="none" className="flex-1 items-center justify-center" style={{ gap: 4 }}>
              <tab.icon color={index === activeIndex ? colors.ember : colors.onInverseMuted} />
              <AppText
                family="manrope"
                weight={index === activeIndex ? "extraBold" : "semiBold"}
                style={{ fontSize: 10, color: index === activeIndex ? colors.ember : colors.onInverseMuted }}
              >
                {tab.label}
              </AppText>
            </View>
          ))}
        </View>
      </GestureDetector>
    </GlassContainer>
  );
}
