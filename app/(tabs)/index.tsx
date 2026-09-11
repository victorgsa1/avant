import { Alert, Platform, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { AdaptationCard } from "@/features/home/components/AdaptationCard";
import { FriendsRankingCard } from "@/features/home/components/FriendsRankingCard";
import { HeroLevelRow } from "@/features/home/components/HeroLevelRow";
import { HomeTopBar } from "@/features/home/components/HomeTopBar";
import { NextActionCard } from "@/features/home/components/NextActionCard";
import { PrimaryDoneCard } from "@/features/home/components/PrimaryDoneCard";
import { TodayTaskList } from "@/features/home/components/TodayTaskList";
import { useHomeData } from "@/features/home/hooks/useHomeData";

function StatusCard({ title, description }: { title: string; description?: string }) {
  const { colors } = useTheme();
  return (
    <View className="px-5" style={{ marginTop: 26 }}>
      <View
        className="rounded-[26px]"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
      >
        <EmptyState title={title} description={description} />
      </View>
    </View>
  );
}

export default function HojeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const {
    view,
    loading,
    refreshing,
    error,
    refresh,
    refreshWithEngine,
    toggleTask,
    skipTask,
    respondToAdaptation,
    adaptationBusyId,
    actionError,
  } = useHomeData();

  /**
   * Pular custa uma confirmação de propósito: é uma decisão sobre o
   * próprio dia, não um toque acidental na lista.
   */
  const confirmSkip = (id: string) => {
    if (Platform.OS === "web") {
      skipTask(id);
      return;
    }
    Alert.alert("Pular hoje?", "Amanhã ela volta normalmente.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Pular hoje", style: "destructive", onPress: () => skipTask(id) },
    ]);
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatarInitial = (user?.name ?? "?").trim().charAt(0).toUpperCase();
  const primary = view?.primaryAction ?? null;

  if (loading && !view) {
    return (
      <Screen>
        <HomeTopBar avatarInitial={avatarInitial} hasNotification={false} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        <HomeTopBar avatarInitial={avatarInitial} hasNotification={false} />
        <ScreenError message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  if (!view) return null;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshWithEngine()}
            tintColor={colors.ember}
          />
        }
      >
        <HomeTopBar
          avatarInitial={avatarInitial}
          hasNotification={view.unreadNotifications > 0}
          onPressBell={() => router.push("/notifications")}
        />

        <HeroLevelRow
          level={view.level}
          nextLevel={view.nextLevel}
          progress={view.progress}
          greeting={view.greeting}
          name={firstName}
          currentXP={view.currentXP}
          remainingXP={view.remainingXP}
          streakDays={view.streakDays}
        />

        {/* O motor adaptativo aparece aqui e em nenhum outro lugar. */}
        {view.adaptations.map((proposal) => (
          <AdaptationCard
            key={proposal.id}
            proposal={proposal}
            busy={adaptationBusyId === proposal.id}
            onApply={(id) => respondToAdaptation(id, "apply")}
            onDismiss={(id) => respondToAdaptation(id, "dismiss")}
          />
        ))}

        {/* Linguagem nunca punitiva: uma retomada é informação, não castigo. */}
        {view.recovery ? (
          <View className="px-5" style={{ marginTop: 22 }}>
            <View className="rounded-[22px]" style={{ padding: 16, backgroundColor: colors.emberWash }}>
              <AppText
                family="manrope"
                weight="semiBold"
                style={{ fontSize: 13, lineHeight: 19.5, color: colors.emberDeep }}
              >
                {view.recovery.missedDays > 1
                  ? "Alguns dias ficaram para trás. Hoje vale o mínimo."
                  : "Ontem não aconteceu. Hoje é um bom dia para voltar."}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* A principal: uma por dia, concluída com foto + localização. */}
        {primary && primary.status === "PLANNED" ? (
          <NextActionCard
            label="Principal de hoje"
            windowLabel={primary.windowLabel}
            title={primary.title}
            detail={primary.variantTitle}
            minutes={primary.minutes}
            xp={primary.xp}
            onPressStart={() =>
              router.push({
                pathname: "/complete-action/[id]",
                params: {
                  id: primary.id,
                  title: primary.title,
                  minutes: primary.minutes !== null ? String(primary.minutes) : "",
                },
              })
            }
            onPressAdjust={() => router.push("/settings/habits")}
          />
        ) : primary && primary.status === "COMPLETED" ? (
          <PrimaryDoneCard
            title={primary.title}
            completedAt={primary.completedAt}
            xp={primary.awardedXp}
            streakDays={view.streakDays}
          />
        ) : primary ? (
          <StatusCard title="Principal pulada hoje" description="Amanhã ela volta." />
        ) : (
          <StatusCard title="Dia de descanso" description="A principal volta amanhã." />
        )}

        {view.tasks.length > 0 ? (
          <TodayTaskList
            title="Complementares"
            tasks={view.tasks}
            doneCount={view.doneCount}
            totalTasks={view.totalTasks}
            onToggle={toggleTask}
            onSkip={confirmSkip}
          />
        ) : null}

        {actionError ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{
              marginTop: 12,
              paddingHorizontal: 26,
              fontSize: 12.5,
              textAlign: "center",
              color: colors.danger,
            }}
          >
            {actionError}
          </AppText>
        ) : null}

        {view.ranking.length > 1 ? (
          <FriendsRankingCard
            ranking={view.ranking}
            gapXP={view.gapXP}
            rivalName={view.rivalName ?? ""}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
