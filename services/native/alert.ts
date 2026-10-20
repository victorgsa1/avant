import { Alert, Platform } from "react-native";

export type AlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

export type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
};

export type AlertSnapshot = {
  /** O alerta na tela. Continua preenchido durante o fade de saída. */
  alert: AlertRequest | null;
  visible: boolean;
};

let queue: AlertRequest[] = [];
let nextId = 1;
let snapshot: AlertSnapshot = { alert: null, visible: false };
const listeners = new Set<() => void>();

function emit() {
  const head = queue[0];
  // Sem fila, o último alerta fica no snapshot: o modal apaga com o conteúdo
  // ainda desenhado, em vez de sumir o cartão antes do fundo.
  snapshot = { alert: head ?? snapshot.alert, visible: head !== undefined };
  listeners.forEach((listener) => listener());
}

/**
 * Substituto do `Alert.alert`, mesma assinatura. No iOS continua o alerta do
 * sistema; no Android e no web vira o modal do app (`AlertHost`, montado no
 * layout raiz) — o alerta nativo do Android não segue o tema nem a fonte, e
 * no web o `Alert.alert` não mostra nada.
 *
 * Alertas chamados com outro já aberto entram na fila e aparecem em seguida.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS === "ios") {
    Alert.alert(title, message, buttons);
    return;
  }

  queue = [...queue, { id: nextId++, title, message, buttons: buttons?.length ? buttons : [{ text: "OK" }] }];
  emit();
}

/** Fecha o alerta `id` e roda o `onPress` do botão escolhido (se houver). */
export function resolveAlert(id: number, button?: AlertButton): void {
  // Toque duplo, ou toque durante o fade: o alerta já saiu da fila.
  if (queue[0]?.id !== id) return;
  queue = queue.slice(1);
  emit();
  button?.onPress?.();
}

export function subscribeAlerts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAlertSnapshot(): AlertSnapshot {
  return snapshot;
}
