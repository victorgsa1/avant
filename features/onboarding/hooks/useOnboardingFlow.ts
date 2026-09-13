import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onboardingApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { GeneratedPlanResponse, OnboardingQuestion } from "@/services/http/types";
import type { AreaId, OnboardingAnswers, OnboardingStep, PlanEdits, StarterPlan } from "../types";
import { buildStarterPlan, starterPlanFromPreview, suggestAreaFromText } from "../planBuilder";
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
 * cooldown após 3 tentativas inválidas. O plano mostrado no fim é a
 * prévia do servidor (IA a partir da fala da pessoa); a área escolhida é
 * só uma dica, e o blueprint local da área entra se a prévia falhar.
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

  // A área é dica para o gerador, não uma pergunta obrigatória. Quando a
  // fala já diz qual é ("quero voltar a correr"), a tela de área não tem o
  // que desempatar — então ela não aparece.
  const suggestedArea = useMemo(() => suggestAreaFromText(answers.identity), [answers.identity]);

  const advance = useCallback(() => {
    setError(null);
    setIndex((current) => {
      const next = Math.min(current + 1, STEPS.length - 1);
      return STEPS[next] === "clarify" && suggestedArea ? next + 1 : next;
    });
  }, [suggestedArea]);

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

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanResponse | null>(null);

  // O que a pessoa corrigiu no card antes de confirmar. Só os campos
  // tocados: o resto continua sendo o plano que o servidor montou.
  const [planEdits, setPlanEdits] = useState<Partial<PlanEdits>>({});

  const setPlanEdit = useCallback((patch: Partial<PlanEdits>) => {
    setPlanEdits((current) => ({ ...current, ...patch }));
  }, []);

  /**
   * Confirmar o plano manda as respostas para o servidor montar tudo:
   * identidade, áreas e hábitos com versão mínima.
   *
   * O trabalho é do backend de propósito. É lá que a IA estrutura o texto
   * livre em ações concretas — e é lá que o saneamento determinístico
   * decide o que dessa estrutura vira hábito de verdade. Se a IA não
   * responder, o mesmo endpoint entrega o plano determinístico, então o
   * onboarding nunca trava por causa dela.
   */
  const commitPlan = useCallback(async () => {
    setSubmitting(true);
    try {
      const hasEdits = Object.keys(planEdits).length > 0;
      const plan = await onboardingApi.generatePlan(
        answers.area ?? "outro",
        hasEdits ? planEdits : undefined,
      );
      setGeneratedPlan(plan);
      advance();
    } catch (requestError) {
      setError(userMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }, [advance, answers.area, planEdits]);

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
    const previous = index - 1;
    // Voltar nunca cai numa tela que não chegou a aparecer.
    setIndex(STEPS[previous] === "clarify" && suggestedArea ? previous - 1 : previous);
  }, [index, onExit, suggestedArea]);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setError(null);
    setAnswers((current) => ({ ...current, [key]: value }));
  }, []);

  const selectArea = useCallback((area: AreaId) => {
    setAnswers((current) => ({ ...current, area }));
  }, []);

  // A sugestão vale assim que a fala permite ("guitarrista" → Criatividade),
  // seja para pular a tela de área, seja para deixá-la pré-marcada quando a
  // pessoa chega nela. Escolha manual sempre ganha da sugestão.
  useEffect(() => {
    if (!suggestedArea || answers.area) return;
    setAnswers((current) => ({ ...current, area: suggestedArea }));
  }, [answers.area, suggestedArea]);

  /**
   * Prévia do plano: a IA estrutura o que a pessoa ESCREVEU (a área é só
   * dica) e o servidor guarda o rascunho — "Sim, esse é meu plano" grava
   * exatamente o que foi mostrado. Refaz quando as respostas mudam.
   */
  const [preview, setPreview] = useState<{ key: string; plan: StarterPlan | null } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewKey = JSON.stringify([answers.area, answers.identity, answers.motivation, answers.barriers]);

  useEffect(() => {
    if (step !== "plan" || preview?.key === previewKey) return;

    let cancelled = false;
    setPreviewLoading(true);
    onboardingApi
      .previewPlan(answers.area ?? "outro")
      .then((response) => starterPlanFromPreview(response, answers.identity))
      .catch(() => null)
      .then((plan) => {
        if (cancelled) return;
        setPreview({ key: previewKey, plan });
        setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `previewKey` já resume área e respostas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, step]);

  // Se a prévia do servidor falhar, o blueprint local da área segura a tela.
  const plan: StarterPlan = useMemo(
    () => preview?.plan ?? buildStarterPlan(answers.area, answers.identity),
    [answers.area, answers.identity, preview],
  );
  const planLoading = step === "plan" && (previewLoading || preview?.key !== previewKey);
  const planIsFallback = !planLoading && preview?.plan === null;

  // Plano novo é base nova: um ajuste feito sobre outro plano não vale mais.
  useEffect(() => {
    setPlanEdits({});
  }, [previewKey]);

  /** O plano como está na tela: o do servidor com as correções por cima. */
  const planValues: PlanEdits = useMemo(
    () => ({ ...plan.primary, ...planEdits }),
    [plan.primary, planEdits],
  );

  return useMemo(
    () => ({
      step,
      progress: PROGRESS[step],
      answers,
      plan,
      planLoading,
      planIsFallback,
      planValues,
      setPlanEdit,
      generatedPlan,
      error,
      submitting,
      setAnswer,
      selectArea,
      goNext,
      goBack,
    }),
    [
      answers,
      error,
      generatedPlan,
      goBack,
      goNext,
      planValues,
      setPlanEdit,
      plan,
      planIsFallback,
      planLoading,
      selectArea,
      setAnswer,
      step,
      submitting,
    ],
  );
}
