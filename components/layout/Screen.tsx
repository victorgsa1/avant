import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "@/components/theme/ThemeProvider";

type ScreenProps = {
  children: ReactNode;
};

// Edge-to-edge: no SafeAreaView here on purpose. Screens render full-bleed
// so decorative art (rings, blobs, header stripes) can extend behind the
// status bar. Headers that carry actual readable content are responsible
// for their own `useSafeAreaInsets().top` padding — see HomeTopBar,
// ProgressHeader, ProfileHeader, SocialHeader.
export function Screen({ children }: ScreenProps) {
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </View>
  );
}
