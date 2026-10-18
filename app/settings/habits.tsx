import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { EmptyState } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsPill,
  SettingsSegmented,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { habitsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { HabitResponse, HabitStatus } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";

const GROUP_TITLE: Record<HabitStatus, string> = {
  ACTIVE: "No seu dia",
  PAUSED: "Pausados",
  ARCHIVED: "Arquivados",
};

const GROUP_FOOTER: Record<HabitStatus, string> = {
  ACTIVE: "Pausar tira o hábito do dia até você retomar. Arquivar encerra — o histórico continua no Progresso.",
  PAUSED: "Pausados não aparecem no seu dia nem contam no progresso enquanto estiverem parados.",
  ARCHIVED: "Nada é apagado: retomar devolve o hábito ao plano com o histórico de antes.",
};

const EMPTY: Record<HabitStatus, string> = {
  ACTIVE: "Crie um movimento pelo botão + na barra de navegação.",
  PAUSED: "Quando a vida apertar, pause um hábito em vez de largar. Ele espera aqui.",
  ARCHIVED: "Hábitos encerrados ficam guardados aqui.",
};

function frequencyLabel(habit: HabitResponse): string {
  const frequency = habit.frequency === "DAILY" ? "Todo dia" : `${habit.weeklyTarget}x por semana`;
  return habit.role === "PRIMARY" ? `Principal · ${frequency}` : frequency;
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
  const [status, setStatus] = useState<HabitStatus>("ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Hábito que acabou de ser pausado: ele sai da lista de ativos, então
  // avisamos para onde foi e oferecemos desfazer em vez de sumir calado.
  const [justPaused, setJustPaused] = useState<HabitResponse | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A resposta leva junto a aba que pediu: enquanto a nova lista chega, a
  // anterior não aparece embaixo do título errado.
  const habits = useAsyncResource(
    useCallback(async () => ({ status, items: await habitsApi.list(status) }), [status]),
  );
  const paused = useAsyncResource(useCallback(() => habitsApi.list("PAUSED"), []));

  // O recurso só busca sozinho na montagem e no foco: trocar a aba pede a
  // lista nova.
  const { reload } = habits;
  const firstStatus = useRef(true);
  useEffect(() => {
    if (firstStatus.current) {
      firstStatus.current = false;
      return;
    }
    void reload();
  }, [status, reload]);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

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
        ? "É a sua principal: seu dia fica sem compromisso até você retomar. Ela fica em Pausados."
        : "Ele sai do seu dia até você retomar. Fica em Pausados.",
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
  const list = habits.data?.status === status ? habits.data.items : null;

  return (
    <SettingsPage
      title="Seus hábitos"
      subtitle="Pausar, retomar e arquivar"
      refreshing={habits.refreshing}
      onRefresh={() => void Promise.all([habits.refresh(), paused.refresh()])}
    >
      <SettingsGroup>
        <SettingsSegmented
          options={[
            { value: "ACTIVE", label: "Ativos" },
            { value: "PAUSED", label: pausedCount > 0 ? `Pausados (${pausedCount})` : "Pausados" },
            { value: "ARCHIVED", label: "Arquivados" },
          ]}
          value={status}
          onChange={setStatus}
        />
      </SettingsGroup>

      {justPaused ? (
        <View
          className="flex-row items-center rounded-[18px]"
          style={{
            marginTop: 12,
            marginHorizontal: 16,
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
            “{justPaused.title}” foi pausado. Está em Pausados.
          </AppText>
          <Pressable onPress={undoPause} hitSlop={8} accessibilityRole="button">
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.emberInk }}>
              Desfazer
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <SettingsGroup title={GROUP_TITLE[status]} footer={list && list.length > 0 ? GROUP_FOOTER[status] : undefined}>
        {!list ? (
          habits.error ? (
            <SettingsItem title="Não deu para carregar" subtitle="Toque para tentar de novo." onPress={() => void habits.refresh()} />
          ) : (
            <SettingsBlock style={{ alignItems: "center", paddingVertical: 28 }}>
              <ActivityIndicator color={colors.ember} />
            </SettingsBlock>
          )
        ) : list.length === 0 ? (
          <EmptyState title="Nada por aqui" description={EMPTY[status]} />
        ) : (
          list.map((habit) => {
            const busy = busyId === habit.id;
            return (
              <SettingsItem key={habit.id} title={habit.title} subtitle={frequencyLabel(habit)} disabled={busy}>
                <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: 12 }}>
                  {habit.status === "ACTIVE" ? (
                    <SettingsPill label="Pausar" disabled={busy} onPress={() => pause(habit)} />
                  ) : (
                    <SettingsPill
                      label="Retomar"
                      tone="accent"
                      disabled={busy}
                      onPress={() => run(habit.id, () => habitsApi.resume(habit.id))}
                    />
                  )}
                  {habit.status !== "ARCHIVED" ? (
                    <SettingsPill label="Arquivar" tone="danger" disabled={busy} onPress={() => archive(habit)} />
                  ) : null}
                </View>
              </SettingsItem>
            );
          })
        )}
      </SettingsGroup>

      <SettingsMessage message={error} />
    </SettingsPage>
  );
}
