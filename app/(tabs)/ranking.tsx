import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { CompetitionsTabContent } from "@/features/ranking/components/CompetitionsTabContent";
import { FriendsTabContent } from "@/features/ranking/components/FriendsTabContent";
import { RankingTabContent } from "@/features/ranking/components/RankingTabContent";
import { SocialHeader } from "@/features/ranking/components/SocialHeader";
import { SocialTabs } from "@/features/ranking/components/SocialTabs";
import { UsernameSetupModal } from "@/features/ranking/components/UsernameSetupModal";
import { useCompetitions } from "@/features/ranking/hooks/useCompetitions";
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

  const competitions = useCompetitions();

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh();
              void competitions.refresh();
            }}
            tintColor={colors.ember}
          />
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
          <>
            <CompetitionsTabContent
              invites={competitions.data?.invites ?? []}
              ongoing={competitions.data?.ongoing ?? []}
              upcoming={competitions.data?.upcoming ?? []}
              finished={competitions.data?.finished ?? []}
              busyId={competitions.busyId}
              onAccept={competitions.accept}
              onDecline={competitions.decline}
              onOpen={(id) => router.push(`/competition/${id}`)}
              onCreate={() => router.push("/new-competition")}
            />

            {competitions.actionError ? (
              <AppText
                family="manrope"
                weight="medium"
                style={{
                  marginTop: 14,
                  paddingHorizontal: 26,
                  fontSize: 12.5,
                  textAlign: "center",
                  color: colors.danger,
                }}
              >
                {competitions.actionError}
              </AppText>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
