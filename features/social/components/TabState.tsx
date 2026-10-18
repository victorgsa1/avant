import { ActivityIndicator, View } from "react-native";
import { ScreenError } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Carregando/erro DENTRO da aba: cabeçalho e abas continuam na tela, então
 * dá para trocar de aba enquanto uma delas ainda carrega.
 */
export function TabLoading() {
  const { colors } = useTheme();
  return (
    <View className="items-center justify-center" style={{ minHeight: 260 }}>
      <ActivityIndicator color={colors.ember} />
    </View>
  );
}

export function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ minHeight: 300 }}>
      <ScreenError message={message} onRetry={onRetry} />
    </View>
  );
}

/** Erro de uma ação (aceitar, curtir, abrir conversa) — curto, abaixo do que falhou. */
export function ActionError({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <AppText
      accessibilityRole="alert"
      family="manrope"
      weight="medium"
      style={{ marginTop: 12, paddingHorizontal: 26, fontSize: 12.5, textAlign: "center", color: colors.danger }}
    >
      {message}
    </AppText>
  );
}
