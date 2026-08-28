import { useCallback, useMemo, useState } from "react";
import { friendsApi, rankingApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type {
  FriendRequestsResponse,
  FriendResponse,
  RankingPeriod,
  RankingResponse,
} from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { Friend, GroupAvatar, PodiumEntry, RankRow } from "../types";

interface RankingPayload {
  ranking: RankingResponse;
  friends: FriendResponse[];
  requests: FriendRequestsResponse;
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function useRankingData() {
  const [period, setPeriod] = useState<RankingPeriod>("week");

  const resource = useAsyncResource<RankingPayload>(
    useCallback(async () => {
      const [ranking, friends, requests] = await Promise.all([
        rankingApi.get(period),
        friendsApi.list(),
        friendsApi.requests(),
      ]);
      return { ranking, friends, requests };
    }, [period]),
  );

  const { data, refresh } = resource;
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

  const view = useMemo(() => {
    if (!data) return null;
    const { ranking, friends, requests } = data;

    // O pódio do desenho é 2º, 1º, 3º (o vencedor no meio).
    const top = ranking.rows.slice(0, 3);
    const podiumOrder = [top[1], top[0], top[2]].filter(Boolean);
    const podium: PodiumEntry[] = podiumOrder.map((row) => ({
      place: row.position,
      name: row.isCurrentUser ? "Você" : row.name.split(" ")[0],
      initial: initialOf(row.name),
      pct: Math.round(row.score),
    }));

    // A lista abaixo do pódio começa na 4ª posição — a não ser que o
    // usuário esteja no pódio, quando mostramos o resto do grupo.
    const rankRows: RankRow[] = ranking.rows.slice(3).map((row) => ({
      pos: row.position,
      name: row.isCurrentUser ? "Você" : row.name,
      pct: Math.round(row.score),
      move: "",
      isCurrentUser: row.isCurrentUser,
    }));

    const friendList: Friend[] = friends.map((friend) => ({
      name: friend.name,
      handle: `@${friend.username}`,
      pct: friend.streakCurrent,
    }));

    const groupAvatars: GroupAvatar[] = [
      { initial: initialOf(ranking.me?.name ?? "?"), isCurrentUser: true },
      ...friends.slice(0, 3).map((friend) => ({ initial: initialOf(friend.name) })),
    ];

    return {
      period,
      currentUserRank: ranking.me?.position ?? 0,
      currentUserPct: Math.round(ranking.me?.score ?? 0),
      currentUserPositionsGained: 0,
      podium,
      rankRows,
      friends: friendList,
      rawFriends: friends,
      incomingRequests: requests.incoming,
      outgoingRequests: requests.outgoing,
      groupAvatars,
      nextRival: ranking.next,
      totalParticipants: ranking.rows.length,
    };
  }, [data, period]);

  return {
    ...resource,
    view,
    period,
    setPeriod,
    acceptRequest,
    declineRequest,
    removeFriend,
    actionError,
    busy,
  };
}
