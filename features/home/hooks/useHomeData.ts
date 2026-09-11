import { useCallback, useMemo, useRef, useState } from "react";
import { adaptationsApi, habitsApi, progressApi, rankingApi, todayApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type {
  AdaptationProposal,
  DailyActionResponse,
  ProgressSummaryResponse,
  RankingResponse,
  TodayResponse,
} from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { RankingEntry, Task } from "../types";

interface HomePayload {
  today: TodayResponse;
  summary: ProgressSummaryResponse;
  ranking: RankingResponse;
  /** Propostas do motor adaptativo — geralmente vazio, e tudo bem. */
  adaptations: AdaptationProposal[];
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** "até 21:00" a partir da janela da ação. */
function windowLabelOf(action: DailyActionResponse): string {
  const end = action.time.windowEnd ?? action.time.plannedAt;
  if (!end) return "quando der hoje";
  const date = new Date(end);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `até ${hh}:${mm}`;
}

function toTask(action: DailyActionResponse): Task {
  return {
    id: action.id,
    label: action.titleSnapshot || action.habit.title,
    xp: action.xp.possible,
    done: action.status === "COMPLETED",
  };
}

export function useHomeData() {
  const resource = useAsyncResource<HomePayload>(
    useCallback(async () => {
      const [today, summary, ranking, adaptations] = await Promise.all([
        todayApi.get(),
        progressApi.summary(),
        rankingApi.get("week"),
        // O motor é acessório da tela: se ele falhar, o dia continua.
        adaptationsApi.list().catch(() => [] as AdaptationProposal[]),
      ]);
      return { today, summary, ranking, adaptations };
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
    (id: string, reason?: string) => {
      if (!data || inFlight.current.has(id)) return;

      const action = data.today.actions.find((item) => item.id === id);
      if (!action || action.status !== "PLANNED") return;

      inFlight.current.add(id);
      setPendingIds((current) => [...current, id]);
      setActionError(null);

      void todayApi
        .skip(id, reason)
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
   * Puxar para atualizar roda o motor de adaptação antes de recarregar.
   *
   * As regras são baratas (algumas queries) e a IA tem cooldown próprio no
   * servidor, então isso não vira custo por refresh — mas faz o loop
   * parecer vivo em vez de esperar o job semanal.
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

    const { today, summary, ranking } = data;

    // Uma principal por dia (o servidor garante); o resto é complementar.
    const primary = today.actions.find((action) => action.role === "PRIMARY") ?? null;
    const tasks: Task[] = today.actions
      .filter((action) => action.role === "COMPLEMENTARY" && action.status !== "SKIPPED")
      .map((action) => ({ ...toTask(action), pending: pendingIds.includes(action.id) }));

    const rankingEntries: RankingEntry[] = ranking.rows.slice(0, 3).map((row) => ({
      rank: row.position,
      name: row.isCurrentUser ? "Você" : row.name,
      initial: initialOf(row.name),
      xp: row.xp,
      isCurrentUser: row.isCurrentUser,
    }));

    return {
      level: summary.levelProgress.level,
      nextLevel: summary.levelProgress.level + 1,
      streakDays: today.progress.streak,
      tasks,
      doneCount: tasks.filter((task) => task.done).length,
      totalTasks: tasks.length,
      currentXP: summary.xpTotal,
      remainingXP: Math.max(
        0,
        summary.levelProgress.xpForNextLevel - summary.levelProgress.xpIntoLevel,
      ),
      progress: Math.min(1, summary.levelProgress.progressPercent / 100),
      greeting: greetingFor(),
      ranking: rankingEntries,
      rivalName: ranking.next?.name ?? null,
      gapXP: ranking.next?.xpDelta ?? 0,
      unreadNotifications: today.unreadNotifications,
      adaptations: data.adaptations,
      insight: today.insight,
      recovery: today.recovery,
      pausedPrimary: today.pausedPrimary ?? null,
      primaryAction: primary
        ? {
            id: primary.id,
            title: primary.titleSnapshot || primary.habit.title,
            variantTitle: primary.variant?.title ?? null,
            windowLabel: windowLabelOf(primary),
            minutes: primary.minutes,
            xp: primary.xp.possible,
            awardedXp: primary.xp.awarded,
            completedAt: primary.completedAt,
            status: primary.status,
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
    adaptationBusyId,
    resumePausedPrimary,
    resumingPaused,
    actionError,
  };
}
