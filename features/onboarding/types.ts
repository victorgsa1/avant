export type AreaId = "saude" | "rotina" | "trabalho" | "estudos" | "financas" | "relacionamentos" | "outro";

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

// The generated plan the "ponto de partida" step reviews. Static for now —
// it becomes the shape the planning endpoint returns.
export type StarterPlan = {
  summary: string;
  title: string;
  window: string;
  normalDays: string;
  hardDays: string;
  missedDay: string;
};
