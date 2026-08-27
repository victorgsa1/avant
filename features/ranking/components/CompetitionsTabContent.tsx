import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { PlusIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ClosedCompetitionRow } from "./ClosedCompetitionRow";
import { GroupCompetitionCard } from "./GroupCompetitionCard";
import { RaceCompetitionCard, type RaceParticipant } from "./RaceCompetitionCard";
import type { GroupAvatar } from "../types";

type CompetitionsTabContentProps = {
  raceTitle: string;
  raceDaysLeftLabel: string;
  raceParticipants: RaceParticipant[];
  raceFooterNote: string;
  groupTitle: string;
  groupDaysLeftLabel: string;
  groupAvatars: GroupAvatar[];
  groupParticipantsLabel: string;
  groupYourRank: number;
  closedTitle: string;
  closedResultLabel: string;
  onPressCreateCompetition?: () => void;
  onPressViewGroupCompetition?: () => void;
};

export function CompetitionsTabContent({
  raceTitle,
  raceDaysLeftLabel,
  raceParticipants,
  raceFooterNote,
  groupTitle,
  groupDaysLeftLabel,
  groupAvatars,
  groupParticipantsLabel,
  groupYourRank,
  closedTitle,
  closedResultLabel,
  onPressCreateCompetition,
  onPressViewGroupCompetition,
}: CompetitionsTabContentProps) {
  const { colors } = useTheme();
  return (
    <>
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text, paddingHorizontal: 24, paddingTop: 24 }}
      >
        Em andamento
      </AppText>

      <View style={{ marginTop: 14 }}>
        <RaceCompetitionCard
          title={raceTitle}
          daysLeftLabel={raceDaysLeftLabel}
          participants={raceParticipants}
          footerNote={raceFooterNote}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <GroupCompetitionCard
          title={groupTitle}
          daysLeftLabel={groupDaysLeftLabel}
          avatars={groupAvatars}
          participantsLabel={groupParticipantsLabel}
          yourRank={groupYourRank}
          onPressView={onPressViewGroupCompetition}
        />
      </View>

      <View className="px-6" style={{ paddingTop: 22 }}>
        <Pressable
          onPress={onPressCreateCompetition}
          className="flex-row items-center justify-center rounded-full"
          style={{
            gap: 9,
            backgroundColor: colors.ember,
            paddingVertical: 16,
            paddingHorizontal: 22,
            boxShadow: `0 12px 26px ${colors.ember}38`,
          }}
        >
          <PlusIcon size={16} />
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 14.5, letterSpacing: -0.1, color: colors.onEmber }}>
            Criar competição
          </AppText>
        </Pressable>
      </View>

      <View className="px-6" style={{ paddingTop: 26 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Encerradas
        </AppText>
        <ClosedCompetitionRow title={closedTitle} resultLabel={closedResultLabel} />
      </View>
    </>
  );
}
