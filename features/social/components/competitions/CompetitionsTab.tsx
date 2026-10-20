import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon, PlusIcon } from "@/components/ui/icons";
import { LinkIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { CompetitionResponse } from "@/services/http/types";
import { SOCIAL_ART } from "../../art";
import { NavRow } from "../NavRow";
import { SocialSectionTitle } from "../SocialSectionTitle";
import { ActionError, TabError, TabLoading } from "../TabState";
import { CompetitionInviteCard, CompetitionRowCard, FeaturedCompetitionCard } from "./CompetitionCards";

function CreatePill({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Criar competição"
      hitSlop={6}
      className="flex-row items-center rounded-full"
      style={{ gap: 7, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1.3, borderColor: colors.ember }}
    >
      <PlusIcon size={14} color={colors.ember} />
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 14.5, color: colors.ember }}>
        Criar
      </AppText>
    </Pressable>
  );
}

function EmptyCompetitions({ onCreate }: { onCreate: () => void }) {
  const { colors } = useTheme();
  return (
    <View className="mx-5 overflow-hidden rounded-[28px]" style={{ backgroundColor: colors.paper, padding: 22 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 14, right: 4, width: 132, height: 110 }}>
        <Image source={SOCIAL_ART.jornada} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
      </View>
      <View style={{ paddingRight: 118 }}>
        <AppText family="archivo" weight="black" style={{ fontSize: 26, lineHeight: 29, letterSpacing: -1, color: colors.onPaper }}>
          Nenhuma competição agora
        </AppText>
      </View>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 10, fontSize: 14.5, lineHeight: 21, color: colors.onPaperMuted }}
      >
        Chame amigos para 7, 14 ou 30 dias. Ganha quem segue melhor o próprio plano, não quem faz mais.
      </AppText>
      <Pressable
        onPress={onCreate}
        accessibilityRole="button"
        className="flex-row items-center justify-center rounded-full"
        style={{ marginTop: 18, gap: 10, height: 54, backgroundColor: colors.ember }}
      >
        <PlusIcon size={15} color={colors.onEmber} />
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 15.5, color: colors.onEmber }}>
          Criar competição
        </AppText>
      </Pressable>
    </View>
  );
}

type CompetitionsTabProps = {
  invites: CompetitionResponse[];
  ongoing: CompetitionResponse[];
  upcoming: CompetitionResponse[];
  finishedCount: number;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  busyId: string | null;
  onRetry: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onJoinWithCode: () => void;
  onOpenFinished: () => void;
};

/**
 * A aba Competições. Competições medem CONSISTÊNCIA (aderência ao próprio
 * plano), não volume — quem planeja 10 por dia não vence quem planeja 2 só
 * por isso.
 */
export function CompetitionsTab({
  invites,
  ongoing,
  upcoming,
  finishedCount,
  loading,
  error,
  actionError,
  busyId,
  onRetry,
  onAccept,
  onDecline,
  onOpen,
  onCreate,
  onJoinWithCode,
  onOpenFinished,
}: CompetitionsTabProps) {
  const { colors } = useTheme();
  const nothing = invites.length + ongoing.length + upcoming.length + finishedCount === 0;

  if (loading && nothing) return <TabLoading />;
  if (error && nothing) return <TabError message={error} onRetry={onRetry} />;

  const [featured, ...otherOngoing] = ongoing;

  return (
    <View style={{ paddingTop: 22 }}>
      {invites.length > 0 ? (
        <View style={{ marginBottom: 26 }}>
          <SocialSectionTitle title="Convites" count={invites.length} />
          <View style={{ gap: 12 }}>
            {invites.map((competition) => (
              <CompetitionInviteCard
                key={competition.id}
                competition={competition}
                busy={busyId === competition.id}
                onAccept={() => onAccept(competition.id)}
                onDecline={() => onDecline(competition.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <SocialSectionTitle title="Em andamento" right={<CreatePill onPress={onCreate} />} />

      {featured ? (
        <View style={{ gap: 12 }}>
          <FeaturedCompetitionCard competition={featured} onOpen={() => onOpen(featured.id)} />
          {otherOngoing.map((competition) => (
            <CompetitionRowCard key={competition.id} competition={competition} onOpen={() => onOpen(competition.id)} />
          ))}
        </View>
      ) : upcoming.length === 0 ? (
        <EmptyCompetitions onCreate={onCreate} />
      ) : (
        <AppText family="manrope" weight="medium" style={{ paddingHorizontal: 24, fontSize: 14, color: colors.textMuted }}>
          Nenhuma valendo hoje — as suas começam em breve.
        </AppText>
      )}

      {upcoming.length > 0 ? (
        <View style={{ marginTop: 26 }}>
          <SocialSectionTitle title="Vão começar" />
          <View style={{ gap: 12 }}>
            {upcoming.map((competition) => (
              <CompetitionRowCard key={competition.id} competition={competition} onOpen={() => onOpen(competition.id)} />
            ))}
          </View>
        </View>
      ) : null}

      <ActionError message={actionError} />

      <View className="mx-5" style={{ marginTop: 14 }}>
        <NavRow
          icon={<LinkIcon size={22} color={colors.text} />}
          label="Entrar com código"
          accessibilityHint="Entra numa competição com o código que alguém passou"
          onPress={onJoinWithCode}
        />
      </View>

      {finishedCount > 0 ? (
        <Pressable
          onPress={onOpenFinished}
          accessibilityRole="link"
          className="mx-5 flex-row items-center justify-between"
          style={{ marginTop: 18, paddingVertical: 10, paddingHorizontal: 6 }}
        >
          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 15, color: colors.textStrong, textDecorationLine: "underline" }}
          >
            Competições encerradas
          </AppText>
          <ChevronIcon size={13} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
