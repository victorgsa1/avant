import { CurrentUserRankCard } from "./CurrentUserRankCard";
import { PeriodToggle } from "./PeriodToggle";
import { RankingPodium } from "./RankingPodium";
import { RankingRowsList } from "./RankingRowsList";
import type { PodiumEntry, RankRow } from "../types";

type RankingTabContentProps = {
  currentUserRank: number;
  currentUserPct: number;
  currentUserPositionsGained: number;
  podium: PodiumEntry[];
  rankRows: RankRow[];
};

export function RankingTabContent({
  currentUserRank,
  currentUserPct,
  currentUserPositionsGained,
  podium,
  rankRows,
}: RankingTabContentProps) {
  return (
    <>
      <PeriodToggle />
      <CurrentUserRankCard rank={currentUserRank} pct={currentUserPct} positionsGained={currentUserPositionsGained} />
      <RankingPodium podium={podium} />
      <RankingRowsList rows={rankRows} />
    </>
  );
}
