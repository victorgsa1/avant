import { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { MessageComposer } from "@/features/chat/components/MessageComposer";
import { useConversation, type PendingMessage } from "@/features/chat/hooks/useConversation";

export default function ConversationScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id);

  const {
    conversation,
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    typingUserIds,
    loadMore,
    send,
    notifyTyping,
    reload,
  } = useConversation(conversationId);

  const subtitle = useMemo(() => {
    if (!conversation) return null;

    if (typingUserIds.length > 0) {
      const names = conversation.participants
        .filter((participant) => typingUserIds.includes(participant.id))
        .map((participant) => participant.name.split(" ")[0]);
      if (names.length === 1) return `${names[0]} está digitando…`;
      if (names.length > 1) return "digitando…";
    }

    if (conversation.type === "GROUP") {
      return `${conversation.participants.length} participantes`;
    }
    const other = conversation.participants.find((participant) => participant.id !== user?.id);
    return other ? `@${other.username}` : null;
  }, [conversation, typingUserIds, user?.id]);

  const renderItem = useCallback(
    ({ item, index }: { item: PendingMessage; index: number }) => {
      const isMine = item.sender?.id === user?.id || (item.pending && item.sender === null);
      // Lista invertida: o "anterior" visualmente é o próximo do array.
      const previous = messages[index + 1];
      const showSender =
        conversation?.type === "GROUP" && previous?.sender?.id !== item.sender?.id;

      return (
        <MessageBubble message={item} isMine={!!isMine} showSender={!!showSender} />
      );
    },
    [conversation?.type, messages, user?.id],
  );

  if (loading && messages.length === 0) {
    return (
      <Screen>
        <ChatHeader title="Conversa" onBack={() => router.back()} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && messages.length === 0) {
    return (
      <Screen>
        <ChatHeader title="Conversa" onBack={() => router.back()} />
        <ScreenError message={error} onRetry={() => void reload()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ChatHeader
        title={conversation?.title ?? "Conversa"}
        subtitle={subtitle}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, flexGrow: 1 }}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          keyboardDismissMode="interactive"
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 14 }}>
                <ActivityIndicator size="small" color={colors.textFaint} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title="Comece a conversa"
              description="As mensagens ficam só entre vocês e o Avant."
            />
          }
        />

        {!hasMore && messages.length > 0 ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ textAlign: "center", paddingBottom: 6, fontSize: 11, color: colors.textWhisper }}
          >
            Início da conversa
          </AppText>
        ) : null}

        <MessageComposer
          onSend={(body) => void send(body, user?.id ?? "")}
          onTyping={notifyTyping}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
