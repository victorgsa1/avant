import { useMemo, useState } from "react";
import { Image, View } from "react-native";
import { EmptyState } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { LinkIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ConversationResponse, FriendRequestResponse, FriendResponse } from "@/services/http/types";
import { SOCIAL_ART } from "../../art";
import { NavRow } from "../NavRow";
import { SocialSectionTitle } from "../SocialSectionTitle";
import { ActionError, TabError, TabLoading } from "../TabState";
import { FriendRequestsBanner } from "./FriendRequestsBanner";
import { FriendRow } from "./FriendRow";
import { FriendSearchBar } from "./FriendSearchBar";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^@+/, "")
    .trim();
}

type FriendsTabProps = {
  friends: FriendResponse[];
  incoming: FriendRequestResponse[];
  outgoing: FriendRequestResponse[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  onRetry: () => void;
  chatWith: (friendId: string) => ConversationResponse | null;
  openingChatId: string | null;
  onOpenChat: (friend: FriendResponse) => void;
  onFriendOptions: (friend: FriendResponse) => void;
  /** Leva a "Adicionar amigo", já com o que foi digitado, se houver. */
  onAddFriend: (query?: string) => void;
  onOpenRequests: () => void;
  onInvite: () => void;
};

/**
 * A aba Amigos: buscar entre os amigos, os pedidos pendentes e a lista com
 * o balão de conversa de cada um. Quem tem mensagem nova vem primeiro;
 * depois, quem conversou por último.
 */
export function FriendsTab({
  friends,
  incoming,
  outgoing,
  loading,
  error,
  actionError,
  onRetry,
  chatWith,
  openingChatId,
  onOpenChat,
  onFriendOptions,
  onAddFriend,
  onOpenRequests,
  onInvite,
}: FriendsTabProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const term = normalize(query);

  const visible = useMemo(() => {
    const matching = term
      ? friends.filter((friend) => normalize(friend.name).includes(term) || friend.username.includes(term))
      : friends;
    const unread = (friend: FriendResponse) => (chatWith(friend.id)?.unreadCount ?? 0) > 0;
    const lastAt = (friend: FriendResponse) => chatWith(friend.id)?.lastMessageAt ?? "";
    return [...matching].sort(
      (a, b) =>
        Number(unread(b)) - Number(unread(a)) ||
        lastAt(b).localeCompare(lastAt(a)) ||
        a.name.localeCompare(b.name, "pt-BR"),
    );
  }, [chatWith, friends, term]);

  if (loading && friends.length === 0) return <TabLoading />;
  if (error && friends.length === 0) return <TabError message={error} onRetry={onRetry} />;

  return (
    <View style={{ paddingTop: 22 }}>
      <FriendSearchBar value={query} onChangeText={setQuery} onPressAdd={() => onAddFriend()} />

      <FriendRequestsBanner
        incomingCount={incoming.length}
        outgoingCount={outgoing.length}
        onPress={onOpenRequests}
      />

      <ActionError message={actionError} />

      <View style={{ marginTop: 26 }}>
        <SocialSectionTitle
          title="Seus amigos"
          count={friends.length}
          right={
            friends.length > 0 ? (
              <AppText family="manrope" weight="medium" style={{ fontSize: 14, color: colors.textMuted }}>
                Conversar
              </AppText>
            ) : null
          }
        />
      </View>

      <View className="px-5">
        {friends.length === 0 ? (
          <EmptyState
            image={SOCIAL_ART.conversa}
            title="Nenhum amigo por aqui ainda"
            description="Adicione alguém pelo @usuário ou mande seu link de convite."
            action={{ label: "Adicionar amigo", onPress: () => onAddFriend() }}
          />
        ) : visible.length === 0 ? (
          <View className="items-center" style={{ paddingVertical: 24, gap: 10 }}>
            <AppText family="manrope" weight="medium" style={{ fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
              Ninguém com “{query.trim()}” entre seus amigos.
            </AppText>
            <Pressable onPress={() => onAddFriend(query)} accessibilityRole="button" hitSlop={8}>
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
                Procurar @{query.trim().replace(/^@+/, "")} no Avant
              </AppText>
            </Pressable>
          </View>
        ) : (
          visible.map((friend, index) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              unread={chatWith(friend.id)?.unreadCount ?? 0}
              opening={openingChatId === friend.id}
              divider={index < visible.length - 1}
              onOpenChat={() => onOpenChat(friend)}
              onLongPress={() => onFriendOptions(friend)}
            />
          ))
        )}

        <View style={{ height: 1, backgroundColor: colors.line, marginTop: friends.length === 0 ? 0 : 4 }} />

        <View style={{ paddingTop: 6 }}>
          <NavRow
            variant="plain"
            icon={<LinkIcon size={24} color={colors.text} />}
            label="Convidar por link"
            accessibilityHint="Compartilha um link para te adicionarem no Avant"
            onPress={onInvite}
            trailing={
              <Image source={SOCIAL_ART.conversa} resizeMode="contain" style={{ width: 62, height: 50 }} />
            }
          />
        </View>
      </View>
    </View>
  );
}
