import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { notificationsApi } from "@/services/api";
import type { NotificationResponse } from "@/services/http/types";

/** Rótulo curto do tipo — o app não mostra o enum cru. */
const TYPE_LABEL: Partial<Record<NotificationResponse["type"], string>> = {
  REMINDER: "Lembrete",
  BEHAVIORAL_REMINDER: "Lembrete",
  RESCUE: "Resgate",
  RECOVERY: "Retomada",
  COMEBACK: "Retomada",
  WEEKLY_PROGRESS: "Semana",
  INSIGHT: "Descoberta",
  ACHIEVEMENT: "Conquista",
  STREAK: "Sequência",
  FRIEND_REQUEST: "Amizade",
  FRIEND_ACCEPTED: "Amizade",
  COMPETITION_INVITE: "Competição",
  COMPETITION_UPDATE: "Competição",
  SOCIAL: "Social",
  SYSTEM: "Avant",
  GENERAL: "Avant",
};

/**
 * Vocabulário de deep link do backend → rota real do app.
 *
 * O `route` vem do payload da notificação, então NUNCA é empurrado direto
 * para o router: só o que está nesta lista navega. Rota desconhecida cai
 * na home em vez de quebrar a navegação.
 */
function resolveRoute(route: string | undefined): string | null {
  if (!route) return null;
  if (route === "/today") return "/";
  if (route === "/(tabs)/progress") return "/progress";
  if (route === "/(tabs)/social") return "/social";
  if (/^\/chat\/[A-Za-z0-9_-]+$/.test(route)) return route;
  if (route === "/chat") return "/chat";
  return "/";
}

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

/**
 * Caixa de entrada das intervenções.
 *
 * Toda notificação vive aqui mesmo quando o push não sai (sem provedor
 * configurado, sem aparelho registrado): o backend grava a intenção de
 * qualquer forma, então a pessoa nunca perde o que o Avant tinha a dizer.
 */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { data, loading, refreshing, error, refresh, mutate } = useAsyncResource(
    useCallback(() => notificationsApi.list(), []),
  );

  const open = (notification: NotificationResponse) => {
    if (!notification.readAt) {
      mutate((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      void notificationsApi.markRead(notification.id).catch(() => undefined);
    }

    const route = resolveRoute(notification.data?.route);
    if (!route) return;

    void notificationsApi.markOpened(notification.id).catch(() => undefined);
    router.push(route as never);
  };

  return (
    <Screen>
      <PageHeader title="Notificações" onBack={() => router.back()} />

      {loading && !data ? <ScreenLoading /> : null}
      {error && !data ? <ScreenError message={error} onRetry={() => void refresh()} /> : null}

      {data ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.ember}
            />
          }
        >
          {data.length === 0 ? (
            <EmptyState
              title="Nada por aqui ainda"
              description="Lembretes, retomadas e descobertas sobre a sua rotina aparecem nesta tela."
            />
          ) : null}

          {data.map((notification) => {
            const unread = notification.readAt == null;
            return (
              <Pressable
                key={notification.id}
                onPress={() => open(notification)}
                className="flex-row"
                style={{
                  gap: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surfaceSunken,
                  backgroundColor: unread ? colors.emberWash : "transparent",
                }}
              >
                <View
                  className="rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    marginTop: 7,
                    backgroundColor: unread ? colors.ember : "transparent",
                  }}
                />

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
                    <AppText
                      family="manrope"
                      weight="bold"
                      style={{ fontSize: 12, color: colors.emberDeep }}
                    >
                      {TYPE_LABEL[notification.type] ?? "Avant"}
                    </AppText>
                    <AppText
                      family="manrope"
                      weight="medium"
                      style={{ fontSize: 11.5, color: colors.textFaint }}
                    >
                      {timeAgo(notification.createdAt)}
                    </AppText>
                  </View>

                  <AppText
                    family="archivo"
                    weight={unread ? "extraBold" : "bold"}
                    style={{ marginTop: 5, fontSize: 15, letterSpacing: -0.3, color: colors.text }}
                  >
                    {notification.title}
                  </AppText>

                  <AppText
                    family="manrope"
                    weight="medium"
                    style={{ marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.textMuted }}
                  >
                    {notification.body}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
