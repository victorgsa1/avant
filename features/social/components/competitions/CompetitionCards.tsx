import { ActivityIndicator, Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { RankBarsIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { buttonGlow } from "@/constants/glow";
import type { CompetitionResponse } from "@/services/http/types";
import { competitionArtFor } from "../../art";
import { companionsLabel, plural, timeLeftLabel } from "../../format";
import { SegmentedProgress } from "./SegmentedProgress";

function myStanding(competition: CompetitionResponse) {
  return competition.standings.find((row) => row.isCurrentUser) ?? null;
}

/** "Dia 4 de 7 · faltam 3 dias" — quando a competição não tem descrição. */
function timelineLabel(competition: CompetitionResponse): string {
  if (competition.status === "UPCOMING") return timeLeftLabel(competition);
  return `Dia ${Math.max(competition.daysElapsed, 1)} de ${competition.daysTotal} · ${timeLeftLabel(competition).toLowerCase()}`;
}

type CardProps = {
  competition: CompetitionResponse;
  onOpen: () => void;
};

/**
 * A competição em destaque, na folha clara: quem está junto, o seu
 * progresso no próprio plano e a sua posição. Uma por vez — a mais recente.
 *
 * O progresso é de AÇÕES do seu plano (feitas de planejadas), não de dias:
 * a competição mede aderência ao próprio plano.
 */
export function FeaturedCompetitionCard({ competition, onOpen }: CardProps) {
  const { colors } = useTheme();
  const me = myStanding(competition);
  const planned = me?.plannedCount ?? 0;
  const completed = me?.completedCount ?? 0;
  // Sem nenhum dia registrado o placar é só ordem alfabética — não é posição.
  const position = me && me.daysScored > 0 ? competition.myPosition : null;

  return (
    <View className="mx-5 overflow-hidden rounded-[28px]" style={{ backgroundColor: colors.paper, padding: 20 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 12, right: 6, width: 140, height: 140 }}>
        <Image
          source={competitionArtFor(competition.title, competition.description)}
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="flex-row items-center" style={{ gap: 9 }}>
        <View className="rounded-full" style={{ width: 9, height: 9, backgroundColor: colors.ember }} />
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 14, color: colors.onPaper }}>
          {companionsLabel(competition.participantCount)}
        </AppText>
      </View>

      <View style={{ marginTop: 14, paddingRight: 118 }}>
        <AppText
          family="archivo"
          weight="black"
          numberOfLines={3}
          style={{ fontSize: 34, lineHeight: 37, letterSpacing: -1.4, color: colors.onPaper }}
        >
          {competition.title}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={2}
          style={{ marginTop: 6, fontSize: 15, lineHeight: 21, color: colors.onPaperMuted }}
        >
          {competition.description?.trim() || timelineLabel(competition)}
        </AppText>
      </View>

      <View className="flex-row items-baseline justify-between" style={{ marginTop: 22 }}>
        <AppText family="manrope" weight="medium" style={{ fontSize: 14, color: colors.onPaperMuted }}>
          Seu progresso
        </AppText>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.onPaper }}>
          {planned > 0 ? `${completed} de ${plural(planned, "ação", "ações")}` : "Começa a contar hoje"}
        </AppText>
      </View>
      <View
        style={{ marginTop: 10 }}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Seu progresso na competição"
        accessibilityValue={{ min: 0, max: Math.max(planned, 1), now: completed }}
      >
        <SegmentedProgress done={completed} total={planned > 0 ? planned : competition.daysTotal} />
      </View>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={
          position ? `Sua posição: ${position}º de ${competition.participantCount}. Ver placar` : "Ver placar"
        }
        className="flex-row items-center rounded-[18px]"
        style={{ marginTop: 16, gap: 14, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.paperSunken }}
      >
        <RankBarsIcon size={24} color={colors.onPaper} />
        <View style={{ flex: 1 }}>
          <AppText family="manrope" weight="medium" style={{ fontSize: 13, color: colors.onPaperMuted }}>
            Sua posição
          </AppText>
          <AppText family="archivo" weight="black" style={{ marginTop: 1, fontSize: 18, letterSpacing: -0.4, color: colors.onPaper }}>
            {position ? `${position}º de ${competition.participantCount}` : "Sem placar ainda"}
          </AppText>
        </View>
        <ChevronIcon size={14} color={colors.onPaper} />
      </Pressable>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        className="flex-row items-center justify-center rounded-full"
        style={{
          marginTop: 14,
          gap: 12,
          height: 56,
          backgroundColor: colors.ember,
          boxShadow: buttonGlow(`0 12px 26px ${colors.ember}38`),
        }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, color: colors.onEmber }}>
          Ver competição
        </AppText>
        <ChevronIcon size={13} color={colors.onEmber} />
      </Pressable>
    </View>
  );
}

/** As demais competições: linha compacta com o desenho num quadrado de papel. */
export function CompetitionRowCard({ competition, onOpen }: CardProps) {
  const { colors } = useTheme();
  const me = myStanding(competition);
  const detail =
    competition.status === "UPCOMING"
      ? timeLeftLabel(competition)
      : me && me.daysScored > 0
        ? `${me.completedCount} de ${plural(me.plannedCount, "ação", "ações")} · ${competition.myPosition}º lugar`
        : timelineLabel(competition);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${competition.title}. ${companionsLabel(competition.participantCount)}. ${detail}`}
      className="mx-5 flex-row items-center rounded-[22px]"
      style={{ gap: 16, padding: 14, paddingRight: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
    >
      <View
        className="items-center justify-center rounded-[16px]"
        style={{ width: 78, height: 78, backgroundColor: colors.paper }}
      >
        <Image
          source={competitionArtFor(competition.title, competition.description)}
          resizeMode="contain"
          style={{ width: 62, height: 62 }}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="extraBold" numberOfLines={2} style={{ fontSize: 17, letterSpacing: -0.3, color: colors.text }}>
          {competition.title}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ marginTop: 3, fontSize: 14, color: colors.textMuted }}>
          {companionsLabel(competition.participantCount)}
        </AppText>
        <AppText family="manrope" weight="medium" numberOfLines={1} style={{ marginTop: 3, fontSize: 14, color: colors.textMuted }}>
          {detail}
        </AppText>
      </View>

      <ChevronIcon size={13} color={colors.textMuted} />
    </Pressable>
  );
}

type InviteCardProps = {
  competition: CompetitionResponse;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

/** Convite recebido: responder aqui mesmo, sem abrir a competição. */
export function CompetitionInviteCard({ competition, busy, onAccept, onDecline }: InviteCardProps) {
  const { colors } = useTheme();

  return (
    <View
      className="mx-5 rounded-[24px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1.3, borderColor: colors.ember, padding: 18 }}
    >
      <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.emberInk }}>
        Convite
      </AppText>
      <AppText family="archivo" weight="extraBold" style={{ marginTop: 8, fontSize: 18, letterSpacing: -0.4, color: colors.text }}>
        {competition.title}
      </AppText>
      <AppText family="manrope" weight="medium" style={{ marginTop: 5, fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}>
        {competition.creator.name} chamou você · {competition.daysTotal} dias · {competition.participantCount} de{" "}
        {competition.maxParticipants} dentro
      </AppText>

      <View className="flex-row" style={{ marginTop: 16, gap: 10 }}>
        <Pressable
          onPress={onDecline}
          disabled={busy}
          accessibilityRole="button"
          className="flex-1 items-center justify-center rounded-full"
          style={{ height: 46, borderWidth: 1.3, borderColor: colors.lineStrong, opacity: busy ? 0.5 : 1 }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.textMuted }}>
            Agora não
          </AppText>
        </Pressable>
        <Pressable
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          className="flex-1 items-center justify-center rounded-full"
          style={{ height: 46, backgroundColor: colors.ember, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? (
            <ActivityIndicator color={colors.onEmber} />
          ) : (
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.onEmber }}>
              Entrar
            </AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}
