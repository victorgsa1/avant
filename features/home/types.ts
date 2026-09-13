export type Task = {
  /** id da DailyAction no backend (cuid). */
  id: string;
  label: string;
  /** Desenho escolhido na criação do plano; null nos hábitos antigos. */
  iconKey: string | null;
  xp: number;
  done: boolean;
  /** Enquanto a conclusão está em voo, a linha fica inerte. */
  pending?: boolean;
};
