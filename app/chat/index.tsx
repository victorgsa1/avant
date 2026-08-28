import { useEffect, useRef } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { useConversations } from "@/features/chat/hooks/useConversations";
import type { ConversationResponse } from "@/services/http/types";

function previewOf(conversation: ConversationResponse): string {
  const message = conversation.lastMessage;
  if (!message) return "Nenhuma mensagem ainda";
  if (message.type === "SYSTEM") return message.body;
  const author = message.sender?.name?.split(" ")[0];
  return author ? `${author}: ${message.body}` : message.body;
}

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function ConversationRow({ conversation }: { conversation: ConversationResponse }) {
  const { colors } = useTheme();
  const unread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={() => router.push(`/chat/${conversation.id}`)}
      className="flex-row items-center"
      style={{
        gap: 13,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceSunken,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 46,
          height: 46,
          backgroundColor: conversation.type === "GROUP" ? colors.emberTint : colors.surfaceSunken,
        }}
      >
        <AppText
          family="archivo"
          weight="extraBold"
          style={{
            fontSize: 16,
            color: conversation.type === "GROUP" ? colors.emberInk : colors.textMuted,
          }}
        >
          {conversation.title.charAt(0).toUpperCase()}
        </AppText>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          family="archivo"
          weight={unread ? "black" : "bold"}
          numberOfLines={1}
          style={{ fontSize: 15, letterSpacing: -0.3, color: colors.text }}
        >
          {conversation.title}
        </AppText>
        <AppText
          family="manrope"
          weight={unread ? "bold" : "medium"}
          numberOfLines={1}
          style={{ marginTop: 2, fontSize: 12.5, color: unread ? colors.textStrong : colors.textMuted }}
        >
          {previewOf(conversation)}
        </AppText>
      </View>

      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textWhisper }}>
          {timeLabel(conversation.lastMessageAt)}
        </AppText>
        {unread ? (
          <View
            className="items-center justify-center rounded-full"
            style={{ minWidth: 20, height: 20, paddingHorizontal: 6, backgroundColor: colors.ember }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 11, color: colors.onEmber }}>
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ConversationsScreen() {
  const { colors } = useTheme();
  const { friendId } = useLocalSearchParams<{ friendId?: string }>();
  const { data, loading, refreshing, error, refresh, openDirect } = useConversations();
  const openedFor = useRef<string | null>(null);

  // Chegou da lista de amigos com "Conversar": abre (ou cria) o DM.
  useEffect(() => {
    if (!friendId || openedFor.current === friendId) return;
    openedFor.current = friendId;
    void openDirect(friendId)
      .then((conversation) => router.replace(`/chat/${conversation.id}`))
      .catch(() => undefined);
  }, [friendId, openDirect]);

  return (
    <Screen>
      <ChatHeader title="Conversas" onBack={() => router.back()} />

      {loading && !data ? (
        <ScreenLoading />
      ) : error && !data ? (
        <ScreenError message={error} onRetry={() => void refresh()} />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.ember} />
          }
        >
          {data && data.length > 0 ? (
            data.map((conversation) => (
              <ConversationRow key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <EmptyState
              title="Nenhuma conversa ainda"
              description="Vá até Ranking → Amigos e toque em Conversar para começar."
              action={{ label: "Ver amigos", onPress: () => router.replace("/ranking") }}
            />
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
