import { Image, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { competitionArtFor, SOCIAL_ART } from "@/features/social/art";
import { resultLabel } from "@/features/social/format";
import { useCompetitions } from "@/features/social/hooks/useCompetitions";

/** "2026-03-10" → "10/03". A API manda data local, não instante. */
function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

/** O histórico: competições encerradas ou canceladas, com o seu resultado. */
export default function FinishedCompetitionsScreen() {
  const { colors } = useTheme();
  const competitions = useCompetitions();
  const { finished } = competitions;

  return (
    <Screen>
      <PageHeader title="Competições encerradas" onBack={() => router.back()} />

      {competitions.loading && !competitions.data ? <ScreenLoading /> : null}
      {competitions.error && !competitions.data ? (
        <ScreenError message={competitions.error} onRetry={() => void competitions.refresh()} />
      ) : null}

      {competitions.data ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={competitions.refreshing}
              onRefresh={() => void competitions.refresh()}
              tintColor={colors.ember}
            />
          }
        >
          {finished.length === 0 ? (
            <EmptyState
              image={SOCIAL_ART.jornada}
              title="Nada encerrado ainda"
              description="Quando uma competição terminar, o resultado fica guardado aqui."
            />
          ) : (
            finished.map((competition, index) => {
              const won = competition.status === "FINISHED" && competition.myPosition === 1;
              return (
                <Pressable
                  key={competition.id}
                  onPress={() => router.push(`/competition/${competition.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${competition.title}. ${resultLabel(competition)}`}
                  className="flex-row items-center"
                  style={{
                    gap: 14,
                    paddingVertical: 14,
                    borderBottomWidth: index === finished.length - 1 ? 0 : 1,
                    borderBottomColor: colors.line,
                  }}
                >
                  <View
                    className="items-center justify-center rounded-[14px]"
                    style={{ width: 58, height: 58, backgroundColor: colors.paper, opacity: competition.status === "CANCELLED" ? 0.55 : 1 }}
                  >
                    <Image
                      source={competitionArtFor(competition.title, competition.description)}
                      resizeMode="contain"
                      style={{ width: 46, height: 46 }}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText family="archivo" weight="extraBold" numberOfLines={1} style={{ fontSize: 16, color: colors.text }}>
                      {competition.title}
                    </AppText>
                    <AppText
                      family="manrope"
                      weight={won ? "bold" : "medium"}
                      numberOfLines={1}
                      style={{ marginTop: 3, fontSize: 13.5, color: won ? colors.emberInk : colors.textMuted }}
                    >
                      {resultLabel(competition)}
                    </AppText>
                    <AppText family="manrope" weight="medium" style={{ marginTop: 2, fontSize: 12.5, color: colors.textFaint }}>
                      {shortDate(competition.startDate)} a {shortDate(competition.endDate)}
                    </AppText>
                  </View>
                  <ChevronIcon size={12} color={colors.textMuted} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
