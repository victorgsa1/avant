import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { FriendRequestResponse, FriendResponse } from "@/services/http/types";
import { FriendRequestsSection } from "./FriendRequestsSection";
import { FriendSearch } from "./FriendSearch";

function FriendRow({
  friend,
  onPressMessage,
  onPressRemove,
}: {
  friend: FriendResponse;
  onPressMessage: () => void;
  onPressRemove: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 38, height: 38, backgroundColor: colors.surfaceSunken }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.textMuted }}>
          {friend.name.charAt(0).toUpperCase()}
        </AppText>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}>
          {friend.name}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
          @{friend.username} · nível {friend.level}
        </AppText>
      </View>

      <Pressable
        onPress={onPressMessage}
        className="rounded-full"
        style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.emberTint }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 12, color: colors.emberInk }}>
          Conversar
        </AppText>
      </Pressable>

      <Pressable onPress={onPressRemove} hitSlop={8}>
        <AppText family="manrope" weight="bold" style={{ fontSize: 18, color: colors.textFaint }}>
          ×
        </AppText>
      </Pressable>
    </View>
  );
}

type FriendsTabContentProps = {
  friends: FriendResponse[];
  incoming: FriendRequestResponse[];
  outgoing: FriendRequestResponse[];
  busy: boolean;
  actionError: string | null;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onRemove: (userId: string) => void;
  onChanged: () => void;
};

export function FriendsTabContent({
  friends,
  incoming,
  outgoing,
  busy,
  actionError,
  onAccept,
  onDecline,
  onRemove,
  onChanged,
}: FriendsTabContentProps) {
  const { colors } = useTheme();

  return (
    <>
      <FriendRequestsSection
        incoming={incoming}
        outgoing={outgoing}
        busy={busy}
        onAccept={onAccept}
        onDecline={onDecline}
      />

      <View className="flex-row items-baseline justify-between px-6" style={{ paddingTop: 24 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Seus amigos
        </AppText>
        <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          {friends.length} {friends.length === 1 ? "amigo" : "amigos"}
        </AppText>
      </View>

      <FriendSearch onChanged={onChanged} />

      {actionError ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ paddingHorizontal: 26, paddingTop: 10, fontSize: 12.5, color: colors.danger }}
        >
          {actionError}
        </AppText>
      ) : null}

      <View className="px-6" style={{ paddingTop: 8 }}>
        {friends.length === 0 ? (
          <EmptyState
            title="Nenhum amigo por aqui ainda"
            description="Busque pelo @usuário de alguém para começar a comparar consistência."
          />
        ) : (
          friends.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              onPressMessage={() => router.push(`/chat?friendId=${friend.id}`)}
              onPressRemove={() => onRemove(friend.id)}
            />
          ))
        )}
      </View>
    </>
  );
}
