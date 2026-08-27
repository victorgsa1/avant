import { View } from "react-native";
import { BestWindowInsightCard } from "./BestWindowInsightCard";
import { ComebackInsightCard } from "./ComebackInsightCard";

type InsightsSectionProps = {
  comebackPreviousLabel: string;
  comebackCurrentLabel: string;
  comebackRecoveries: number;
  bestWindowLabel: string;
};

export function InsightsSection({
  comebackPreviousLabel,
  comebackCurrentLabel,
  comebackRecoveries,
  bestWindowLabel,
}: InsightsSectionProps) {
  return (
    <View className="px-5 pt-[34px]" style={{ gap: 12 }}>
      <ComebackInsightCard
        previousLabel={comebackPreviousLabel}
        currentLabel={comebackCurrentLabel}
        recoveriesCount={comebackRecoveries}
      />
      <BestWindowInsightCard windowLabel={bestWindowLabel} />
    </View>
  );
}
