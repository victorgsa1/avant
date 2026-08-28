import { useCallback, useMemo } from "react";
import { areasApi, habitsApi, progressApi, todayApi } from "@/services/api";
import type {
  AreaResponse,
  HabitResponse,
  ProgressDailyRow,
  ProgressSummaryResponse,
  TodayResponse,
} from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { Area, WeekDay, WeekDayState } from "../types";

interface ProgressPayload {
  summary: ProgressSummaryResponse;
  daily: ProgressDailyRow[];
  today: TodayResponse;
  areas: AreaResponse[];
  habits: HabitResponse[];
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function isoDaysAgo(days: number, from: Date): string {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)} de ${MONTHS[Number(month) - 1] ?? ""}`;
}

/** Consistência do dia vira um dos 4 estados que o desenho conhece. */
function stateFor(row: ProgressDailyRow | undefined, iso: string, todayIso: string): WeekDayState {
  if (iso > todayIso) return "next";
  if (iso === todayIso) return "today";
  if (!row || row.planned === 0) return "next";
  return row.completed > 0 ? "done" : "miss";
}

/**
 * "Retomadas": dias ruins (planejou e não concluiu nada) seguidos de um dia
 * bom. Métrica própria do Avant — falhar não encerra o processo.
 */
function computeRecoveries(daily: ProgressDailyRow[]): {
  count: number;
  averageDaysToReturn: number | null;
} {
  let count = 0;
  let totalGap = 0;
  let badRun = 0;

  for (const row of daily) {
    if (row.planned === 0) continue;
    const bad = row.completed === 0;
    if (bad) {
      badRun += 1;
      continue;
    }
    if (badRun > 0) {
      count += 1;
      totalGap += badRun;
      badRun = 0;
    }
  }

  return { count, averageDaysToReturn: count > 0 ? totalGap / count : null };
}

function formatDays(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1).replace(".", ",")} dia${value >= 2 ? "s" : ""}`;
}

export function useProgressData() {
  const resource = useAsyncResource<ProgressPayload>(
    useCallback(async () => {
      const to = new Date().toISOString().slice(0, 10);
      const from = isoDaysAgo(59, new Date());
      const [summary, daily, today, areas, habits] = await Promise.all([
        progressApi.summary(),
        progressApi.daily({ from, to }),
        todayApi.get(),
        areasApi.list(),
        habitsApi.list("ACTIVE"),
      ]);
      return { summary, daily, today, areas, habits };
    }, []),
  );

  const { data } = resource;

  const view = useMemo(() => {
    if (!data) return null;

    const { summary, daily, today, areas, habits } = data;
    const byDate = new Map(daily.map((row) => [row.date, row]));
    const todayIso = today.date;

    // Semana corrente, domingo → sábado, alinhada ao "hoje" do usuário.
    const todayDate = new Date(`${todayIso}T00:00:00Z`);
    const weekStart = new Date(todayDate);
    weekStart.setUTCDate(todayDate.getUTCDate() - todayDate.getUTCDay());

    const week: WeekDay[] = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(weekStart);
      date.setUTCDate(weekStart.getUTCDate() + offset);
      const iso = date.toISOString().slice(0, 10);
      return { label: WEEKDAY_LABELS[offset], state: stateFor(byDate.get(iso), iso, todayIso) };
    });

    const weekRows = daily.filter((row) => {
      const date = new Date(`${row.date}T00:00:00Z`);
      return date >= weekStart && row.date <= todayIso;
    });
    const weeklyDone = weekRows.reduce((sum, row) => sum + row.completed, 0);
    const weeklyTotal = weekRows.reduce((sum, row) => sum + row.planned, 0);

    // Tendência: últimos 30 dias contra os 30 anteriores.
    const recent = daily.slice(-30);
    const previous = daily.slice(-60, -30);
    const avg = (rows: ProgressDailyRow[]) =>
      rows.length ? rows.reduce((sum, row) => sum + row.consistencyScore, 0) / rows.length : 0;
    const delta = Math.round(avg(recent) - avg(previous));

    const recoveries = computeRecoveries(daily);

    // Consistência por área: média das ações concluídas dos hábitos da área.
    const habitsByArea = new Map<string, HabitResponse[]>();
    for (const habit of habits) {
      if (!habit.areaId) continue;
      habitsByArea.set(habit.areaId, [...(habitsByArea.get(habit.areaId) ?? []), habit]);
    }
    const areaList: Area[] = areas.map((area) => {
      const areaHabits = habitsByArea.get(area.id) ?? [];
      const actions = today.actions.filter((action) =>
        areaHabits.some((habit) => habit.id === action.habit.id),
      );
      const done = actions.filter((action) => action.status === "COMPLETED").length;
      const pct =
        actions.length > 0
          ? Math.round((done / actions.length) * 100)
          : Math.round(summary.overallConsistency);
      return { name: area.name, pct };
    });

    return {
      week,
      weeklyDone,
      weeklyTotal,
      consistencyPct: Math.round(summary.overallConsistency),
      consistencyDeltaLabel:
        delta === 0 ? "estável neste mês" : `${delta > 0 ? "+" : ""}${delta}% neste mês`,
      chartStartLabel: daily.length ? formatShortDate(daily[0].date) : "—",
      chartEndLabel: formatShortDate(todayIso),
      comebackPreviousLabel: recoveries.count > 1 ? formatDays(recoveries.averageDaysToReturn) : "—",
      comebackCurrentLabel: formatDays(recoveries.averageDaysToReturn),
      comebackRecoveries: recoveries.count,
      bestWindowLabel: today.insight?.title ?? "Ainda aprendendo sua rotina",
      areas: areaList,
      level: summary.levelProgress.level,
      xpTotal: summary.xpTotal,
      completedActions: summary.completedActions,
      currentStreak: summary.currentStreak,
      bestStreak: summary.bestStreak,
    };
  }, [data]);

  return { ...resource, view };
}
