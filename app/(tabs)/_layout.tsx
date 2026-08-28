import Constants, { AppOwnership } from "expo-constants";
import { router, usePathname } from "expo-router";
import { Tabs, TabList, TabSlot, TabTrigger } from "expo-router/ui";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SimpleTabBar } from "@/components/navigation/SimpleTabBar";
import { PlusIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const ROUTES = ["/", "/ranking", "/progress", "/profile"];

// `appOwnership` is deprecated in favor of `executionEnvironment`, but
// `executionEnvironment` lumps Expo Go and dev-client builds into the same
// "storeClient" bucket — and dev-client builds DO have the native
// glass/gesture/reanimated modules compiled in. `appOwnership === 'expo'` is
// still the only reliable "are we literally in the Expo Go app" check, which
// is what determines whether those native modules exist at all.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

// Loaded via `require` instead of a static `import` so its module graph
// (expo-glass-effect, gesture-handler, reanimated) never even evaluates
// under Expo Go — a static import would run that code regardless of whether
// the component is actually rendered.
let GlassTabBar: ComponentType<{ activeIndex: number }> | null = null;
if (!isExpoGo) {
  // Per Expo's own docs: some iOS 26 builds/betas don't actually have the
  // Liquid Glass API available even though the OS check passes — calling
  // GlassView/GlassContainer there can crash or silently render as a flat
  // view. Checking this explicitly lets us fall back to SimpleTabBar
  // instead of shipping a broken-looking glass effect.
  const { isGlassEffectAPIAvailable } = require("expo-glass-effect") as typeof import("expo-glass-effect");
  if (isGlassEffectAPIAvailable()) {
    GlassTabBar = (require("@/components/navigation/GlassTabBar") as typeof import("@/components/navigation/GlassTabBar"))
      .GlassTabBar;
  }
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const activeIndex = Math.max(0, ROUTES.indexOf(pathname));

  return (
    <Tabs style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabSlot />

      <View
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: insets.bottom + 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          {GlassTabBar ? <GlassTabBar activeIndex={activeIndex} /> : <SimpleTabBar activeIndex={activeIndex} />}
        </View>

        <Pressable
          onPress={() => router.push("/new-action")}
          className="items-center justify-center rounded-full"
          style={{
            width: 62,
            height: 62,
            backgroundColor: colors.ember,
            boxShadow: `0 12px 26px ${colors.ember}59`,
          }}
        >
          <PlusIcon color={colors.onEmber} />
        </Pressable>
      </View>

      <TabList style={{ display: "none" }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="ranking" href="/ranking" />
        <TabTrigger name="progress" href="/progress" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>
    </Tabs>
  );
}
