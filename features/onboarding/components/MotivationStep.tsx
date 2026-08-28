import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AnswerField } from "./AnswerField";
import { HealthArt } from "./illustrations";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type MotivationStepProps = {
  areaLabel: string;
  value: string;
  error?: string | null;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onContinue: () => void;
};

export function MotivationStep({ areaLabel, value, onChangeText, onContinue, error, loading }: MotivationStepProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 px-6" style={{ paddingBottom: 34 }}>
      <View className="flex-row items-end justify-between" style={{ marginTop: 22, gap: 16 }}>
        <View className="flex-row items-center" style={{ gap: 8, paddingBottom: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ember }} />
          <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: colors.emberInk }}>
            Sobre {areaLabel}
          </AppText>
        </View>
        <HealthArt />
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 10, fontSize: 31, lineHeight: 34, letterSpacing: -1.3, color: colors.text }}
      >
        Por que isso é importante para você?
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 12, maxWidth: 322, fontSize: 14.5, lineHeight: 22.5, color: colors.textMuted }}
      >
        Não precisa ter uma resposta perfeita. Só queremos entender o que existe por trás dessa mudança.
      </AppText>

      <View style={{ marginTop: 24 }}>
        <AnswerField
          value={value}
          error={error}
          onChangeText={onChangeText}
          placeholder="Isso é importante para mim porque..."
          hint="Sem resposta certa"
        />
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />

      <PrimaryButton label="Continuar" loading={loading} onPress={onContinue} />
    </View>
  );
}
