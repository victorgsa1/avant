import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon, ShineIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AnswerField } from "./AnswerField";
import { ONBOARDING_ART } from "../art";
import { BARRIER_OPTIONS, BARRIER_OTHER_MAX_LENGTH, type BarrierId } from "../barriers";

type BarriersStepProps = {
  selected: readonly BarrierId[];
  other: string;
  error?: string | null;
  loading?: boolean;
  onToggle: (id: BarrierId) => void;
  onChangeOther: (value: string) => void;
  onContinue: () => void;
};

/** Relógio na frente, caderno inclinado atrás — o mesmo arranjo do design. */
function BarriersArt() {
  return (
    <View style={{ width: 112, height: 96 }}>
      <Image
        source={ONBOARDING_ART.caderno}
        resizeMode="contain"
        style={{ position: "absolute", right: 0, top: 6, width: 54, height: 62, transform: [{ rotate: "10deg" }] }}
      />
      <Image
        source={ONBOARDING_ART.relogio}
        resizeMode="contain"
        style={{ position: "absolute", left: 0, bottom: 0, width: 82, height: 88 }}
      />
    </View>
  );
}

function BarrierOption({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      haptic="selection"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onPress}
    >
      <View
        className="flex-row items-center justify-between"
        style={{
          gap: 12,
          paddingVertical: 15,
          paddingLeft: 18,
          paddingRight: 15,
          borderRadius: 18,
          borderWidth: checked ? 1.5 : 1,
          borderColor: checked ? colors.ember : colors.line,
          backgroundColor: checked ? colors.emberTint : colors.surface,
        }}
      >
        <AppText
          family="manrope"
          weight={checked ? "bold" : "semiBold"}
          style={{ flex: 1, fontSize: 15, color: checked ? colors.emberDeep : colors.textStrong }}
        >
          {label}
        </AppText>
        <View
          className="items-center justify-center"
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            borderWidth: checked ? 0 : 1.5,
            borderColor: colors.lineStrong,
            backgroundColor: checked ? colors.ember : "transparent",
          }}
        >
          {checked ? <CheckmarkIcon size={13} color={colors.onEmber} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function BarriersStep({
  selected,
  other,
  error,
  loading,
  onToggle,
  onChangeOther,
  onContinue,
}: BarriersStepProps) {
  const { colors } = useTheme();
  const empty = selected.length === 0 && other.trim().length === 0;

  return (
    <View className="flex-1 px-6" style={{ paddingBottom: 34 }}>
      <View className="flex-row items-center" style={{ marginTop: 22, gap: 12 }}>
        <View className="flex-1">
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 31, lineHeight: 34, letterSpacing: -1.3, color: colors.text }}
          >
            O que costuma atrapalhar?
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 10, fontSize: 14.5, lineHeight: 22.5, color: colors.textMuted }}
          >
            Pode escolher mais de uma opção.
          </AppText>
        </View>
        <BarriersArt />
      </View>

      <View style={{ marginTop: 22, gap: 9 }}>
        {BARRIER_OPTIONS.map((option) => (
          <BarrierOption
            key={option.id}
            label={option.label}
            checked={selected.includes(option.id)}
            onPress={() => onToggle(option.id)}
          />
        ))}

        <AnswerField
          compact
          value={other}
          error={error}
          onChangeText={onChangeOther}
          placeholder="Outro motivo..."
          hint=""
          maxLength={BARRIER_OTHER_MAX_LENGTH}
        />
      </View>

      <View style={{ flex: 1, minHeight: 18 }} />

      <View className="flex-row items-center justify-center" style={{ gap: 9, marginBottom: 14 }}>
        <ShineIcon color={colors.emberMid} />
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          O Avant monta seu plano agora
        </AppText>
      </View>

      <PrimaryButton
        label="Criar meu plano"
        loading={loading}
        disabled={empty}
        onPress={onContinue}
        emphasis="strong"
      />
    </View>
  );
}
