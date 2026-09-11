import { useCallback, useState } from "react";
import { Alert, Platform, RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { OptionPills, SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { habitsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { HabitResponse } from "@/services/http/types";

function frequencyLabel(habit: HabitResponse): string {
  if (habit.frequency === "DAILY") return "Todo dia";
  return `${habit.weeklyTarget}x por semana`;
}

/**
 * Gestão dos hábitos.
 *
 * Pausar existe para o caso em que a vida mudou (viagem, lesão, semana
 * impossível) — é diferente de arquivar, que encerra o hábito. Nos dois
 * casos o histórico fica: nada é apagado.
 */
export default function HabitsScreen() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "ARCHIVED">("ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const habits = useAsyncResource(
    useCallback(() => habitsApi.list(status), [status]),
  );

  const run = (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    void action()
      .then(() => habits.refresh())
      .catch((caught) => setError(userMessage(caught)))
      .finally(() => setBusyId(null));
  };

  const archive = (habit: HabitResponse) => {
    const doArchive = () => run(habit.id, () => habitsApi.archive(habit.id));

    if (Platform.OS === "web") {
      doArchive();
      return;
    }
    Alert.alert(
      `Arquivar "${habit.title}"?`,
      "Ele sai do seu dia, mas o histórico continua no progresso.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Arquivar", style: "destructive", onPress: doArchive },
      ],
    );
  };

  return (
    <Screen>
      <PageHeader
        title="Seus hábitos"
        subtitle="Pausar, retomar ou arquivar"
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={habits.refreshing}
            onRefresh={() => void habits.refresh()}
            tintColor={colors.ember}
          />
        }
      >
        <SettingsSection>
          <OptionPills
            options={[
              { value: "ACTIVE", label: "Ativos" },
              { value: "PAUSED", label: "Pausados" },
              { value: "ARCHIVED", label: "Arquivados" },
            ]}
            value={status}
            onChange={setStatus}
          />
        </SettingsSection>

        {habits.loading && !habits.data ? <ScreenLoading /> : null}
        {habits.error && !habits.data ? (
          <ScreenError message={habits.error} onRetry={() => void habits.refresh()} />
        ) : null}

        {habits.data?.length === 0 ? (
          <EmptyState
            title="Nada por aqui"
            description={
              status === "ACTIVE"
                ? "Crie um movimento pelo botão + na barra de navegação."
                : "Nenhum hábito neste estado."
            }
          />
        ) : null}

        {(habits.data ?? []).map((habit) => (
          <SettingsSection key={habit.id}>
            <SettingsRow label={habit.title} description={frequencyLabel(habit)} />

            {habit.status === "ACTIVE" ? (
              <SettingsRow
                label="Pausar"
                description="Some do dia até você retomar."
                disabled={busyId === habit.id}
                onPress={() => run(habit.id, () => habitsApi.pause(habit.id))}
              />
            ) : (
              <SettingsRow
                label="Retomar"
                description="Volta a entrar no plano do dia."
                disabled={busyId === habit.id}
                onPress={() => run(habit.id, () => habitsApi.resume(habit.id))}
              />
            )}

            {habit.status !== "ARCHIVED" ? (
              <SettingsRow
                label="Arquivar"
                destructive
                last
                disabled={busyId === habit.id}
                onPress={() => archive(habit)}
              />
            ) : null}
          </SettingsSection>
        ))}

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
    </Screen>
  );
}
