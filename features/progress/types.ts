/** `rest`: dia sem ação principal no plano — descanso, não falha. */
export type WeekDayState = "done" | "today" | "miss" | "next" | "rest";

export type WeekDay = {
  label: string;
  state: WeekDayState;
};

export type Area = {
  name: string;
  /** Null quando a área ainda não tem ação com veredito no mês. */
  pct: number | null;
};

export type Trend = "up" | "down" | "flat" | "none";
