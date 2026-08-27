import { useCallback, useMemo, useState } from "react";
import type { AreaId, OnboardingAnswers, OnboardingStep, StarterPlan } from "../types";

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

  // `onFinish`/`onExit` mutate session state, so they have to stay out of the
  // setState updater — React may replay it during render.
  const goNext = useCallback(() => {
    if (index === STEPS.length - 1) {
      onFinish();
      return;
    }
    setIndex(index + 1);
  }, [index, onFinish]);

  const goBack = useCallback(() => {
    if (index === 0) {
      onExit();
      return;
    }
    setIndex(index - 1);
  }, [index, onExit]);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
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
      setAnswer,
      selectArea,
      goNext,
      goBack,
    }),
    [answers, goBack, goNext, index, selectArea, setAnswer],
  );
}
