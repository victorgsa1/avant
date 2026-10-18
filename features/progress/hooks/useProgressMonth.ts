import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adaptationsApi, insightsApi, progressApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { AdaptationProposal, InsightResponse, ProgressMonthResponse } from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { daysBetween, formatRate, monthName, monthShort, sessions, shortDate } from "../format";
import type { FollowUp, Noticed, RoutineHabit, TimelineItem } from "../types";

interface ProgressPayload {
  /** O mês inteiro, calculado no servidor a partir das ações reais. */
  month: ProgressMonthResponse;
  /** Propostas abertas do motor: a primeira vira "O Avant percebeu". */
  proposals: AdaptationProposal[];
  /** O que o motor aprendeu; entra quando não há proposta aberta. */
  insights: InsightResponse[];
}

const PERIOD_PHRASE: Record<string, string> = {
  MORNING: "pela manhã",
  AFTERNOON: "à tarde",
  EVENING: "à noite",
};

const REDUCE_STRATEGIES = new Set(["REDUCE_ENTRY_BARRIER", "RECOVERY_MICRO_ACTION"]);

/** A janela em que o motor viu o padrão, pela evidência que ele guardou. */
function periodOf(evidence: Record<string, unknown> | null): string | null {
  if (typeof evidence?.completionRate7d === "number") return "Últimos 7 dias";
  if (typeof evidence?.completionRate30d === "number") return "Últimos 30 dias";
  return null;
}

/** O que muda no plano se a pessoa disser sim — só quando dá para dizer com certeza. */
function suggestionOf(proposal: AdaptationProposal): string | null {
  const habit = proposal.habitTitle;
  if (!habit) return null;
  const period = proposal.evidence?.suggestedPeriod;
  if (typeof period === "string" && PERIOD_PHRASE[period]) return `${habit} ${PERIOD_PHRASE[period]}`;
  if (proposal.strategy && REDUCE_STRATEGIES.has(proposal.strategy)) return `${habit} na versão mínima`;
  return null;
}

function noticedFrom(proposals: AdaptationProposal[], insights: InsightResponse[]): Noticed | null {
  // Pergunta de um toque precisa das opções de resposta: ela fica na Hoje.
  const proposal = proposals.find((item) => item.kind !== "QUESTION");
  if (proposal) {
    return {
      kind: "proposal",
      id: proposal.id,
      tag: proposal.habitTitle,
      period: periodOf(proposal.evidence),
      title: proposal.title,
      body: proposal.message,
      suggestion: suggestionOf(proposal),
      applyLabel: proposal.applyLabel,
      dismissLabel: proposal.dismissLabel ?? "Manter plano",
    };
  }

  const insight = insights[0];
  if (!insight) return null;
  return {
    kind: "insight",
    id: insight.id,
    tag: null,
    period:
      insight.periodStart && insight.periodEnd
        ? `Últimos ${daysBetween(insight.periodStart.slice(0, 10), insight.periodEnd.slice(0, 10))} dias`
        : null,
    title: insight.title,
    body: insight.body,
  };
}

function followUpFrom(data: ProgressMonthResponse): FollowUp | null {
  const followUp = data.followUp;
  if (!followUp) return null;

  const afterDays = Math.min(followUp.windowDays, daysBetween(followUp.appliedOn, data.today));
  return {
    summary: followUp.summary,
    before: `${followUp.before.done} de ${followUp.before.planned}`,
    after: `${followUp.after.done} de ${followUp.after.planned}`,
    footnote: followUp.afterComplete
      ? `Dois períodos de ${followUp.windowDays} dias`
      : `${followUp.windowDays} dias antes · ${afterDays} ${afterDays === 1 ? "dia" : "dias"} depois, até agora`,
  };
}

function habitsFrom(data: ProgressMonthResponse): RoutineHabit[] {
  return data.habits.map((habit) => {
    const current = formatRate(habit.perWeek);
    const unit = `${sessions(current)} por semana`;

    let subtitle: string;
    if (habit.previousPerWeek === null) {
      subtitle = `${current} ${unit} neste mês`;
    } else {
      const previous = formatRate(habit.previousPerWeek);
      subtitle =
        previous === current
          ? `${current} ${unit}, ${current === "1" ? "mantida" : "mantidas"}`
          : `De ${previous} para ${current} ${unit}`;
    }

    return {
      id: habit.id,
      title: habit.title,
      iconKey: habit.iconKey,
      subtitle,
      bars:
        habit.previousPerWeek === null
          ? null
          : {
              previousLabel: monthShort(data.previousMonth),
              currentLabel: monthShort(data.month),
              previous: habit.previousPerWeek,
              current: habit.perWeek,
            },
    };
  });
}

function timelineFrom(data: ProgressMonthResponse): TimelineItem[] {
  return data.timeline.map((item, index) => ({
    key: `${item.kind}-${item.date}-${index}`,
    dateLabel: shortDate(item.date),
    title: item.title,
    detail: item.detail,
    kind: item.kind,
  }));
}

export function useProgressMonth() {
  /** O mês pedido. `undefined` é o mês atual da pessoa, no fuso dela. */
  const [requestedMonth, setRequestedMonth] = useState<string | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const resource = useAsyncResource<ProgressPayload>(
    useCallback(async () => {
      const [month, proposals, insights] = await Promise.all([
        progressApi.month(requestedMonth),
        // Proposta e insight são complemento: o mês aparece sem eles.
        adaptationsApi.list().catch(() => [] as AdaptationProposal[]),
        insightsApi.list().catch(() => [] as InsightResponse[]),
      ]);
      return { month, proposals, insights };
    }, [requestedMonth]),
  );

  const { data, refresh, reload, mutate } = resource;

  // Trocar de mês busca de novo, sem puxar a lista: quem mostra que está
  // buscando é o seletor. A primeira carga já é do hook acima.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    void reload();
  }, [requestedMonth, reload]);

  const view = useMemo(() => {
    if (!data) return null;
    const month = data.month;
    return {
      month: month.month,
      monthName: monthName(month.month),
      year: month.month.slice(0, 4),
      months: month.months.map((value) => ({ value, label: `${monthName(value)} ${value.slice(0, 4)}` })),
      today: month.today,
      totals: month.totals,
      weeks: month.weeks,
      calendar: month.calendar,
      primaryHabitId: month.habits.find((habit) => habit.role === "PRIMARY")?.id ?? null,
      noticed: noticedFrom(data.proposals, data.insights),
      followUp: followUpFrom(month),
      habits: habitsFrom(month),
      timeline: timelineFrom(month),
    };
  }, [data]);

  /** Enquanto o mês na tela não é o pedido, o seletor mostra que está buscando. */
  const switchingMonth = requestedMonth !== undefined && data?.month.month !== requestedMonth;

  /** "Adaptar" ou "manter": a decisão volta para o motor e a tela recarrega. */
  const respond = useCallback(
    (id: string, response: "apply" | "dismiss") => {
      if (busyId) return;
      setBusyId(id);
      setActionError(null);

      const request = response === "apply" ? adaptationsApi.apply(id) : adaptationsApi.dismiss(id);
      void request
        .then(() => reload())
        .catch((error) => setActionError(userMessage(error)))
        .finally(() => setBusyId(null));
    },
    [busyId, reload],
  );

  /** Dispensar um insight some com o card sem esperar o servidor. */
  const archiveInsight = useCallback(
    (id: string) => {
      mutate((current) => ({
        ...current,
        insights: current.insights.filter((insight) => insight.id !== id),
      }));
      void insightsApi.archive(id).catch(() => undefined);
    },
    [mutate],
  );

  /**
   * Puxar para atualizar pede a análise da semana. O servidor respeita o
   * intervalo mínimo entre análises, então chamar isso várias vezes não
   * gera várias chamadas de IA.
   */
  const refreshWithReview = useCallback(async () => {
    await insightsApi.weekly().catch(() => undefined);
    await refresh();
  }, [refresh]);

  return {
    ...resource,
    view,
    selectMonth: setRequestedMonth,
    switchingMonth,
    respond,
    busyId,
    actionError,
    archiveInsight,
    refreshWithReview,
  };
}
