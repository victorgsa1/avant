import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/components/theme/ThemeProvider";

type ScreenProps = {
  children: ReactNode;
};

// Safe area só no topo: nada (cabeçalho ou conteúdo rolando) passa por baixo
// da status bar / notch, e a faixa do topo herda o fundo da tela. O rodapé
// fica de fora porque a tab bar e as telas com ação fixa embaixo já somam o
// próprio `insets.bottom`.
export function Screen({ children }: ScreenProps) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
}
