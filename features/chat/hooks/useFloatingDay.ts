import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewToken } from "react-native";
import type { PendingMessage } from "./useConversation";

const HIDE_AFTER_MS = 1500;
const VIEWABILITY = { itemVisiblePercentThreshold: 50 };

/**
 * A data que paira no topo da conversa durante a rolagem, como no WhatsApp:
 * mostra o dia da mensagem mais alta na tela e some pouco depois que a
 * rolagem para. `listProps` vai direto na FlatList (invertida).
 */
export function useFloatingDay() {
  const [iso, setIso] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_AFTER_MS);
  }, [cancelHide]);

  useEffect(() => cancelHide, [cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    setVisible(true);
  }, [cancelHide]);

  // A FlatList não aceita trocar este callback depois de montada.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<PendingMessage>[] }) => {
      // Lista invertida: o maior índice visível é o que está mais no alto.
      let top: ViewToken<PendingMessage> | null = null;
      for (const token of viewableItems) {
        if (token.index === null) continue;
        if (!top || token.index > (top.index ?? -1)) top = token;
      }
      if (top) setIso(top.item.createdAt);
    },
  ).current;

  return {
    iso: visible ? iso : null,
    listProps: {
      onViewableItemsChanged,
      viewabilityConfig: VIEWABILITY,
      onScrollBeginDrag: show,
      // Soltou o dedo e a lista seguiu deslizando: ainda não é hora de sumir.
      onMomentumScrollBegin: cancelHide,
      onScrollEndDrag: scheduleHide,
      onMomentumScrollEnd: scheduleHide,
    },
  };
}
