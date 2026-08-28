import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ShineIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AnswerField } from "./AnswerField";
import { PathArt } from "./illustrations";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type BarriersStepProps = {
  value: string;
  error?: string | null;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onContinue: () => void;
};

export function BarriersStep({ value, onChangeText, onContinue, error, loading }: BarriersStepProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 px-6" style={{ paddingBottom: 34 }}>
      <View style={{ marginTop: 24 }}>
        <PathArt />
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 14, fontSize: 31, lineHeight: 34, letterSpacing: -1.3, color: colors.text }}
      >
        O que costuma te tirar do caminho?
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 12, maxWidth: 322, fontSize: 14.5, lineHeight: 22.5, color: colors.textMuted }}
      >
        Quando você tenta mudar alguma coisa, o que normalmente faz você parar?
      </AppText>

      <View style={{ marginTop: 24 }}>
        <AnswerField
          height={172}
          value={value}
          error={error}
          onChangeText={onChangeText}
          placeholder="Pode ser procrastinação, falta de tempo, cansaço, perder um dia e desistir..."
          hint="Seja honesto — isso muda seu plano"
        />
      </View>

      <View style={{ flex: 1, minHeight: 18 }} />

      <View className="flex-row items-center justify-center" style={{ gap: 9, marginBottom: 14 }}>
        <ShineIcon color={colors.emberMid} />
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          O Avant monta seu plano agora
        </AppText>
      </View>

      <PrimaryButton label="Criar meu plano" loading={loading} onPress={onContinue} emphasis="strong" />
    </View>
  );
}
