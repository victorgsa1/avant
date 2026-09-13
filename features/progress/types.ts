// A semana é a mesma leitura na Hoje e no Progresso: um tipo só, mora junto
// do componente que a desenha.
export type { WeekDay, WeekDayState } from "@/components/ui/WeekStrip";

export type Area = {
  name: string;
  /** Null quando a área ainda não tem ação com veredito no mês. */
  pct: number | null;
};

export type Trend = "up" | "down" | "flat" | "none";
