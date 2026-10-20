import { showAlert } from "@/services/native/alert";

type ConfirmOptions = {
  title: string;
  message?: string;
  /** Rótulo do botão que confirma. Padrão "Confirmar". */
  confirmLabel?: string;
  /** Pinta o botão de confirmar como destrutivo (vermelho). */
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Pergunta "tem certeza?" com Cancelar e Confirmar. Alerta do sistema no iOS,
 * modal do app no Android e no web (ver `showAlert`).
 */
export function confirmAction({
  title,
  message,
  confirmLabel = "Confirmar",
  destructive = false,
  onConfirm,
}: ConfirmOptions): void {
  showAlert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
