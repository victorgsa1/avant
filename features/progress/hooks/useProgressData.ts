import { useCallback, useMemo } from "react";
import { insightsApi, progressApi } from "@/services/api";
import type { ExecutionPeriod, InsightResponse, ProgressOverviewResponse } from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { Area, Trend, WeekDay } from "../types";

interface ProgressPayload {
  /** A tela inteira, calculada no servidor a partir das ações reais. */
  overview: ProgressOverviewResponse;
  /** O que o motor aprendeu. Vazio até haver semana suficiente. */
  insights: InsightResponse[];
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const PERIOD_LABELS: Record<ExecutionPeriod, { title: string; phrase: string }> = {
  MORNING: { title: "Manhã", phrase: "pela manhã" },
  AFTERNOON: { title: "Tarde", phrase: "à tarde" },
  EVENING: { title: "Noite", phrase: "à noite" },
};

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)} de ${MONTHS[Number(month) - 1] ?? ""}`;
}

function formatDays(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1).replace(".", ",")} dia${value >= 2 ? "s" : ""}`;
}

function trendOf(delta: number | null): Trend {
  if (delta === null) return "none";
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

function deltaLabelOf(delta: number | null): string {
  if (delta === null) return "primeiro mês";
  if (delta === 0) return "estável neste mês";
  return `${delta > 0 ? "+" : ""}${delta}% neste mês`;
}

export function useProgressData() {
  const resource = useAsyncResource<ProgressPayload>(
    useCallback(async () => {
      const [overview, insights] = await Promise.all([
        progressApi.overview(),
        // Insight é complemento: a tela de progresso funciona sem ele.
        insightsApi.list().catch(() => [] as InsightResponse[]),
      ]);
      return { overview, insights };
    }, []),
  );

  const { data } = resource;

  const view = useMemo(() => {
    if (!data) return null;

    const { overview } = data;
    const { consistency, comeback, bestWindow } = overview;

    const week: WeekDay[] = overview.week.days.map((day, index) => ({
      label: WEEKDAY_LABELS[index] ?? "",
      state: day.state,
    }));

    const areas: Area[] = overview.areas.map((area) => ({ name: area.name, pct: area.pct }));

    const improving =
      comeback.avgDaysToReturn !== null &&
      comeback.previousAvgDaysToReturn !== null &&
      comeback.avgDaysToReturn < comeback.previousAvgDaysToReturn;

    return {
      week,
      weeklyDone: overview.week.done,
      weeklyTotal: overview.week.total,
      consistencyPct: consistency.pct,
      consistencyDeltaLabel: deltaLabelOf(consistency.deltaPct),
      consistencyTrend: trendOf(consistency.deltaPct),
      series: consistency.series,
      chartStartLabel: formatShortDate(consistency.startDate),
      chartEndLabel: formatShortDate(consistency.endDate),
      comeback: {
        recoveries: comeback.recoveries,
        currentLabel: formatDays(comeback.avgDaysToReturn),
        previousLabel:
          comeback.previousAvgDaysToReturn !== null ? formatDays(comeback.previousAvgDaysToReturn) : null,
        improving,
      },
      bestWindow: bestWindow
        ? {
            title: PERIOD_LABELS[bestWindow.period].title,
            phrase: PERIOD_LABELS[bestWindow.period].phrase,
            share: bestWindow.share,
          }
        : null,
      insights: data.insights,
      areas,
    };
  }, [data]);

  /**
   * Puxar para atualizar pede a análise da semana. O servidor respeita o
   * intervalo mínimo entre análises, então chamar isso várias vezes não
   * gera várias chamadas de IA.
   */
  const refreshWithReview = useCallback(async () => {
    await insightsApi.weekly().catch(() => undefined);
    await resource.refresh();
  }, [resource]);

  /** Dispensar um insight some com o card sem esperar o servidor. */
  const archiveInsight = useCallback(
    (id: string) => {
      resource.mutate((current) => ({
        ...current,
        insights: current.insights.filter((insight) => insight.id !== id),
      }));
      void insightsApi.archive(id).catch(() => undefined);
    },
    [resource],
  );

  return { ...resource, view, archiveInsight, refreshWithReview };
}
