import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { useTabBarClearance } from "@/components/navigation/tabBar";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { HomeTopBar } from "@/features/home/components/HomeTopBar";
import { AdjustmentsTimeline } from "@/features/progress/components/AdjustmentsTimeline";
import { FollowUpCard } from "@/features/progress/components/FollowUpCard";
import { HistoryCalendar } from "@/features/progress/components/HistoryCalendar";
import { MonthTotals } from "@/features/progress/components/MonthTotals";
import { MonthWeeksChart } from "@/features/progress/components/MonthWeeksChart";
import { NoticedCard } from "@/features/progress/components/NoticedCard";
import { OptionSheet } from "@/features/progress/components/OptionSheet";
import { ProgressTitle } from "@/features/progress/components/ProgressTitle";
import { RoutineHabits } from "@/features/progress/components/RoutineHabits";
import { useProgressMonth } from "@/features/progress/hooks/useProgressMonth";

export default function ProgressScreen() {
  const { colors } = useTheme();
  const bottomClearance = useTabBarClearance();
  const { user } = useSession();
  const {
    view,
    loading,
    refreshing,
    error,
    refresh,
    refreshWithReview,
    selectMonth,
    switchingMonth,
    respond,
    busyId,
    actionError,
    archiveInsight,
  } = useProgressMonth();

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const avatarInitial = (user?.name ?? "?").trim().charAt(0).toUpperCase();
  const topBar = (
    <HomeTopBar
      avatarInitial={avatarInitial}
      hasNotification={false}
      onPressBell={() => router.push("/notifications")}
    />
  );

  if (loading && !view) {
    return (
      <Screen>
        {topBar}
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        {topBar}
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
        contentContainerStyle={{ paddingBottom: bottomClearance }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshWithReview()}
            tintColor={colors.ember}
          />
        }
      >
        {topBar}

        <ProgressTitle
          monthName={view.monthName}
          year={view.year}
          loading={switchingMonth}
          onPressMonth={() => setMonthPickerOpen(true)}
        />

        <MonthTotals done={view.totals.done} planned={view.totals.planned} pct={view.totals.pct} />

        <MonthWeeksChart weeks={view.weeks} />

        {view.noticed ? (
          <NoticedCard
            noticed={view.noticed}
            busy={busyId === view.noticed.id}
            onApply={(id) => respond(id, "apply")}
            onDismiss={(id) => respond(id, "dismiss")}
            onArchiveInsight={archiveInsight}
          />
        ) : null}

        {actionError ? (
          <AppText
            family="manrope"
            weight="medium"
            className="px-6"
            style={{ marginTop: 10, fontSize: 12.5, color: colors.danger }}
          >
            {actionError}
          </AppText>
        ) : null}

        {view.followUp ? <FollowUpCard followUp={view.followUp} /> : null}

        <RoutineHabits
          key={`habits-${view.month}`}
          habits={view.habits}
          onSeeAll={() => router.push("/settings/habits")}
        />

        <HistoryCalendar
          key={`calendar-${view.month}`}
          month={view.month}
          monthName={view.monthName}
          today={view.today}
          calendar={view.calendar}
          defaultHabitId={view.primaryHabitId}
        />

        {view.timeline.length > 0 ? <AdjustmentsTimeline items={view.timeline} /> : null}
      </ScrollView>

      <OptionSheet
        visible={monthPickerOpen}
        title="Escolher mês"
        options={view.months}
        selected={view.month}
        onSelect={selectMonth}
        onClose={() => setMonthPickerOpen(false)}
      />
    </Screen>
  );
}
