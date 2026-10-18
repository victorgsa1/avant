import { useCallback, useMemo, useRef, useState } from "react";
import { adaptationsApi, habitsApi, progressApi, todayApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type {
  AdaptationProposal,
  DailyActionResponse,
  ProgressOverviewResponse,
  SkipReasonCode,
  TodayResponse,
} from "@/services/http/types";
import type { WeekDay } from "@/components/ui/WeekStrip";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { Task } from "../types";

interface HomePayload {
  today: TodayResponse;
  /** Só a semana interessa aqui — nível e XP vivem na aba Progresso. */
  overview: ProgressOverviewResponse;
  /** Propostas do motor adaptativo — geralmente vazio, e tudo bem. */
  adaptations: AdaptationProposal[];
}

const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** "Qui, 10 set" — escrito à mão porque Intl não é confiável no Hermes. */
function dateLabelOf(date = new Date()): string {
  return `${WEEKDAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/**
 * A inicial vem da data, não da posição na lista: assim a faixa continua
 * certa se o servidor mudar o primeiro dia da semana. Meio-dia local evita
 * que "2026-09-10" vire o dia anterior em fuso negativo.
 */
function weekdayInitialOf(isoDate: string): string {
  return WEEKDAY_INITIALS[new Date(`${isoDate}T12:00:00`).getDay()] ?? "";
}

/** "18h30" — a hora reservada para o compromisso do dia. */
function timeLabelOf(action: DailyActionResponse): string | null {
  const at = action.time.plannedAt ?? action.time.windowEnd;
  if (!at) return null;
  const date = new Date(at);
  return `${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
}

/** "20 minutos · Depois do trabalho". */
function detailOf(action: DailyActionResponse): string | null {
  const minutes = action.minutes !== null ? `${action.minutes} minutos` : null;
  const variantTitle = action.variant?.title ?? null;
  // Variante que só repete a duração viraria "20 minutos · 20 min".
  const context = variantTitle && !variantTitle.toLowerCase().includes("min") ? variantTitle : null;
  const parts = [minutes, context].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function toTask(action: DailyActionResponse): Task {
  return {
    id: action.id,
    label: action.titleSnapshot || action.habit.title,
    iconKey: action.habit.iconKey,
    xp: action.xp.possible,
    done: action.status === "COMPLETED",
  };
}

export function useHomeData() {
  const resource = useAsyncResource<HomePayload>(
    useCallback(async () => {
      const [today, overview, adaptations] = await Promise.all([
        todayApi.get(),
        progressApi.overview(),
        // O motor é acessório da tela: se ele falhar, o dia continua.
        adaptationsApi.list().catch(() => [] as AdaptationProposal[]),
      ]);
      return { today, overview, adaptations };
    }, []),
  );

  const { data, mutate, refresh } = resource;
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlight = useRef(new Set<string>());

  /**
   * Só complementares se concluem com um toque — a principal exige foto e
   * localização, na tela própria. Concluir é otimista: a linha marca na
   * hora e o servidor confirma; se falhar, revertemos.
   */
  const toggleTask = useCallback(
    (id: string) => {
      if (!data || inFlight.current.has(id)) return;

      const action = data.today.actions.find((item) => item.id === id);
      if (!action || action.status !== "PLANNED" || action.role !== "COMPLEMENTARY") return;

      inFlight.current.add(id);
      setPendingIds((current) => [...current, id]);
      setActionError(null);

      mutate((current) => ({
        ...current,
        today: {
          ...current.today,
          progress: { ...current.today.progress, completed: current.today.progress.completed + 1 },
          actions: current.today.actions.map((item) =>
            item.id === id ? { ...item, status: "COMPLETED" } : item,
          ),
        },
      }));

      void todayApi
        .complete(id)
        .then(() => refresh())
        .catch((error) => {
          setActionError(userMessage(error));
          mutate((current) => ({
            ...current,
            today: {
              ...current.today,
              progress: {
                ...current.today.progress,
                completed: Math.max(0, current.today.progress.completed - 1),
              },
              actions: current.today.actions.map((item) =>
                item.id === id ? { ...item, status: "PLANNED" } : item,
              ),
            },
          }));
        })
        .finally(() => {
          inFlight.current.delete(id);
          setPendingIds((current) => current.filter((pending) => pending !== id));
        });
    },
    [data, mutate, refresh],
  );

  /**
   * Pular é uma resposta legítima — e o motivo (quando existe) alimenta o
   * perfil comportamental. Não é otimista: pular sem confirmação do
   * servidor daria a impressão errada se a chamada falhasse.
   */
  const skipTask = useCallback(
    (id: string, reasonCode?: SkipReasonCode) => {
      if (!data || inFlight.current.has(id)) return;

      const action = data.today.actions.find((item) => item.id === id);
      if (!action || action.status !== "PLANNED") return;

      inFlight.current.add(id);
      setPendingIds((current) => [...current, id]);
      setActionError(null);

      void todayApi
        .skip(id, reasonCode)
        .then(() => refresh())
        .catch((error) => setActionError(userMessage(error)))
        .finally(() => {
          inFlight.current.delete(id);
          setPendingIds((current) => current.filter((pending) => pending !== id));
        });
    },
    [data, refresh],
  );

  const [adaptationBusyId, setAdaptationBusyId] = useState<string | null>(null);

  /**
   * Puxar para atualizar pede ao motor para reavaliar antes de recarregar.
   *
   * O servidor só reavalia se algo aconteceu desde a última avaliação (o
   * motor é dirigido por evento) e nunca gasta IA neste caminho.
   */
  const refreshWithEngine = useCallback(async () => {
    await adaptationsApi.evaluate().catch(() => undefined);
    await refresh();
  }, [refresh]);

  const respondToAdaptation = useCallback(
    (id: string, response: "apply" | "dismiss") => {
      if (adaptationBusyId) return;
      setAdaptationBusyId(id);
      setActionError(null);

      const request = response === "apply" ? adaptationsApi.apply(id) : adaptationsApi.dismiss(id);

      void request
        .then(() => refresh())
        .catch((error) => setActionError(userMessage(error)))
        .finally(() => setAdaptationBusyId(null));
    },
    [adaptationBusyId, refresh],
  );

  /** Resposta de um toque ao card "o que atrapalhou?". */
  const answerFriction = useCallback(
    (id: string, reasonCode: SkipReasonCode) => {
      if (adaptationBusyId) return;
      setAdaptationBusyId(id);
      setActionError(null);

      void adaptationsApi
        .answerFriction(id, reasonCode)
        .then(() => refresh())
        .catch((error) => setActionError(userMessage(error)))
        .finally(() => setAdaptationBusyId(null));
    },
    [adaptationBusyId, refresh],
  );

  const [resumingPaused, setResumingPaused] = useState(false);

  /** Retoma a principal pausada direto da Home e recarrega o dia. */
  const resumePausedPrimary = useCallback(() => {
    const paused = data?.today.pausedPrimary;
    if (!paused || resumingPaused) return;
    setResumingPaused(true);
    setActionError(null);

    void habitsApi
      .resume(paused.id)
      .then(() => refresh())
      .catch((error) => setActionError(userMessage(error)))
      .finally(() => setResumingPaused(false));
  }, [data, refresh, resumingPaused]);

  const view = useMemo(() => {
    if (!data) return null;

    const { today, overview } = data;

    // Uma principal por dia (o servidor garante); o resto é complementar.
    const primary = today.actions.find((action) => action.role === "PRIMARY") ?? null;
    const tasks: Task[] = today.actions
      .filter((action) => action.role === "COMPLEMENTARY" && action.status !== "SKIPPED")
      .map((action) => ({ ...toTask(action), pending: pendingIds.includes(action.id) }));

    const week: WeekDay[] = overview.week.days.map((day) => ({
      label: weekdayInitialOf(day.date),
      state: day.state,
    }));

    return {
      streakDays: today.progress.streak,
      tasks,
      doneCount: tasks.filter((task) => task.done).length,
      totalTasks: tasks.length,
      greeting: greetingFor(),
      dateLabel: dateLabelOf(),
      week,
      unreadNotifications: today.unreadNotifications,
      adaptations: data.adaptations,
      insight: today.insight,
      recovery: today.recovery,
      pausedPrimary: today.pausedPrimary ?? null,
      primaryAction: primary
        ? {
            id: primary.id,
            title: primary.titleSnapshot || primary.habit.title,
            iconKey: primary.habit.iconKey,
            detail: detailOf(primary),
            timeLabel: timeLabelOf(primary),
            minutes: primary.minutes,
            xp: primary.xp.possible,
            awardedXp: primary.xp.awarded,
            completedAt: primary.completedAt,
            status: primary.status,
            /** As versões possíveis — é daqui que sai o "Mínimo" do card. */
            variants: primary.variants ?? [],
            plannedVariant: primary.variant?.type ?? null,
          }
        : null,
    };
  }, [data, pendingIds]);

  return {
    ...resource,
    view,
    refreshWithEngine,
    toggleTask,
    skipTask,
    respondToAdaptation,
    answerFriction,
    adaptationBusyId,
    resumePausedPrimary,
    resumingPaused,
    actionError,
  };
}
