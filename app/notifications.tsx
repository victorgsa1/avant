import { Fragment, useCallback, useMemo } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { BellOutlineIcon } from "@/components/ui/icons/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationRow } from "@/features/notifications/components/NotificationRow";
import { groupByDay, unreadLabel } from "@/features/notifications/format";
import { ONBOARDING_ART } from "@/features/onboarding/art";
import { SettingsGroup, SettingsItem, SettingsPill } from "@/features/settings/components/SettingsGroup";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { notificationsApi } from "@/services/api";
import type { NotificationResponse } from "@/services/http/types";

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

const openSettings = () => router.push("/settings/notifications");

/**
 * Caixa de entrada das intervenções.
 *
 * Toda notificação vive aqui mesmo quando o push não sai (sem provedor
 * configurado, sem aparelho registrado): o backend grava a intenção de
 * qualquer forma, então a pessoa nunca perde o que o Avant tinha a dizer.
 */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { data, loading, refreshing, error, refresh, reload, mutate } = useAsyncResource(
    useCallback(() => notificationsApi.list(), []),
  );

  const sections = useMemo(() => (data ? groupByDay(data) : []), [data]);
  const unreadCount = data ? data.filter((item) => item.readAt == null).length : 0;

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

  /**
   * Otimista: o botão some na hora. Se o lote falhar, recarrega em silêncio
   * para os pontos voltarem ao estado real do servidor.
   */
  const readAll = () => {
    const now = new Date().toISOString();
    mutate((current) => current.map((item) => (item.readAt ? item : { ...item, readAt: now })));
    void notificationsApi.markAllRead().catch(() => void reload());
  };

  return (
    <Screen>
      <PageHeader
        title="Notificações"
        subtitle={data && data.length > 0 ? unreadLabel(unreadCount) : null}
        onBack={() => router.back()}
        right={
          unreadCount > 0 ? (
            <SettingsPill
              label="Ler todas"
              tone="accent"
              onPress={readAll}
              accessibilityLabel="Marcar todas as notificações como lidas"
            />
          ) : null
        }
      />

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
            <View
              className="mx-4 rounded-[24px]"
              style={{ marginTop: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
            >
              <EmptyState
                image={ONBOARDING_ART.relogio}
                title="Nada por aqui ainda"
                description="Lembretes, retomadas e descobertas sobre a sua rotina aparecem nesta tela."
                action={{ label: "Ajustar lembretes", onPress: openSettings }}
              />
            </View>
          ) : null}

          {sections.map((section, sectionIndex) => (
            <View key={section.key} style={{ marginTop: sectionIndex === 0 ? 20 : 28 }}>
              <AppText
                family="archivo"
                weight="black"
                accessibilityRole="header"
                style={{ paddingHorizontal: 22, marginBottom: 10, fontSize: 17, letterSpacing: -0.4, color: colors.text }}
              >
                {section.title}
              </AppText>

              <View
                style={{
                  marginHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  overflow: "hidden",
                }}
              >
                {section.items.map((notification, index) => (
                  <Fragment key={notification.id}>
                    {index > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
                    <NotificationRow
                      notification={notification}
                      navigable={resolveRoute(notification.data?.route) != null}
                      onPress={() => open(notification)}
                    />
                  </Fragment>
                ))}
              </View>
            </View>
          ))}

          {data.length > 0 ? (
            <SettingsGroup style={{ marginTop: 28 }}>
              <SettingsItem
                icon={BellOutlineIcon}
                title="Preferências e lembretes"
                subtitle="O que pode chegar, horário de silêncio e limite diário."
                onPress={openSettings}
              />
            </SettingsGroup>
          ) : null}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
