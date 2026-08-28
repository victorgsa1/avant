import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { FriendsRankingCard } from "@/features/home/components/FriendsRankingCard";
import { HeroLevelRow } from "@/features/home/components/HeroLevelRow";
import { HomeTopBar } from "@/features/home/components/HomeTopBar";
import { NextActionCard } from "@/features/home/components/NextActionCard";
import { TodayTaskList } from "@/features/home/components/TodayTaskList";
import { useHomeData } from "@/features/home/hooks/useHomeData";

export default function HojeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const { view, loading, refreshing, error, refresh, toggleTask, actionError } = useHomeData();

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatarInitial = (user?.name ?? "?").trim().charAt(0).toUpperCase();
  const nextAction = view?.nextAction ?? null;

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
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.ember} />
        }
      >
        <HomeTopBar
          avatarInitial={avatarInitial}
          hasNotification={view.unreadNotifications > 0}
          onPressBell={() => router.push("/chat")}
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

        {/* Linguagem nunca punitiva: uma retomada é informação, não castigo. */}
        {view.recovery ? (
          <View className="px-5" style={{ marginTop: 22 }}>
            <View
              className="rounded-[22px]"
              style={{ padding: 16, backgroundColor: colors.emberWash }}
            >
              <AppText
                family="manrope"
                weight="semiBold"
                style={{ fontSize: 13, lineHeight: 19.5, color: colors.emberDeep }}
              >
                {view.recovery.missedDays > 1
                  ? "Alguns dias não aconteceram. Vamos voltar hoje, com o mínimo."
                  : "Ontem não aconteceu. Vamos voltar hoje."}
              </AppText>
            </View>
          </View>
        ) : null}

        {nextAction ? (
          <NextActionCard
            windowLabel={nextAction.windowLabel}
            title={nextAction.title}
            minutes={0}
            xp={nextAction.xp}
            insight={view.insight?.body}
            onPressStart={() => toggleTask(nextAction.id)}
          />
        ) : (
          <View className="px-5" style={{ marginTop: 26 }}>
            <View
              className="rounded-[26px]"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
            >
              <EmptyState
                title={
                  view.totalTasks > 0 ? "Tudo feito por hoje." : "Nenhuma ação planejada para hoje."
                }
                description={
                  view.totalTasks > 0
                    ? "Amanhã tem mais. Descansar também faz parte."
                    : "Crie seu primeiro movimento para o Avant montar o dia."
                }
              />
            </View>
          </View>
        )}

        {view.tasks.length > 0 ? (
          <TodayTaskList
            tasks={view.tasks}
            doneCount={view.doneCount}
            totalTasks={view.totalTasks}
            onToggle={toggleTask}
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
