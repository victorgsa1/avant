import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "@/components/theme/ThemeProvider";

type OnboardingCanvasProps = {
  children: ReactNode;
};

// Flat near-white background — no gradient wash, so login/onboarding read as
// part of the same app instead of a separate, warmer-tinted product. Uses
// `paper` (the card-surface token) rather than the tab screens' `paper-dim`:
// these are full-screen forms, not dashboards, so they read best closer to
// white than the app's usual page background.
export function OnboardingCanvas({ children }: OnboardingCanvasProps) {
  const { colors } = useTheme();
  return <View className="flex-1" style={{ backgroundColor: colors.surface }}>{children}</View>;
}
