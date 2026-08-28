import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AnswerField } from "./AnswerField";
import { IdentityArt } from "./illustrations";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type IdentityStepProps = {
  value: string;
  error?: string | null;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onContinue: () => void;
};

export function IdentityStep({ value, onChangeText, onContinue, error, loading }: IdentityStepProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 px-6" style={{ paddingBottom: 34 }}>
      <View style={{ marginTop: 22, width: 150, height: 96 }}>
        <IdentityArt />
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 14, fontSize: 31, lineHeight: 34, letterSpacing: -1.3, color: colors.text }}
      >
        Quem você quer se tornar?
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 12, maxWidth: 320, fontSize: 14.5, lineHeight: 22.5, color: colors.textMuted }}
      >
        Pense em você daqui a um ano. O que gostaria de ter mudado em quem você é ou em como vive?
      </AppText>

      <View style={{ marginTop: 26 }}>
        <AnswerField
          value={value}
          error={error}
          onChangeText={onChangeText}
          placeholder="Conte do seu jeito..."
          hint="Sem resposta certa"
        />
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />

      <AppText
        family="manrope"
        weight="medium"
        style={{
          paddingHorizontal: 14,
          textAlign: "center",
          fontSize: 12.5,
          lineHeight: 19.5,
          color: colors.textMuted,
        }}
      >
        Você não precisa mudar tudo hoje. Só precisa começar na direção certa.
      </AppText>

      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="Continuar" loading={loading} onPress={onContinue} />
      </View>
    </View>
  );
}
