import { useCallback, useRef } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { socialApi } from "@/services/api";
import type { SocialFeedItem } from "@/services/http/types";

/** A aba Atividade: os resumos semanais dos amigos e as curtidas. */
export function useSocialFeed() {
  const resource = useAsyncResource<SocialFeedItem[]>(useCallback(() => socialApi.feed(), []));
  const { mutate } = resource;

  // Um toque por vez em cada card: duas chamadas em voo poderiam voltar
  // fora de ordem e deixar o coração no estado errado.
  const inFlight = useRef(new Set<string>());

  /**
   * Otimista: a curtida aparece na hora, sem esperar a rede. Some de novo só
   * se a chamada falhar — não vale recarregar o feed por um toque num coração.
   */
  const toggleLike = useCallback(
    async (insightId: string) => {
      if (inFlight.current.has(insightId)) return;
      inFlight.current.add(insightId);

      const flip = (items: SocialFeedItem[]) =>
        items.map((item) =>
          item.id === insightId
            ? { ...item, likedByMe: !item.likedByMe, likeCount: item.likeCount + (item.likedByMe ? -1 : 1) }
            : item,
        );

      mutate(flip);
      try {
        const result = await socialApi.toggleLike(insightId);
        mutate((items) =>
          items.map((item) =>
            item.id === insightId ? { ...item, likedByMe: result.liked, likeCount: result.likeCount } : item,
          ),
        );
      } catch {
        mutate(flip);
      } finally {
        inFlight.current.delete(insightId);
      }
    },
    [mutate],
  );

  return { ...resource, items: resource.data ?? [], toggleLike };
}
