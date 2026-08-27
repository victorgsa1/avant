import { useState } from "react";
import { ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { CompetitionsTabContent } from "@/features/ranking/components/CompetitionsTabContent";
import { FriendsTabContent } from "@/features/ranking/components/FriendsTabContent";
import { RankingTabContent } from "@/features/ranking/components/RankingTabContent";
import { SocialHeader } from "@/features/ranking/components/SocialHeader";
import { SocialTabs } from "@/features/ranking/components/SocialTabs";
import { useRankingData } from "@/features/ranking/hooks/useRankingData";
import type { SocialTab } from "@/features/ranking/types";

const SUBTITLES: Record<SocialTab, string> = {
  ranking: "Veja como sua consistência se compara esta semana.",
  amigos: "Quem caminha junto com você.",
  competicoes: "Desafios que vocês estão fazendo juntos.",
};

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<SocialTab>("ranking");
  const { currentUserRank, currentUserPct, currentUserPositionsGained, podium, rankRows, friends, groupAvatars } =
    useRankingData();

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <SocialHeader subtitle={SUBTITLES[activeTab]} />
        <SocialTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "ranking" ? (
          <RankingTabContent
            currentUserRank={currentUserRank}
            currentUserPct={currentUserPct}
            currentUserPositionsGained={currentUserPositionsGained}
            podium={podium}
            rankRows={rankRows}
          />
        ) : null}

        {activeTab === "amigos" ? <FriendsTabContent friends={friends} /> : null}

        {activeTab === "competicoes" ? (
          <CompetitionsTabContent
            raceTitle="7 dias de foco"
            raceDaysLeftLabel="2 dias restantes"
            raceParticipants={[
              { name: "Gabriel", current: 18, total: 20, pct: 90, isYou: true },
              { name: "João", current: 28, total: 35, pct: 80 },
            ]}
            raceFooterNote="João retomou hoje"
            groupTitle="Desafio de consistência de agosto"
            groupDaysLeftLabel="5 dias restantes"
            groupAvatars={groupAvatars}
            groupParticipantsLabel="4 participantes"
            groupYourRank={2}
            closedTitle="14 dias de leitura"
            closedResultLabel="Você venceu · 88%"
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
