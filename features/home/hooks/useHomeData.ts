import { useCallback, useMemo, useRef, useState } from "react";
import { progressApi, rankingApi, todayApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type {
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
      const [today, summary, ranking] = await Promise.all([
        todayApi.get(),
        progressApi.summary(),
        rankingApi.get("week"),
      ]);
      return { today, summary, ranking };
    }, []),
  );

  const { data, mutate, refresh } = resource;
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlight = useRef(new Set<string>());

  /**
   * Concluir é otimista: a linha marca na hora e o servidor confirma. Se a
   * chamada falhar, revertemos — a verdade continua sendo do backend.
   */
  const toggleTask = useCallback(
    (id: string) => {
      if (!data || inFlight.current.has(id)) return;

      const action = data.today.actions.find((item) => item.id === id);
      if (!action || action.status !== "PLANNED") return;

      inFlight.current.add(id);
      setPendingIds((current) => [...current, id]);
      setActionError(null);

      mutate((current) => ({
        ...current,
        today: {
          ...current.today,
          progress: { ...current.today.progress, completed: current.today.progress.completed + 1 },
          actions: current.today.actions.map((item) =>
            item.id === id
              ? { ...item, status: "COMPLETED", xp: { ...item.xp, awarded: item.xp.possible } }
              : item,
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
                item.id === id ? { ...item, status: "PLANNED", xp: { ...item.xp, awarded: 0 } } : item,
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

  const view = useMemo(() => {
    if (!data) return null;

    const { today, summary, ranking } = data;
    const tasks: Task[] = today.actions
      .filter((action) => action.status !== "SKIPPED")
      .map((action) => ({ ...toTask(action), pending: pendingIds.includes(action.id) }));

    const nextAction = today.actions.find((action) => action.status === "PLANNED") ?? null;

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
      insight: today.insight,
      recovery: today.recovery,
      nextAction: nextAction
        ? {
            id: nextAction.id,
            title: nextAction.titleSnapshot || nextAction.habit.title,
            windowLabel: windowLabelOf(nextAction),
            xp: nextAction.xp.possible,
            variantTitle: nextAction.variant?.title ?? null,
          }
        : null,
    };
  }, [data, pendingIds]);

  return {
    ...resource,
    view,
    toggleTask,
    actionError,
  };
}
