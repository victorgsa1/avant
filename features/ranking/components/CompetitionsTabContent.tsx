import { ActivityIndicator, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/layout/ScreenState";
import { PlusIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { CompetitionResponse } from "@/services/http/types";
import { ClosedCompetitionRow } from "./ClosedCompetitionRow";
import { GroupCompetitionCard } from "./GroupCompetitionCard";
import { RaceCompetitionCard, type RaceParticipant } from "./RaceCompetitionCard";

/** Acima disso a lista nominal vira ruído e o card compacto lê melhor. */
const COMPACT_THRESHOLD = 5;

function daysLabel(competition: CompetitionResponse): string {
  if (competition.status === "UPCOMING") {
    return competition.daysRemaining <= 1
      ? "Começa amanhã"
      : `Começa em ${competition.daysRemaining} dias`;
  }
  if (competition.daysRemaining <= 0) return "Último dia";
  return competition.daysRemaining === 1 ? "Falta 1 dia" : `Faltam ${competition.daysRemaining} dias`;
}

function toRaceParticipants(competition: CompetitionResponse): RaceParticipant[] {
  return competition.standings.map((row) => ({
    name: row.isCurrentUser ? "Você" : row.name,
    current: row.completedCount,
    total: row.plannedCount,
    pct: Math.round(row.score),
    isYou: row.isCurrentUser,
  }));
}

function resultLabel(competition: CompetitionResponse): string {
  if (competition.status === "CANCELLED") return "Cancelada";
  if (!competition.myPosition) return "Sem participação";
  const winner = competition.standings[0];
  if (competition.myPosition === 1) return `Você venceu · ${Math.round(competition.myScore)}%`;
  return `${competition.myPosition}º lugar · ${winner ? `${winner.name} venceu` : "encerrada"}`;
}

function InviteCard({
  competition,
  busy,
  onAccept,
  onDecline,
}: {
  competition: CompetitionResponse;
  busy: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="mx-5 rounded-[26px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.emberTint, padding: 20 }}
    >
      <AppText family="manrope" weight="bold" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.emberDeep }}>
        CONVITE
      </AppText>

      <AppText
        family="archivo"
        weight="extraBold"
        style={{ marginTop: 8, fontSize: 17, letterSpacing: -0.4, color: colors.text }}
      >
        {competition.title}
      </AppText>

      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 6, fontSize: 13, lineHeight: 19, color: colors.textMuted }}
      >
        {competition.creator.name} chamou você · {competition.daysTotal} dias ·{" "}
        {competition.participantCount} de {competition.maxParticipants} dentro
      </AppText>

      <View className="flex-row" style={{ marginTop: 16, gap: 10 }}>
        <Pressable
          onPress={() => onDecline(competition.id)}
          disabled={busy}
          className="flex-1 items-center justify-center rounded-full"
          style={{
            paddingVertical: 12,
            backgroundColor: colors.surfaceSunken,
            borderWidth: 1,
            borderColor: colors.line,
            opacity: busy ? 0.5 : 1,
          }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.textMuted }}>
            Agora não
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onAccept(competition.id)}
          disabled={busy}
          className="flex-1 items-center justify-center rounded-full"
          style={{ paddingVertical: 12, backgroundColor: colors.ember, opacity: busy ? 0.5 : 1 }}
        >
          {busy ? (
            <ActivityIndicator color={colors.onEmber} />
          ) : (
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.onEmber }}>
              Entrar
            </AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

type CompetitionsTabContentProps = {
  invites: CompetitionResponse[];
  ongoing: CompetitionResponse[];
  upcoming: CompetitionResponse[];
  finished: CompetitionResponse[];
  busyId: string | null;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
};

/**
 * Competições medem CONSISTÊNCIA (aderência ao próprio plano), não volume
 * de ações — quem planeja 10 por dia não vence quem planeja 2 só por isso.
 */
export function CompetitionsTabContent({
  invites,
  ongoing,
  upcoming,
  finished,
  busyId,
  onAccept,
  onDecline,
  onOpen,
  onCreate,
}: CompetitionsTabContentProps) {
  const { colors } = useTheme();
  const sectionTitle = (label: string) => (
    <AppText
      family="archivo"
      weight="extraBold"
      style={{
        fontSize: 16,
        letterSpacing: -0.3,
        color: colors.text,
        paddingHorizontal: 24,
        paddingTop: 24,
      }}
    >
      {label}
    </AppText>
  );

  const nothing = invites.length + ongoing.length + upcoming.length + finished.length === 0;

  return (
    <>
      {invites.length > 0 ? sectionTitle("Convites") : null}
      {invites.map((competition) => (
        <View key={competition.id} style={{ marginTop: 14 }}>
          <InviteCard
            competition={competition}
            busy={busyId === competition.id}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        </View>
      ))}

      {ongoing.length > 0 ? sectionTitle("Em andamento") : null}
      {ongoing.map((competition) => (
        <View key={competition.id} style={{ marginTop: 14 }}>
          <Pressable onPress={() => onOpen(competition.id)}>
            {competition.participantCount > COMPACT_THRESHOLD ? (
              <GroupCompetitionCard
                title={competition.title}
                daysLeftLabel={daysLabel(competition)}
                avatars={competition.standings.slice(0, 5).map((row) => ({
                  initial: row.name.charAt(0).toUpperCase(),
                  isCurrentUser: row.isCurrentUser,
                }))}
                participantsLabel={`${competition.participantCount} pessoas`}
                yourRank={competition.myPosition ?? competition.participantCount}
                onPressView={() => onOpen(competition.id)}
              />
            ) : (
              <RaceCompetitionCard
                title={competition.title}
                daysLeftLabel={daysLabel(competition)}
                participants={toRaceParticipants(competition)}
                footerNote={`Consistência média · dia ${competition.daysElapsed} de ${competition.daysTotal}`}
              />
            )}
          </Pressable>
        </View>
      ))}

      {upcoming.length > 0 ? sectionTitle("Ainda vão começar") : null}
      {upcoming.map((competition) => (
        <Pressable
          key={competition.id}
          onPress={() => onOpen(competition.id)}
          className="mx-5 rounded-[22px]"
          style={{
            marginTop: 12,
            padding: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 15.5, color: colors.text }}>
            {competition.title}
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 5, fontSize: 12.5, color: colors.textMuted }}
          >
            {daysLabel(competition)} · {competition.participantCount} confirmados
          </AppText>
        </Pressable>
      ))}

      <View className="px-6" style={{ paddingTop: 22 }}>
        <Pressable
          onPress={onCreate}
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
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 14.5, letterSpacing: -0.1, color: colors.onEmber }}
          >
            Criar competição
          </AppText>
        </Pressable>
      </View>

      {nothing ? (
        <View className="px-6" style={{ paddingTop: 18 }}>
          <View
            className="rounded-[24px]"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
          >
            <EmptyState
              title="Nenhuma competição ainda"
              description="Chame um amigo para uma disputa de consistência por 7, 14 ou 30 dias."
            />
          </View>
        </View>
      ) : null}

      {finished.length > 0 ? (
        <View className="px-6" style={{ paddingTop: 26 }}>
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}
          >
            Encerradas
          </AppText>
          {finished.map((competition) => (
            <Pressable key={competition.id} onPress={() => onOpen(competition.id)}>
              <ClosedCompetitionRow
                title={competition.title}
                resultLabel={resultLabel(competition)}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );
}
