import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { HeartFilledIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { PeakArt } from "./illustrations";
import { PrimaryButton } from "./PrimaryButton";

// The closing screen has no progress header — the flow is done, so the only
// chrome is the art and a single CTA.
export function StartStep({ onStart }: { onStart: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <View
        className="flex-1 items-center px-[30px]"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      >
        <View style={{ flex: 1, minHeight: 20 }} />

        <View style={{ width: 240, height: 196 }}>
          <PeakArt />
        </View>

        <AppText
          family="archivo"
          weight="black"
          style={{
            marginTop: 24,
            fontSize: 40,
            lineHeight: 42,
            letterSpacing: -1.8,
            textAlign: "center",
            color: colors.text,
          }}
        >
          Esse é o começo.
        </AppText>

        <View style={{ marginTop: 14, maxWidth: 264 }}>
          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 15, lineHeight: 24, textAlign: "center", color: colors.textMuted }}
          >
            Você já escolheu a direção. Não precisa mudar sua vida inteira hoje.
          </AppText>
          <AppText
            family="manrope"
            weight="extraBold"
            style={{ marginTop: 8, fontSize: 15, lineHeight: 24, textAlign: "center", color: colors.emberInk }}
          >
            Só não pare de avançar.
          </AppText>
        </View>

        <View
          className="flex-row items-center rounded-full"
          style={{
            marginTop: 26,
            gap: 8,
            paddingVertical: 9,
            paddingHorizontal: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <HeartFilledIcon size={14} color={colors.ember} />
          <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.textMuted }}>
            Seu primeiro passo está pronto
          </AppText>
        </View>

        <View style={{ flex: 1.2, minHeight: 26 }} />

        <View className="w-full">
          <PrimaryButton label="Começar" onPress={onStart} withArrow={false} emphasis="strong" />
        </View>
      </View>
    </View>
  );
}
