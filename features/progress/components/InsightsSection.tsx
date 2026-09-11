import { View } from "react-native";
import { BestWindowInsightCard } from "./BestWindowInsightCard";
import { ComebackInsightCard } from "./ComebackInsightCard";

type InsightsSectionProps = {
  comeback: {
    recoveries: number;
    currentLabel: string;
    previousLabel: string | null;
    improving: boolean;
  };
  bestWindow: { title: string; phrase: string; share: number } | null;
};

export function InsightsSection({ comeback, bestWindow }: InsightsSectionProps) {
  return (
    <View className="px-5 pt-[34px]" style={{ gap: 12 }}>
      <ComebackInsightCard
        recoveries={comeback.recoveries}
        currentLabel={comeback.currentLabel}
        previousLabel={comeback.previousLabel}
        improving={comeback.improving}
      />
      <BestWindowInsightCard bestWindow={bestWindow} />
    </View>
  );
}
