import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { RestartIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { userMessage } from "@/services/http/ApiError";
import { showAlert } from "@/services/native/alert";

/**
 * DEV: atalho flutuante para limpar o onboarding e refazer o fluxo.
 * Só aparece em build de desenvolvimento (`__DEV__`) — o layout das abas
 * decide onde ele fica.
 */
export function DevResetOnboardingButton({ bottom }: { bottom: number }) {
  const { colors } = useTheme();
  const { resetOnboarding } = useSession();
  const [busy, setBusy] = useState(false);

  if (!__DEV__) return null;

  const run = async () => {
    setBusy(true);
    try {
      // Sucesso desmonta as abas (status volta para `onboarding`).
      await resetOnboarding();
    } catch (caught) {
      setBusy(false);
      showAlert("Não deu para limpar", userMessage(caught));
    }
  };

  const confirm = () => {
    showAlert(
      "Limpar onboarding?",
      "Apaga respostas, identidade e plano ativo desta conta e volta para o início do onboarding.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpar", style: "destructive", onPress: () => void run() },
      ],
    );
  };

  return (
    <Pressable
      onPress={confirm}
      disabled={busy}
      haptic="medium"
      accessibilityRole="button"
      accessibilityLabel="Limpar onboarding (dev)"
      className="flex-row items-center rounded-full"
      style={{
        position: "absolute",
        right: 18,
        bottom,
        gap: 6,
        paddingHorizontal: 12,
        height: 34,
        backgroundColor: colors.inverse,
        opacity: busy ? 0.6 : 1,
        boxShadow: `0 6px 16px ${colors.shadowStrong}`,
      }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.onInverse} />
      ) : (
        <RestartIcon size={13} color={colors.onInverse} />
      )}
      <AppText weight="bold" style={{ fontSize: 12, color: colors.onInverse }}>
        DEV · Limpar onboarding
      </AppText>
    </Pressable>
  );
}
