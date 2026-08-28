export type Task = {
  /** id da DailyAction no backend (cuid). */
  id: string;
  label: string;
  xp: number;
  done: boolean;
  /** Enquanto a conclusão está em voo, a linha fica inerte. */
  pending?: boolean;
};

export type RankingEntry = {
  rank: number;
  name: string;
  initial: string;
  xp: number;
  isCurrentUser?: boolean;
};
