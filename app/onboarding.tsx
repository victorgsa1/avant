import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
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
import { useOnboardingFlow } from "@/features/onboarding/hooks/useOnboardingFlow";
import { AREA_LABELS } from "@/features/onboarding/planBuilder";

// Shown in the "Você disse" callback before the person has typed anything —
// the design's own sample answer.
const SAMPLE_QUOTE = "Quero colocar minha vida nos eixos.";

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const { completeOnboarding, signOut } = useSession();
  const { step, progress, answers, plan, error, submitting, setAnswer, selectArea, goNext, goBack } =
    useOnboardingFlow({
      onFinish: completeOnboarding,
      onExit: () => void signOut(),
    });

  const quote = answers.identity.trim() || SAMPLE_QUOTE;
  const areaLabel = answers.area ? AREA_LABELS[answers.area].toLowerCase() : "sua meta";

  if (step === "start") {
    return (
      <OnboardingCanvas>
        <StatusBar style={isDark ? "light" : "dark"} />
        <StartStep onStart={goNext} />
      </OnboardingCanvas>
    );
  }

  return (
    <OnboardingCanvas>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <StepHeader filled={progress.filled} partial={progress.partial} onBack={goBack} />

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
              <ClarifyStep quote={quote} selected={answers.area} onSelect={selectArea} onContinue={goNext} />
            ) : null}

            {step === "motivation" ? (
              <MotivationStep
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
                value={answers.barriers}
                error={error}
                loading={submitting}
                onChangeText={(value) => setAnswer("barriers", value)}
                onContinue={goNext}
              />
            ) : null}

            {step === "plan" ? (
              <PlanStep plan={plan} error={error} loading={submitting} onConfirm={goNext} onAdjust={goBack} />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingCanvas>
  );
}
