import { useCallback, useState } from "react";
import { friendsApi, socialApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { FriendRequestsResponse, FriendResponse, SocialFeedItem } from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";

interface SocialPayload {
  feed: SocialFeedItem[];
  friends: FriendResponse[];
  requests: FriendRequestsResponse;
}

export function useSocialData() {
  const resource = useAsyncResource<SocialPayload>(
    useCallback(async () => {
      const [feed, friends, requests] = await Promise.all([
        socialApi.feed(),
        friendsApi.list(),
        friendsApi.requests(),
      ]);
      return { feed, friends, requests };
    }, []),
  );

  const { data, refresh, mutate } = resource;
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (operation: () => Promise<unknown>) => {
      setBusy(true);
      setActionError(null);
      try {
        await operation();
        await refresh();
      } catch (error) {
        setActionError(userMessage(error));
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const acceptRequest = useCallback(
    (requestId: string) => run(() => friendsApi.accept(requestId)),
    [run],
  );

  const declineRequest = useCallback(
    (requestId: string) => run(() => friendsApi.removeRequest(requestId)),
    [run],
  );

  const removeFriend = useCallback(
    (userId: string) => run(() => friendsApi.remove(userId)),
    [run],
  );

  // Otimista: a curtida aparece na hora, sem esperar a rede. Some de novo
  // só se a chamada falhar de verdade — não vale a pena recarregar o feed
  // inteiro por causa de um toque num coração.
  const toggleLike = useCallback(
    async (insightId: string) => {
      const flip = (current: SocialPayload): SocialPayload => ({
        ...current,
        feed: current.feed.map((item) =>
          item.id === insightId
            ? { ...item, likedByMe: !item.likedByMe, likeCount: item.likeCount + (item.likedByMe ? -1 : 1) }
            : item,
        ),
      });

      mutate(flip);
      try {
        const result = await socialApi.toggleLike(insightId);
        mutate((current) => ({
          ...current,
          feed: current.feed.map((item) =>
            item.id === insightId ? { ...item, likedByMe: result.liked, likeCount: result.likeCount } : item,
          ),
        }));
      } catch {
        mutate(flip);
      }
    },
    [mutate],
  );

  return {
    ...resource,
    feed: data?.feed ?? [],
    rawFriends: data?.friends ?? [],
    incomingRequests: data?.requests.incoming ?? [],
    outgoingRequests: data?.requests.outgoing ?? [],
    toggleLike,
    acceptRequest,
    declineRequest,
    removeFriend,
    actionError,
    busy,
  };
}
