import type { CalendarDayState, ProgressMonthResponse } from "@/services/http/types";

export type MonthWeek = ProgressMonthResponse["weeks"][number];
export type CalendarDay = ProgressMonthResponse["calendar"][number];
export type { CalendarDayState };

/** "O Avant percebeu": uma proposta para responder ou um padrão para ler. */
export type Noticed =
  | {
      kind: "proposal";
      id: string;
      /** O hábito, em caixa alta no selo. */
      tag: string | null;
      period: string | null;
      title: string;
      body: string;
      suggestion: string | null;
      applyLabel: string;
      dismissLabel: string;
    }
  | {
      kind: "insight";
      id: string;
      tag: null;
      period: string | null;
      title: string;
      body: string;
    };

export type FollowUp = {
  summary: string;
  before: string;
  after: string;
  /** "Dois períodos de 14 dias", ou quanto da janela de depois já passou. */
  footnote: string;
};

export type RoutineHabit = {
  id: string;
  title: string;
  iconKey: string | null;
  subtitle: string;
  /** Barras do mês anterior contra o atual; nulas quando não há base. */
  bars: { previousLabel: string; currentLabel: string; previous: number; current: number } | null;
};

export type TimelineItem = {
  key: string;
  dateLabel: string;
  title: string;
  detail: string | null;
  kind: "ADJUSTMENT" | "FIRST_SESSION";
};
