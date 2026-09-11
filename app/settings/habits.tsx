import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { OptionPills, SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { habitsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { HabitResponse } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";

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

  // Hábito que acabou de ser pausado: ele sai da lista de ativos, então
  // avisamos para onde foi e oferecemos desfazer em vez de sumir calado.
  const [justPaused, setJustPaused] = useState<HabitResponse | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const habits = useAsyncResource(
    useCallback(() => habitsApi.list(status), [status]),
  );
  const paused = useAsyncResource(useCallback(() => habitsApi.list("PAUSED"), []));

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  const run = (id: string, action: () => Promise<unknown>, onDone?: () => void) => {
    setBusyId(id);
    setError(null);
    void action()
      .then(() => {
        onDone?.();
        return Promise.all([habits.refresh(), paused.refresh()]);
      })
      .catch((caught) => setError(userMessage(caught)))
      .finally(() => setBusyId(null));
  };

  const showPausedNotice = (habit: HabitResponse) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setJustPaused(habit);
    undoTimer.current = setTimeout(() => setJustPaused(null), 6000);
  };

  const pause = (habit: HabitResponse) => {
    const isPrimary = habit.role === "PRIMARY";
    confirmAction({
      title: `Pausar "${habit.title}"?`,
      message: isPrimary
        ? "É a sua principal: seu dia fica sem compromisso até você retomar. Ela fica na aba Pausados."
        : "Ele sai do seu dia até você retomar. Fica na aba Pausados.",
      confirmLabel: "Pausar",
      onConfirm: () => run(habit.id, () => habitsApi.pause(habit.id), () => showPausedNotice(habit)),
    });
  };

  const undoPause = () => {
    if (!justPaused) return;
    const habit = justPaused;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setJustPaused(null);
    run(habit.id, () => habitsApi.resume(habit.id));
  };

  const archive = (habit: HabitResponse) => {
    confirmAction({
      title: `Arquivar "${habit.title}"?`,
      message: "Ele sai do seu dia, mas o histórico continua no progresso.",
      confirmLabel: "Arquivar",
      destructive: true,
      onConfirm: () => run(habit.id, () => habitsApi.archive(habit.id)),
    });
  };

  const pausedCount = paused.data?.length ?? 0;

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
              { value: "PAUSED", label: pausedCount > 0 ? `Pausados (${pausedCount})` : "Pausados" },
              { value: "ARCHIVED", label: "Arquivados" },
            ]}
            value={status}
            onChange={setStatus}
          />
        </SettingsSection>

        {justPaused ? (
          <View
            className="flex-row items-center rounded-[18px]"
            style={{
              marginTop: 12,
              marginHorizontal: 20,
              gap: 12,
              paddingVertical: 13,
              paddingHorizontal: 16,
              backgroundColor: colors.emberWash,
            }}
          >
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.emberDeep }}
            >
              &quot;{justPaused.title}&quot; foi pausado. Está na aba Pausados.
            </AppText>
            <Pressable onPress={undoPause} hitSlop={8} accessibilityRole="button">
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.emberInk }}>
                Desfazer
              </AppText>
            </Pressable>
          </View>
        ) : null}

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
                onPress={() => pause(habit)}
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
