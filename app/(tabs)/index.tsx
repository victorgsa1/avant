import { ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { FriendsRankingCard } from "@/features/home/components/FriendsRankingCard";
import { HeroLevelRow } from "@/features/home/components/HeroLevelRow";
import { HomeTopBar } from "@/features/home/components/HomeTopBar";
import { NextActionCard } from "@/features/home/components/NextActionCard";
import { TodayTaskList } from "@/features/home/components/TodayTaskList";
import { useHomeData } from "@/features/home/hooks/useHomeData";

export default function HojeScreen() {
  const {
    level,
    nextLevel,
    streakDays,
    tasks,
    toggleTask,
    doneCount,
    totalTasks,
    currentXP,
    remainingXP,
    progress,
    gapXP,
    ranking,
  } = useHomeData();

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HomeTopBar avatarInitial="G" />

        <HeroLevelRow
          level={level}
          nextLevel={nextLevel}
          progress={progress}
          greeting="Boa noite"
          name="Gabriel"
          currentXP={currentXP}
          remainingXP={remainingXP}
          streakDays={streakDays}
        />

        <NextActionCard
          windowLabel="até 21:00"
          title="Treino"
          minutes={20}
          xp={30}
          insight="Você costuma render mais quando começa antes das 20h."
        />

        <TodayTaskList tasks={tasks} doneCount={doneCount} totalTasks={totalTasks} onToggle={toggleTask} />

        <FriendsRankingCard ranking={ranking} gapXP={gapXP} rivalName="Lucas" />
      </ScrollView>
    </Screen>
  );
}
