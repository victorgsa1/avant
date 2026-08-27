import { ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AreaProgressList } from "@/features/progress/components/AreaProgressList";
import { ConsistencyMountainCard } from "@/features/progress/components/ConsistencyMountainCard";
import { InsightsSection } from "@/features/progress/components/InsightsSection";
import { ProgressHeader } from "@/features/progress/components/ProgressHeader";
import { WeeklyConsistency } from "@/features/progress/components/WeeklyConsistency";
import { useProgressData } from "@/features/progress/hooks/useProgressData";

export default function ProgressScreen() {
  const {
    week,
    weeklyDone,
    weeklyTotal,
    consistencyPct,
    consistencyDeltaLabel,
    chartStartLabel,
    chartEndLabel,
    comebackPreviousLabel,
    comebackCurrentLabel,
    comebackRecoveries,
    bestWindowLabel,
    areas,
  } = useProgressData();

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <ProgressHeader greeting="Boa noite" name="Gabriel" />

        <WeeklyConsistency week={week} doneCount={weeklyDone} totalCount={weeklyTotal} />

        <ConsistencyMountainCard
          pct={consistencyPct}
          deltaLabel={consistencyDeltaLabel}
          startLabel={chartStartLabel}
          endLabel={chartEndLabel}
        />

        <InsightsSection
          comebackPreviousLabel={comebackPreviousLabel}
          comebackCurrentLabel={comebackCurrentLabel}
          comebackRecoveries={comebackRecoveries}
          bestWindowLabel={bestWindowLabel}
        />

        <AreaProgressList areas={areas} />
      </ScrollView>
    </Screen>
  );
}
