import { useMemo } from "react";
import type { Area, WeekDay } from "../types";

// Ported 1:1 from the design's own local-state logic (`DCLogic`), which is
// the only data source for this screen for now (frontend-first pass, no
// backend wiring yet). Swapping in real data later only touches this file.
const WEEK: WeekDay[] = [
  { label: "S", state: "done" },
  { label: "T", state: "done" },
  { label: "Q", state: "done" },
  { label: "Q", state: "miss" },
  { label: "S", state: "done" },
  { label: "S", state: "today" },
  { label: "D", state: "next" },
];

const WEEKLY_DONE = 23;
const WEEKLY_TOTAL = 28;

const CONSISTENCY_PCT = 82;
const CONSISTENCY_DELTA_LABEL = "14% este mês";

const CHART_START_LABEL = "12 de mai";
const CHART_END_LABEL = "26 de mai";

const COMEBACK_PREVIOUS_LABEL = "3 dias";
const COMEBACK_CURRENT_LABEL = "1,4 dia";
const COMEBACK_RECOVERIES = 6;

const BEST_WINDOW_LABEL = "8h — 11h";

const AREAS: Area[] = [
  { name: "Saúde", pct: 85 },
  { name: "Foco", pct: 72 },
  { name: "Leitura", pct: 64 },
];

export function useProgressData() {
  return useMemo(
    () => ({
      week: WEEK,
      weeklyDone: WEEKLY_DONE,
      weeklyTotal: WEEKLY_TOTAL,
      consistencyPct: CONSISTENCY_PCT,
      consistencyDeltaLabel: CONSISTENCY_DELTA_LABEL,
      chartStartLabel: CHART_START_LABEL,
      chartEndLabel: CHART_END_LABEL,
      comebackPreviousLabel: COMEBACK_PREVIOUS_LABEL,
      comebackCurrentLabel: COMEBACK_CURRENT_LABEL,
      comebackRecoveries: COMEBACK_RECOVERIES,
      bestWindowLabel: BEST_WINDOW_LABEL,
      areas: AREAS,
    }),
    [],
  );
}
