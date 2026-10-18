import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SOCIAL_ART } from "@/features/social/art";
import { SocialSectionTitle } from "@/features/social/components/SocialSectionTitle";
import { ActionError } from "@/features/social/components/TabState";
import { useFriends } from "@/features/social/hooks/useFriends";
import type { FriendRequestResponse } from "@/services/http/types";

type RequestAction = { label: string; primary?: boolean; onPress: () => void };

/** A linha toda abre o perfil da pessoa; os botões respondem ali mesmo. */
function RequestRow({
  request,
  busy,
  actions,
  last,
}: {
  request: FriendRequestResponse;
  busy: boolean;
  actions: RequestAction[];
  last: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/user/${request.user.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${request.user.name}, @${request.user.username}`}
      accessibilityHint="Abre o perfil"
      // A linha vira um elemento só no leitor de tela: os botões entram como ações dela.
      accessibilityActions={busy ? [] : actions.map((action) => ({ name: action.label, label: action.label }))}
      onAccessibilityAction={(event) => {
        actions.find((action) => action.label === event.nativeEvent.actionName)?.onPress();
      }}
      className="flex-row items-center"
      style={{ gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.line }}
    >
      <Avatar name={request.user.name} uri={request.user.avatarUrl} size={52} ring />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="extraBold" numberOfLines={1} style={{ fontSize: 16, color: colors.text }}>
          {request.user.name}
        </AppText>
        <AppText family="manrope" weight="medium" numberOfLines={1} style={{ marginTop: 2, fontSize: 13.5, color: colors.textMuted }}>
          @{request.user.username}
        </AppText>
      </View>

      {busy ? (
        <ActivityIndicator color={colors.ember} />
      ) : (
        <View className="flex-row" style={{ gap: 8 }}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={`${action.label} ${request.user.name}`}
              className="items-center justify-center rounded-full"
              style={{
                height: 38,
                paddingHorizontal: 15,
                backgroundColor: action.primary ? colors.ember : "transparent",
                borderWidth: action.primary ? 0 : 1.3,
                borderColor: colors.lineStrong,
              }}
            >
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ fontSize: 13, color: action.primary ? colors.onEmber : colors.textMuted }}
              >
                {action.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Pressable>
  );
}

/**
 * Pedidos de amizade: os recebidos (aceitar/recusar) e os enviados (cancelar).
 * Tocar na pessoa abre o perfil dela antes de responder.
 */
export default function FriendRequestsScreen() {
  const { colors } = useTheme();
  const friends = useFriends();
  const { incoming, outgoing } = friends;

  return (
    <Screen>
      <PageHeader title="Pedidos de amizade" onBack={() => router.back()} />

      {friends.loading && !friends.data ? <ScreenLoading /> : null}
      {friends.error && !friends.data ? (
        <ScreenError message={friends.error} onRetry={() => void friends.refresh()} />
      ) : null}

      {friends.data ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 22, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={friends.refreshing} onRefresh={() => void friends.refresh()} tintColor={colors.ember} />
          }
        >
          <ActionError message={friends.actionError} />

          {incoming.length === 0 && outgoing.length === 0 ? (
            <EmptyState
              image={SOCIAL_ART.pedidos}
              title="Nenhum pedido agora"
              description="Quando alguém te adicionar, o pedido aparece aqui."
              action={{ label: "Adicionar amigo", onPress: () => router.replace("/add-friend") }}
            />
          ) : null}

          {incoming.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <SocialSectionTitle title="Recebidos" count={incoming.length} />
              <View className="px-5">
                {incoming.map((request, index) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    busy={friends.busyId === request.id}
                    last={index === incoming.length - 1}
                    actions={[
                      { label: "Recusar", onPress: () => void friends.removeRequest(request.id) },
                      { label: "Aceitar", primary: true, onPress: () => void friends.accept(request.id) },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {outgoing.length > 0 ? (
            <View style={{ marginTop: 28 }}>
              <SocialSectionTitle title="Enviados" count={outgoing.length} />
              <View className="px-5">
                {outgoing.map((request, index) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    busy={friends.busyId === request.id}
                    last={index === outgoing.length - 1}
                    actions={[{ label: "Cancelar", onPress: () => void friends.removeRequest(request.id) }]}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
