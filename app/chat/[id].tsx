import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Pressable } from "@/components/ui/Pressable";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { DayPill, DaySeparator } from "@/features/chat/components/DaySeparator";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { MessageComposer } from "@/features/chat/components/MessageComposer";
import { useConversation, type PendingMessage } from "@/features/chat/hooks/useConversation";
import { useFloatingDay } from "@/features/chat/hooks/useFloatingDay";
import { isSameDay } from "@/features/chat/format";
import { blocksApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

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
    deleteMessage,
    leaveConversation,
    reload,
  } = useConversation(conversationId);

  const [actionError, setActionError] = useState<string | null>(null);
  const floatingDay = useFloatingDay();

  const other = useMemo(
    () => conversation?.participants.find((participant) => participant.id !== user?.id) ?? null,
    [conversation?.participants, user?.id],
  );

  /**
   * Ações da conversa. Em grupo: convidar e sair. Em conversa direta:
   * bloquear — que no backend derruba a conversa dos dois lados e some
   * das buscas.
   */
  const openActions = () => {
    if (!conversation) return;

    const options: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [
      { text: "Cancelar", style: "cancel" },
    ];

    if (conversation.type === "GROUP") {
      options.push({
        text: "Adicionar pessoas",
        onPress: () => router.push(`/chat/new-group?conversationId=${conversation.id}`),
      });
      options.push({
        text: "Sair do grupo",
        style: "destructive",
        onPress: () => {
          void leaveConversation()
            .then(() => router.back())
            .catch((caught) => setActionError(userMessage(caught)));
        },
      });
    } else if (other) {
      options.push({
        text: `Bloquear @${other.username}`,
        style: "destructive",
        onPress: () => {
          void blocksApi
            .block(other.id)
            .then(() => router.back())
            .catch((caught) => setActionError(userMessage(caught)));
        },
      });
    }

    if (Platform.OS === "web") {
      // Sem Alert no web: a ação principal roda direto.
      options.find((option) => option.style === "destructive")?.onPress?.();
      return;
    }
    Alert.alert(conversation.title, undefined, options);
  };

  const confirmDelete = (message: PendingMessage) => {
    const run = () => void deleteMessage(message.id);
    if (Platform.OS === "web") {
      run();
      return;
    }
    Alert.alert("Apagar mensagem?", "Ela some para todo mundo na conversa.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: run },
    ]);
  };

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
      // Primeira mensagem do dia ganha o separador com a data por cima.
      const startsDay = !previous || !isSameDay(previous.createdAt, item.createdAt);
      const showSender =
        conversation?.type === "GROUP" && (startsDay || previous?.sender?.id !== item.sender?.id);

      // Um View só: na lista invertida a célula é `column-reverse`, e um
      // Fragment deixaria o separador embaixo da bolha.
      return (
        <View>
          {startsDay ? <DaySeparator iso={item.createdAt} /> : null}
          <MessageBubble
            message={item}
            isMine={!!isMine}
            showSender={!!showSender}
            onLongPress={confirmDelete}
          />
        </View>
      );
    },
    // `confirmDelete` só depende de `deleteMessage`, que é estável.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        right={
          <Pressable
            onPress={openActions}
            hitSlop={10}
            className="items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <AppText family="archivo" weight="black" style={{ fontSize: 15, color: colors.textMuted }}>
              ···
            </AppText>
          </Pressable>
        }
      />

      {actionError ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ paddingHorizontal: 20, paddingTop: 8, fontSize: 12.5, color: colors.danger }}
        >
          {actionError}
        </AppText>
      ) : null}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            {...floatingDay.listProps}
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
  
          {floatingDay.iso ? (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(250)}
              pointerEvents="none"
              style={{ position: "absolute", top: 8, left: 0, right: 0, alignItems: "center" }}
            >
              <DayPill iso={floatingDay.iso} floating />
            </Animated.View>
          ) : null}
        </View>

        {!hasMore && messages.length > 0 ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ textAlign: "center", paddingBottom: 6, fontSize: 11, color: colors.textWhisper }}
          >
            Início da conversa
          </AppText>
        ) : null}

        <MessageComposer onSend={(body) => void send(body)} onTyping={notifyTyping} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
