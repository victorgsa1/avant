import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { ChatBubbleIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { FriendResponse } from "@/services/http/types";

type ChatButtonProps = {
  unread: number;
  opening: boolean;
  friendName: string;
  onPress: () => void;
};

/**
 * O balão de conversa: cheio quando há mensagem nova, contorno quando não.
 * O número é o mesmo não-lido da lista de conversas, vivo pelo socket.
 */
function ChatButton({ unread, opening, friendName, onPress }: ChatButtonProps) {
  const { colors } = useTheme();
  const hasUnread = unread > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={opening}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={
        hasUnread
          ? `Conversar com ${friendName}, ${unread} ${unread === 1 ? "mensagem nova" : "mensagens novas"}`
          : `Conversar com ${friendName}`
      }
      className="items-center justify-center rounded-full"
      style={{
        width: 50,
        height: 50,
        backgroundColor: hasUnread ? colors.ember : "transparent",
        borderWidth: hasUnread ? 0 : 1.5,
        borderColor: colors.ember,
      }}
    >
      {opening ? (
        <ActivityIndicator size="small" color={hasUnread ? colors.onEmber : colors.ember} />
      ) : (
        <ChatBubbleIcon size={23} color={hasUnread ? colors.onEmber : colors.ember} />
      )}

      {hasUnread ? (
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            top: -5,
            right: -5,
            minWidth: 23,
            height: 23,
            paddingHorizontal: 5,
            backgroundColor: colors.paper,
            borderWidth: 2,
            borderColor: colors.bg,
          }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 11.5, color: colors.emberInk }}>
            {unread > 99 ? "99+" : unread}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

type FriendRowProps = {
  friend: FriendResponse;
  unread: number;
  opening: boolean;
  /** Linha divisória embaixo — a última da lista não leva. */
  divider: boolean;
  onOpenChat: () => void;
  onLongPress: () => void;
};

/** Um amigo: foto, nome, @usuário e o balão de conversa. A linha toda abre a conversa. */
export function FriendRow({ friend, unread, opening, divider, onOpenChat, onLongPress }: FriendRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onOpenChat}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityLabel={`${friend.name}, @${friend.username}`}
      accessibilityHint="Abre a conversa. Toque longo para mais opções."
      accessibilityActions={[{ name: "longpress", label: "Mais opções" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "longpress") onLongPress();
      }}
      className="flex-row items-center"
      style={{
        gap: 16,
        paddingVertical: 14,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: colors.line,
      }}
    >
      <Avatar name={friend.name} uri={friend.avatarUrl} size={58} ring />

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          family="archivo"
          weight="extraBold"
          numberOfLines={1}
          style={{ fontSize: 17, letterSpacing: -0.3, color: colors.text }}
        >
          {friend.name}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={1}
          style={{ marginTop: 3, fontSize: 14.5, color: colors.textMuted }}
        >
          @{friend.username}
        </AppText>
      </View>

      <ChatButton unread={unread} opening={opening} friendName={friend.name} onPress={onOpenChat} />
    </Pressable>
  );
}
