import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { BarriersStep } from "@/features/onboarding/components/BarriersStep";
import { ClarifyStep } from "@/features/onboarding/components/ClarifyStep";
import { IdentityStep } from "@/features/onboarding/components/IdentityStep";
import { MotivationStep } from "@/features/onboarding/components/MotivationStep";
import { OnboardingCanvas } from "@/features/onboarding/components/OnboardingCanvas";
import { PlanStep } from "@/features/onboarding/components/PlanStep";
import { StartStep } from "@/features/onboarding/components/StartStep";
import { StepHeader } from "@/features/onboarding/components/StepHeader";
import { BARRIER_OTHER_MAX_LENGTH, composeBarriersAnswer, type BarrierId } from "@/features/onboarding/barriers";
import { useOnboardingFlow } from "@/features/onboarding/hooks/useOnboardingFlow";
import type { AreaId } from "@/features/onboarding/types";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const AREA_LABELS: Record<AreaId, string> = {
  saude: "saúde",
  rotina: "rotina",
  trabalho: "trabalho",
  estudos: "estudos",
  financas: "finanças",
  relacionamentos: "relacionamentos",
  criatividade: "criatividade",
  outro: "sua meta",
};

const SAMPLE_QUOTE = "Quero colocar minha vida nos eixos.";

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const { completeOnboarding, signOut } = useSession();
  const {
    step,
    progress,
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
  } = useOnboardingFlow({
    onFinish: completeOnboarding,
    onExit: signOut,
  });

  const quote = answers.identity.trim() || SAMPLE_QUOTE;
  const areaLabel = answers.area ? AREA_LABELS[answers.area] : "sua meta";

  // A lista de barreiras é estado da tela (sobrevive a voltar e avançar); o
  // fluxo só conhece o texto final que vai para a API.
  const [barrierChoices, setBarrierChoices] = useState<BarrierId[]>([]);
  const [barrierOther, setBarrierOther] = useState("");

  const updateBarriers = (choices: BarrierId[], other: string) => {
    setBarrierChoices(choices);
    setBarrierOther(other);
    setAnswer("barriers", composeBarriersAnswer(choices, other));
  };

  if (step === "start") {
    return (
      <OnboardingCanvas>
        <StatusBar style={isDark ? "light" : "dark"} />
        <StartStep onStart={goNext} habits={generatedPlan?.habits} />
      </OnboardingCanvas>
    );
  }

  return (
    <OnboardingCanvas>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <StepHeader
          filled={progress.filled}
          partial={progress.partial}
          onBack={goBack}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            {step === "identity" ? (
              <IdentityStep
                value={answers.identity}
                error={error}
                loading={submitting}
                onChangeText={(value) => setAnswer("identity", value)}
                onContinue={goNext}
              />
            ) : null}

            {step === "clarify" ? (
              <ClarifyStep
                quote={quote}
                selected={answers.area}
                onSelect={selectArea}
                onContinue={goNext}
              />
            ) : null}

            {step === "motivation" ? (
              <MotivationStep
                area={answers.area}
                areaLabel={areaLabel}
                value={answers.motivation}
                error={error}
                loading={submitting}
                onChangeText={(value) => setAnswer("motivation", value)}
                onContinue={goNext}
              />
            ) : null}

            {step === "barriers" ? (
              <BarriersStep
                selected={barrierChoices}
                other={barrierOther}
                error={error}
                loading={submitting}
                onToggle={(id) =>
                  updateBarriers(
                    barrierChoices.includes(id)
                      ? barrierChoices.filter((choice) => choice !== id)
                      : [...barrierChoices, id],
                    barrierOther,
                  )
                }
                onChangeOther={(value) => updateBarriers(barrierChoices, value.slice(0, BARRIER_OTHER_MAX_LENGTH))}
                onContinue={goNext}
              />
            ) : null}

            {step === "plan" ? (
              <PlanStep
                plan={plan}
                planLoading={planLoading}
                isFallback={planIsFallback}
                error={error}
                loading={submitting}
                onConfirm={goNext}
                values={planValues}
                onChange={setPlanEdit}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingCanvas>
  );
}
