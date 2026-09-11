import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { competitionsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import { confirmAction } from "@/services/native/confirm";
import type { CompetitionResponse } from "@/services/http/types";

/** "2026-03-10" → "10/03". A API manda data local, não instante. */
function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

function statusLabel(competition: CompetitionResponse): string {
  switch (competition.status) {
    case "UPCOMING":
      return competition.daysRemaining <= 1
        ? "Começa amanhã"
        : `Começa em ${competition.daysRemaining} dias`;
    case "ACTIVE":
      return `Dia ${competition.daysElapsed} de ${competition.daysTotal}`;
    case "CANCELLED":
      return "Cancelada";
    default:
      return "Encerrada";
  }
}

function StandingRow({
  row,
  last,
}: {
  row: CompetitionResponse["standings"][number];
  last: boolean;
}) {
  const { colors } = useTheme();
  const highlight = row.isCurrentUser;

  return (
    <View
      className="flex-row items-center"
      style={{
        gap: 13,
        paddingVertical: 14,
        paddingHorizontal: 17,
        backgroundColor: highlight ? colors.emberWash : "transparent",
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      <AppText
        family="archivo"
        weight="black"
        style={{ width: 22, fontSize: 15, color: highlight ? colors.ember : colors.textFaint }}
      >
        {row.position}
      </AppText>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          family="archivo"
          weight={highlight ? "extraBold" : "bold"}
          numberOfLines={1}
          style={{ fontSize: 14.5, color: colors.text }}
        >
          {highlight ? "Você" : row.name}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 2, fontSize: 11.5, color: colors.textFaint }}
        >
          {row.completedCount} de {row.plannedCount} ações · {row.daysScored} dias
        </AppText>
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ fontSize: 16, color: highlight ? colors.ember : colors.textMuted }}
      >
        {Math.round(row.score)}%
      </AppText>
    </View>
  );
}

/**
 * Detalhe da competição: placar por consistência e as ações de quem está
 * dentro. Quem criou não pode sair — só cancelar, o que encerra para
 * todo mundo de uma vez.
 */
export default function CompetitionDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const competition = useAsyncResource(
    useCallback(() => competitionsApi.get(String(id)), [id]),
  );

  const confirm = (title: string, message: string, onConfirm: () => void) =>
    confirmAction({ title, message, destructive: true, onConfirm });

  const run = (action: () => Promise<unknown>, thenBack = true) => {
    setBusy(true);
    setError(null);
    void action()
      .then(() => (thenBack ? router.back() : competition.refresh()))
      .catch((caught) => setError(userMessage(caught)))
      .finally(() => setBusy(false));
  };

  const data = competition.data;

  return (
    <Screen>
      <PageHeader
        title={data?.title ?? "Competição"}
        subtitle={data ? statusLabel(data) : null}
        onBack={() => router.back()}
      />

      {competition.loading && !data ? <ScreenLoading /> : null}
      {competition.error && !data ? (
        <ScreenError message={competition.error} onRetry={() => void competition.refresh()} />
      ) : null}

      {data ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={competition.refreshing}
              onRefresh={() => void competition.refresh()}
              tintColor={colors.ember}
            />
          }
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View
              className="rounded-[24px]"
              style={{ backgroundColor: colors.emberTint, padding: 20 }}
            >
              <AppText
                family="manrope"
                weight="bold"
                style={{ fontSize: 11, letterSpacing: 0.5, color: colors.emberDeep }}
              >
                SUA POSIÇÃO
              </AppText>

              <View className="flex-row items-baseline" style={{ marginTop: 8, gap: 8 }}>
                <AppText
                  family="archivo"
                  weight="black"
                  style={{ fontSize: 34, letterSpacing: -1.2, color: colors.emberInk }}
                >
                  {data.myPosition ? `${data.myPosition}º` : "—"}
                </AppText>
                <AppText
                  family="archivo"
                  weight="extraBold"
                  style={{ fontSize: 17, color: colors.emberDeep }}
                >
                  {Math.round(data.myScore)}% de consistência
                </AppText>
              </View>

              <AppText
                family="manrope"
                weight="medium"
                style={{ marginTop: 8, fontSize: 12.5, lineHeight: 18.5, color: colors.emberDeep }}
              >
                {data.description ??
                  "Vence quem cumprir a maior parte do próprio plano — não quem planeja mais."}
              </AppText>
            </View>
          </View>

          <SettingsSection title="PLACAR">
            {data.standings.map((row, index, list) => (
              <StandingRow key={row.userId} row={row} last={index === list.length - 1} />
            ))}
          </SettingsSection>

          {data.pendingInvites.length > 0 ? (
            <SettingsSection title="CONVITES PENDENTES">
              {data.pendingInvites.map((invite, index, list) => (
                <SettingsRow
                  key={invite.userId}
                  label={invite.name}
                  description={`@${invite.username}`}
                  last={index === list.length - 1}
                />
              ))}
            </SettingsSection>
          ) : null}

          <SettingsSection
            title="DETALHES"
            footer={`De ${shortDate(data.startDate)} a ${shortDate(data.endDate)} · criada por ${data.creator.name}`}
          >
            <SettingsRow label="Participantes" value={`${data.participantCount}`} />
            <SettingsRow label="Duração" value={`${data.daysTotal} dias`} last />
          </SettingsSection>

          {data.status === "ACTIVE" || data.status === "UPCOMING" ? (
            <SettingsSection>
              {data.isCreator ? (
                <SettingsRow
                  label="Cancelar competição"
                  description="Encerra para todos os participantes."
                  destructive
                  last
                  disabled={busy}
                  onPress={() =>
                    confirm("Cancelar competição?", "Ela é encerrada para todo mundo.", () =>
                      run(() => competitionsApi.cancel(data.id)),
                    )
                  }
                />
              ) : (
                <SettingsRow
                  label="Sair da competição"
                  description="Seu histórico continua; você só sai do placar."
                  destructive
                  last
                  disabled={busy}
                  onPress={() =>
                    confirm("Sair da competição?", "Você some do placar desta disputa.", () =>
                      run(() => competitionsApi.leave(data.id)),
                    )
                  }
                />
              )}
            </SettingsSection>
          ) : null}

          {error ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ marginTop: 14, paddingHorizontal: 24, fontSize: 12.5, color: colors.danger }}
            >
              {error}
            </AppText>
          ) : null}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
