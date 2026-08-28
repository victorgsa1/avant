import { useCallback, useMemo, useRef, useState } from "react";
import { areasApi, habitsApi, onboardingApi, todayApi, usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { OnboardingQuestion } from "@/services/http/types";
import type { AreaId, OnboardingAnswers, OnboardingStep, StarterPlan } from "../types";
import {
  AREA_LABELS,
  buildStarterHabit,
  buildStarterPlan,
  weekdayFromApiDate,
} from "../planBuilder";
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

/** Passos de texto livre → campo local + pergunta correspondente na API. */
const TEXT_STEPS: Partial<
  Record<OnboardingStep, { key: "identity" | "motivation" | "barriers"; question: OnboardingQuestion }>
> = {
  identity: { key: "identity", question: "FUTURE_SELF" },
  motivation: { key: "motivation", question: "MOTIVATION" },
  barriers: { key: "barriers", question: "OBSTACLES" },
};

const EMPTY_ANSWERS: OnboardingAnswers = {
  identity: "",
  motivation: "",
  barriers: "",
  area: null,
};

type UseOnboardingFlowOptions = {
  onFinish: () => void;
  onExit: () => void;
};

/**
 * Fluxo do onboarding.
 *
 * Cada resposta de texto é validada localmente (UX) e depois enviada para
 * `POST /v1/onboarding/answers`, que é a autoridade — inclusive para o
 * cooldown após 3 tentativas inválidas. Nada de IA em nenhum ponto: o
 * plano inicial é derivado deterministicamente da área escolhida.
 */
export function useOnboardingFlow({ onFinish, onExit }: UseOnboardingFlowOptions) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Evita reenviar ao servidor uma resposta já aceita quando a pessoa
  // volta e avança de novo sem editar.
  const acceptedText = useRef<Partial<Record<OnboardingQuestion, string>>>({});

  const step = STEPS[index];

  const advance = useCallback(() => {
    setError(null);
    setIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }, []);

  /** Valida no cliente, envia ao backend e avança se for aceita. */
  const submitTextStep = useCallback(
    async (key: "identity" | "motivation" | "barriers", question: OnboardingQuestion) => {
      const text = answers[key];

      const local = localValidateOnboardingAnswer(text);
      if (!local.valid) {
        setError(messageForCode(local.code));
        return;
      }

      if (acceptedText.current[question] === text.trim()) {
        advance();
        return;
      }

      setSubmitting(true);
      try {
        const result = await onboardingApi.submit(question, text);
        if (!result.accepted) {
          // O backend manda a mensagem genérica pronta; não inventamos outra.
          const suffix =
            result.cooldownSeconds && result.code === "COOLDOWN"
              ? ` (${result.cooldownSeconds}s)`
              : "";
          setError(`${result.message}${suffix}`);
          return;
        }
        acceptedText.current[question] = text.trim();
        advance();
      } catch (requestError) {
        setError(userMessage(requestError));
      } finally {
        setSubmitting(false);
      }
    },
    [advance, answers],
  );

  /** Grava identidade, área e primeiro hábito. Só roda ao confirmar o plano. */
  const commitPlan = useCallback(async () => {
    setSubmitting(true);
    try {
      await usersApi.putIdentity({
        statement: answers.identity.trim(),
        whyItMatters: answers.motivation.trim() || undefined,
      });

      const area = await areasApi.create({
        name: AREA_LABELS[answers.area ?? "outro"],
        whyImportant: answers.motivation.trim() || undefined,
      });

      // O "hoje" que vale é o do servidor (timezone das preferências), não
      // o do aparelho — senão o primeiro movimento pode cair fora do dia.
      const today = await todayApi.get();
      await habitsApi.create(
        buildStarterHabit(answers.area, weekdayFromApiDate(today.date), area.id),
      );
      advance();
    } catch (requestError) {
      setError(userMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }, [advance, answers]);

  const goNext = useCallback(() => {
    if (submitting) return;

    const textStep = TEXT_STEPS[step];
    if (textStep) {
      void submitTextStep(textStep.key, textStep.question);
      return;
    }

    if (step === "plan") {
      void commitPlan();
      return;
    }

    if (step === "start") {
      onFinish();
      return;
    }

    advance();
  }, [advance, commitPlan, onFinish, step, submitTextStep, submitting]);

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

  const plan: StarterPlan = useMemo(
    () => buildStarterPlan(answers.area, answers.identity),
    [answers.area, answers.identity],
  );

  return useMemo(
    () => ({
      step,
      progress: PROGRESS[step],
      answers,
      plan,
      error,
      submitting,
      setAnswer,
      selectArea,
      goNext,
      goBack,
    }),
    [answers, error, goBack, goNext, plan, selectArea, setAnswer, step, submitting],
  );
}
