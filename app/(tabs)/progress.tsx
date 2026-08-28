import { RefreshControl, ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { AreaProgressList } from "@/features/progress/components/AreaProgressList";
import { ConsistencyMountainCard } from "@/features/progress/components/ConsistencyMountainCard";
import { InsightsSection } from "@/features/progress/components/InsightsSection";
import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { WeeklyConsistency } from "@/features/progress/components/WeeklyConsistency";
import { useProgressData } from "@/features/progress/hooks/useProgressData";

function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const { view, loading, refreshing, error, refresh } = useProgressData();

  const firstName = user?.name?.split(" ")[0] ?? "";

  if (loading && !view) {
    return (
      <Screen>
        <ProgressHeader greeting={greeting()} name={firstName} hasNotification={false} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        <ProgressHeader greeting={greeting()} name={firstName} hasNotification={false} />
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
        <ProgressHeader greeting={greeting()} name={firstName} hasNotification={false} />

        <WeeklyConsistency week={view.week} doneCount={view.weeklyDone} totalCount={view.weeklyTotal} />

        <ConsistencyMountainCard
          pct={view.consistencyPct}
          deltaLabel={view.consistencyDeltaLabel}
          startLabel={view.chartStartLabel}
          endLabel={view.chartEndLabel}
        />

        <InsightsSection
          comebackPreviousLabel={view.comebackPreviousLabel}
          comebackCurrentLabel={view.comebackCurrentLabel}
          comebackRecoveries={view.comebackRecoveries}
          bestWindowLabel={view.bestWindowLabel}
        />

        {view.areas.length > 0 ? <AreaProgressList areas={view.areas} /> : null}
      </ScrollView>
    </Screen>
  );
}
