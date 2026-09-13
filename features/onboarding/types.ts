export type AreaId =
  | "saude"
  | "rotina"
  | "trabalho"
  | "estudos"
  | "financas"
  | "relacionamentos"
  | "criatividade"
  | "outro";

export type Area = {
  id: AreaId;
  label: string;
};

export type OnboardingStep = "identity" | "clarify" | "motivation" | "barriers" | "plan" | "start";

export type OnboardingAnswers = {
  identity: string;
  motivation: string;
  barriers: string;
  area: AreaId | null;
};

/** O que a tela de confirmação deixa corrigir na principal. */
export type PlanEdits = {
  title: string;
  weeklyTarget: number;
  /** Minuto do dia: 19h30 é 1170. */
  startMinute: number;
};

// O plano que o passo "ponto de partida" revisa: a prévia do servidor
// (IA a partir da fala da pessoa) ou, se ela falhar, o blueprint local.
export type StarterPlan = {
  summary: string;
  /** Rótulo da área da principal ("Criatividade", "Saúde"...). */
  areaName: string;
  title: string;
  window: string;
  normalDays: string;
  hardDays: string;
  missedDay: string;
  /** As ações complementares que acompanham a principal. */
  extras: { title: string; detail: string }[];
  /** A base dos ajustes: o que a pessoa pode corrigir antes de confirmar. */
  primary: PlanEdits;
};
