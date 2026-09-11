import { Alert, Platform } from "react-native";

type ConfirmOptions = {
  title: string;
  message?: string;
  /** Rótulo do botão que confirma. Padrão "Confirmar". */
  confirmLabel?: string;
  /** Pinta o botão de confirmar como destrutivo (vermelho no iOS). */
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Confirmação que funciona no nativo e no web. No web o `Alert.alert` do
 * React Native não mostra nada, então usamos o `window.confirm` do
 * navegador em vez de pular a pergunta.
 */
export function confirmAction({
  title,
  message,
  confirmLabel = "Confirmar",
  destructive = false,
  onConfirm,
}: ConfirmOptions): void {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== "undefined" && window.confirm(text)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
