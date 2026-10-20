import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/components/theme/ThemeProvider";

type OnboardingCanvasProps = {
  children: ReactNode;
};

// Flat near-white background — no gradient wash, so login/onboarding read as
// part of the same app instead of a separate, warmer-tinted product. Uses
// `paper` (the card-surface token) rather than the tab screens' `paper-dim`:
// these are full-screen forms, not dashboards, so they read best closer to
// white than the app's usual page background.
//
// Como o `Screen`, aplica a safe area do topo; o rodapé fica com cada tela.
export function OnboardingCanvas({ children }: OnboardingCanvasProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.surface }}>
      {children}
    </SafeAreaView>
  );
}
