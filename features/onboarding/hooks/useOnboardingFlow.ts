import { useCallback, useMemo, useState } from "react";
import type { AreaId, OnboardingAnswers, OnboardingStep, StarterPlan } from "../types";
import { localValidateOnboardingAnswer, messageForCode } from "../validation";

const STEPS: OnboardingStep[] = ["identity", "clarify", "motivation", "barriers", "plan", "start"];

// How many of the header's 5 segments each step fills. `clarify` is the
// design's "1b" sub-step, so it half-fills the segment after the first.
const PROGRESS: Record<OnboardingStep, { filled: number; partial?: number }> = {
  identity: { filled: 1 },
  clarify: { filled: 1, partial: 2 },
  motivation: { filled: 2 },
  barriers: { filled: 3 },
  plan: { filled: 4 },
  start: { filled: 5 },
};

// Passos de texto livre → chave da resposta. `clarify` (área) e `plan` não
// são texto e não passam pela validação.
const TEXT_STEP_KEY: Partial<Record<OnboardingStep, "identity" | "motivation" | "barriers">> = {
  identity: "identity",
  motivation: "motivation",
  barriers: "barriers",
};

const EMPTY_ANSWERS: OnboardingAnswers = {
  identity: "",
  motivation: "",
  barriers: "",
  area: null,
};

// Placeholder for the plan the backend will generate from the answers.
const STARTER_PLAN: StarterPlan = {
  summary: "Você quer se tornar alguém mais disciplinado e voltar a cuidar do seu corpo.",
  title: "Treinar 3x por semana",
  window: "Depois das 19h",
  normalDays: "Treino de 45 min",
  hardDays: "15 minutos já contam",
  missedDay: "Não compense. Apenas volte no próximo.",
};

type UseOnboardingFlowOptions = {
  onFinish: () => void;
  onExit: () => void;
};

export function useOnboardingFlow({ onFinish, onExit }: UseOnboardingFlowOptions) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  // Erro de validação do passo atual (só UX — o backend revalida e é a
  // autoridade final quando o onboarding é submetido).
  const [error, setError] = useState<string | null>(null);

  // `onFinish`/`onExit` mutate session state, so they have to stay out of the
  // setState updater — React may replay it during render.
  const goNext = useCallback(() => {
    const step = STEPS[index];
    const key = TEXT_STEP_KEY[step];

    if (key) {
      const result = localValidateOnboardingAnswer(answers[key]);
      if (!result.valid) {
        setError(messageForCode(result.code));
        return;
      }
    }
    setError(null);

    if (index === STEPS.length - 1) {
      onFinish();
      return;
    }
    setIndex(index + 1);
  }, [answers, index, onFinish]);

  const goBack = useCallback(() => {
    setError(null);
    if (index === 0) {
      onExit();
      return;
    }
    setIndex(index - 1);
  }, [index, onExit]);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setError(null);
    setAnswers((current) => ({ ...current, [key]: value }));
  }, []);

  const selectArea = useCallback((area: AreaId) => {
    setAnswers((current) => ({ ...current, area }));
  }, []);

  return useMemo(
    () => ({
      step: STEPS[index],
      progress: PROGRESS[STEPS[index]],
      answers,
      plan: STARTER_PLAN,
      error,
      setAnswer,
      selectArea,
      goNext,
      goBack,
    }),
    [answers, error, goBack, goNext, index, selectArea, setAnswer],
  );
}
