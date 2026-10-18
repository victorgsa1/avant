import { RefreshControl, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import { PublicProfileHeader } from "@/features/social/components/profile/PublicProfileHeader";
import { RelationPanel } from "@/features/social/components/profile/RelationPanel";
import { ActionError } from "@/features/social/components/TabState";
import { useUserProfile } from "@/features/social/hooks/useUserProfile";

/**
 * Volta para quem abriu. Num deep link o Expo Router já põe as abas embaixo;
 * sem nada atrás, cai na lista de pedidos.
 */
function leave() {
  if (router.canGoBack()) router.back();
  else router.replace("/friend-requests");
}

/**
 * Perfil de outra pessoa — o que dá para ver antes de serem amigos — com o
 * pedido de amizade respondível dali. `avant://user/<id>` também abre aqui.
 */
export default function UserProfileScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useUserProfile(id ?? "");

  // Sem o pedido, o perfil pode sair do alcance: recusou ou cancelou, volta.
  const removeAndLeave = async (requestId: string) => {
    if (await profile.removeRequest(requestId)) leave();
  };

  return (
    <Screen>
      <PageHeader title="Perfil" onBack={leave} />

      {profile.loading && !profile.data ? <ScreenLoading /> : null}
      {profile.error && !profile.data ? (
        <ScreenError message={profile.error} onRetry={() => void profile.refresh()} />
      ) : null}

      {profile.data ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={profile.refreshing} onRefresh={() => void profile.refresh()} tintColor={colors.ember} />
          }
        >
          <PublicProfileHeader profile={profile.data} />

          <RelationPanel
            profile={profile.data}
            busy={profile.busy}
            onAccept={(requestId) => void profile.accept(requestId)}
            onRemoveRequest={(requestId) => void removeAndLeave(requestId)}
            onAdd={(username) => void profile.sendRequest(username)}
          />

          <ActionError message={profile.actionError} />
        </ScrollView>
      ) : null}
    </Screen>
  );
}
