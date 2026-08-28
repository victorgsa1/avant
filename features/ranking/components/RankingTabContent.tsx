import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { RankingPeriod } from "@/services/http/types";
import { CurrentUserRankCard } from "./CurrentUserRankCard";
import { PeriodToggle } from "./PeriodToggle";
import { RankingPodium } from "./RankingPodium";
import { RankingRowsList } from "./RankingRowsList";
import type { PodiumEntry, RankRow } from "../types";

type RankingTabContentProps = {
  period: RankingPeriod;
  onChangePeriod: (period: RankingPeriod) => void;
  currentUserRank: number;
  currentUserPct: number;
  currentUserPositionsGained: number;
  podium: PodiumEntry[];
  rankRows: RankRow[];
  /** Meta curta contra quem está logo acima ("+35 XP para alcançar Lucas"). */
  nextRival: { name: string; xpDelta: number } | null;
  /** Sem amigos, o ranking é só você — mostramos o convite em vez do pódio. */
  isAlone: boolean;
  onPressAddFriends: () => void;
};

export function RankingTabContent({
  period,
  onChangePeriod,
  currentUserRank,
  currentUserPct,
  currentUserPositionsGained,
  podium,
  rankRows,
  nextRival,
  isAlone,
  onPressAddFriends,
}: RankingTabContentProps) {
  const { colors } = useTheme();

  return (
    <>
      <PeriodToggle active={period} onChange={onChangePeriod} />
      <CurrentUserRankCard rank={currentUserRank} pct={currentUserPct} positionsGained={currentUserPositionsGained} />

      {isAlone ? (
        <View className="px-6" style={{ paddingTop: 10 }}>
          <View
            className="rounded-[24px]"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
          >
            <EmptyState
              title="Seu ranking começa com amigos"
              description="Adicione alguém para comparar consistência semana a semana."
              action={{ label: "Adicionar amigos", onPress: onPressAddFriends }}
            />
          </View>
        </View>
      ) : (
        <>
          {nextRival && nextRival.xpDelta > 0 ? (
            <View className="px-6" style={{ paddingTop: 14 }}>
              <View
                className="rounded-[18px]"
                style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.emberTint }}
              >
                <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.emberDeep }}>
                  +{nextRival.xpDelta} XP para alcançar {nextRival.name.split(" ")[0]}
                </AppText>
              </View>
            </View>
          ) : null}

          <RankingPodium podium={podium} />
          {rankRows.length > 0 ? <RankingRowsList rows={rankRows} /> : null}
        </>
      )}
    </>
  );
}
