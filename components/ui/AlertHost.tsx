import { useSyncExternalStore } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  getAlertSnapshot,
  resolveAlert,
  subscribeAlerts,
  type AlertButton,
  type AlertRequest,
} from "@/services/native/alert";

type Tone = "primary" | "danger" | "soft" | "quiet";

/**
 * O que o voltar do Android (ou o toque fora) escolhe: o botão de cancelar,
 * ou o único botão de um aviso. Com várias ações e nenhum cancelar, a pessoa
 * tem que escolher uma — como no alerta do sistema.
 */
function dismissButton(alert: AlertRequest): AlertButton | null {
  const cancel = alert.buttons.find((button) => button.style === "cancel");
  if (cancel) return cancel;
  return alert.buttons.length === 1 ? alert.buttons[0] : null;
}

/**
 * Uma ação só ganha o botão cheio (laranja, ou vermelho se destrutiva). Com
 * várias, só as destrutivas ficam cheias e as outras ficam suaves, para o
 * vermelho não competir com o laranja. Cancelar é sempre texto, no fim.
 */
function toneOf(button: AlertButton, actionCount: number): Tone {
  if (button.style === "cancel") return "quiet";
  if (button.style === "destructive") return "danger";
  return actionCount === 1 ? "primary" : "soft";
}

/**
 * Desenha os alertas de `showAlert` (services/native/alert) no Android e no
 * web. Monta uma vez, no layout raiz; no iOS fica sempre fechado, porque lá o
 * `showAlert` usa o alerta do sistema.
 */
export function AlertHost() {
  const { colors } = useTheme();
  const { alert, visible } = useSyncExternalStore(subscribeAlerts, getAlertSnapshot, getAlertSnapshot);

  if (!alert) return null;

  const fallback = dismissButton(alert);
  const dismiss = fallback ? () => resolveAlert(alert.id, fallback) : undefined;

  const actions = alert.buttons.filter((button) => button.style !== "cancel");
  const cancels = alert.buttons.filter((button) => button.style === "cancel");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => dismiss?.()}>
      <View className="flex-1 items-center justify-center" style={{ padding: 26 }}>
        <Pressable
          onPress={dismiss}
          disabled={!dismiss}
          haptic="none"
          accessibilityLabel="Fechar"
          style={[StyleSheet.absoluteFill, { backgroundColor: "#0000008C" }]}
        />

        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          className="w-full rounded-[28px]"
          style={{
            maxWidth: 400,
            padding: 24,
            backgroundColor: colors.surface,
            boxShadow: `0 24px 60px ${colors.shadowStrong}`,
          }}
        >
          <AppText
            family="archivo"
            weight="black"
            accessibilityRole="header"
            style={{ fontSize: 21, lineHeight: 26, letterSpacing: -0.7, color: colors.text }}
          >
            {alert.title}
          </AppText>
          {alert.message ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ marginTop: 8, fontSize: 14, lineHeight: 20.5, color: colors.textMuted }}
            >
              {alert.message}
            </AppText>
          ) : null}

          <View style={{ marginTop: 22, gap: 10 }}>
            {[...actions, ...cancels].map((button, index) => (
              <AlertAction
                key={`${index}-${button.text}`}
                label={button.text}
                tone={toneOf(button, actions.length)}
                onPress={() => resolveAlert(alert.id, button)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AlertAction({ label, tone, onPress }: { label: string; tone: Tone; onPress: () => void }) {
  const { colors } = useTheme();

  const palette = {
    primary: { background: colors.ember, text: colors.onEmber },
    danger: { background: colors.danger, text: colors.onEmber },
    soft: { background: colors.surfaceSunken, text: colors.text },
    quiet: { background: "transparent", text: colors.textMuted },
  }[tone];
  const quiet = tone === "quiet";

  return (
    <Pressable
      onPress={onPress}
      haptic={tone === "danger" ? "medium" : "light"}
      accessibilityRole="button"
      style={({ pressed }) => ({
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        height: quiet ? 40 : 52,
        paddingHorizontal: 20,
        backgroundColor: palette.background,
        opacity: pressed ? (quiet ? 0.55 : 0.85) : 1,
      })}
    >
      <AppText
        family={quiet ? "manrope" : "archivo"}
        weight={quiet ? "semiBold" : "extraBold"}
        numberOfLines={1}
        style={{ fontSize: quiet ? 14 : 15, letterSpacing: quiet ? 0 : -0.2, color: palette.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
