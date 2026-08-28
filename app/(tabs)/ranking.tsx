import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { FriendsTabContent } from "@/features/ranking/components/FriendsTabContent";
import { RankingTabContent } from "@/features/ranking/components/RankingTabContent";
import { SocialHeader } from "@/features/ranking/components/SocialHeader";
import { SocialTabs } from "@/features/ranking/components/SocialTabs";
import { UsernameSetupModal } from "@/features/ranking/components/UsernameSetupModal";
import { useRankingData } from "@/features/ranking/hooks/useRankingData";
import type { SocialTab } from "@/features/ranking/types";
import { uiPreferences } from "@/services/storage/preferencesStorage";

const SUBTITLES: Record<SocialTab, string> = {
  ranking: "Veja como sua consistência se compara esta semana.",
  amigos: "Quem caminha junto com você.",
  competicoes: "Desafios que vocês estão fazendo juntos.",
};

export default function RankingScreen() {
  const { colors } = useTheme();
  const { user, refreshUser } = useSession();
  const [activeTab, setActiveTab] = useState<SocialTab>("ranking");
  const [askUsername, setAskUsername] = useState(false);

  const {
    view,
    loading,
    refreshing,
    error,
    refresh,
    period,
    setPeriod,
    acceptRequest,
    declineRequest,
    removeFriend,
    actionError,
    busy,
  } = useRankingData();

  // Primeira visita ao social: confirmar o @usuário público.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void uiPreferences.hasConfirmedUsername(user.id).then((confirmed) => {
      if (!cancelled && !confirmed) setAskUsername(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onUsernameDone = useCallback(async () => {
    setAskUsername(false);
    if (user) await uiPreferences.markUsernameConfirmed(user.id);
    await refreshUser();
    await refresh();
  }, [refresh, refreshUser, user]);

  if (loading && !view) {
    return (
      <Screen>
        <SocialHeader subtitle={SUBTITLES[activeTab]} hasNotification={false} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        <SocialHeader subtitle={SUBTITLES[activeTab]} hasNotification={false} />
        <ScreenError message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  if (!view) return null;

  return (
    <Screen>
      <UsernameSetupModal
        visible={askUsername}
        currentUsername={user?.username ?? ""}
        onDone={() => void onUsernameDone()}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.ember} />
        }
      >
        <SocialHeader subtitle={SUBTITLES[activeTab]} hasNotification={view.incomingRequests.length > 0} />
        <SocialTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "ranking" ? (
          <RankingTabContent
            period={period}
            onChangePeriod={setPeriod}
            currentUserRank={view.currentUserRank}
            currentUserPct={view.currentUserPct}
            currentUserPositionsGained={view.currentUserPositionsGained}
            podium={view.podium}
            rankRows={view.rankRows}
            nextRival={view.nextRival}
            isAlone={view.totalParticipants <= 1}
            onPressAddFriends={() => setActiveTab("amigos")}
          />
        ) : null}

        {activeTab === "amigos" ? (
          <FriendsTabContent
            friends={view.rawFriends}
            incoming={view.incomingRequests}
            outgoing={view.outgoingRequests}
            busy={busy}
            actionError={actionError}
            onAccept={(id) => void acceptRequest(id)}
            onDecline={(id) => void declineRequest(id)}
            onRemove={(id) => void removeFriend(id)}
            onChanged={() => void refresh()}
          />
        ) : null}

        {activeTab === "competicoes" ? (
          <View className="px-6" style={{ paddingTop: 30 }}>
            <View
              className="rounded-[24px]"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
            >
              <EmptyState
                title="Competições chegam em breve"
                description="Por enquanto, o ranking semanal já mostra quem está mais consistente."
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
