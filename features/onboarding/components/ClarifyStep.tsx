import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import {
  BarsIcon,
  BookIcon,
  BriefcaseIcon,
  ClockIcon,
  HeartIcon,
  PeopleIcon,
  PlusThinIcon,
  QuoteIcon,
} from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AreaId } from "../types";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type IconComponent = ComponentType<{ size?: number; color?: string }>;

const AREAS: { id: AreaId; label: string; Icon: IconComponent }[] = [
  { id: "saude", label: "Saúde", Icon: HeartIcon },
  { id: "rotina", label: "Rotina", Icon: ClockIcon },
  { id: "trabalho", label: "Trabalho", Icon: BriefcaseIcon },
  { id: "estudos", label: "Estudos", Icon: BookIcon },
  { id: "financas", label: "Finanças", Icon: BarsIcon },
  { id: "relacionamentos", label: "Relacionamentos", Icon: PeopleIcon },
];

type ClarifyStepProps = {
  quote: string;
  selected: AreaId | null;
  onSelect: (area: AreaId) => void;
  onContinue: () => void;
};

export function ClarifyStep({ quote, selected, onSelect, onContinue }: ClarifyStepProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 px-6" style={{ paddingBottom: 34 }}>
      <View
        className="flex-row rounded-[20px]"
        style={{ marginTop: 26, gap: 11, padding: 14, paddingHorizontal: 16, backgroundColor: colors.emberTint }}
      >
        <View style={{ marginTop: 3 }}>
          <QuoteIcon />
        </View>
        <View className="flex-1">
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberInk }}>
            Você disse
          </AppText>
          <AppText
            family="archivo"
            weight="bold"
            style={{ marginTop: 3, fontSize: 14.5, lineHeight: 20, letterSpacing: -0.2, color: colors.textStrong }}
          >
            {quote}
          </AppText>
        </View>
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 22, fontSize: 31, lineHeight: 34, letterSpacing: -1.3, color: colors.text }}
      >
        Por onde você quer começar?
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 10, maxWidth: 320, fontSize: 14.5, lineHeight: 22.5, color: colors.textMuted }}
      >
        Escolha a área que mais pesa hoje. Dá para acrescentar outras depois.
      </AppText>

      <View className="flex-row flex-wrap" style={{ marginTop: 22, gap: 9 }}>
        {AREAS.map(({ id, label, Icon }) => {
          const active = selected === id;
          return (
            <Pressable key={id} onPress={() => onSelect(id)}>
              <View
                className="flex-row items-center rounded-[18px]"
                style={{
                  gap: 9,
                  paddingVertical: 13,
                  paddingHorizontal: 17,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? colors.ember : colors.line,
                  backgroundColor: active ? colors.emberTint : colors.surface,
                }}
              >
                <Icon size={16} color={active ? colors.emberInk : colors.emberWarm} />
                <AppText
                  family="archivo"
                  weight={active ? "extraBold" : "bold"}
                  style={{ fontSize: 14.5, letterSpacing: -0.2, color: active ? colors.emberDeep : colors.textStrong }}
                >
                  {label}
                </AppText>
              </View>
            </Pressable>
          );
        })}

        <Pressable onPress={() => onSelect("outro")}>
          <View
            className="flex-row items-center rounded-[18px]"
            style={{
              gap: 9,
              paddingVertical: 13,
              paddingHorizontal: 17,
              borderWidth: selected === "outro" ? 1.5 : 1,
              borderColor: selected === "outro" ? colors.ember : colors.lineStrong,
              borderStyle: selected === "outro" ? "solid" : "dashed",
              backgroundColor: selected === "outro" ? colors.emberTint : "transparent",
            }}
          >
            <PlusThinIcon size={15} color={selected === "outro" ? colors.emberInk : colors.textFaint} />
            <AppText
              family="archivo"
              weight="bold"
              style={{ fontSize: 14.5, letterSpacing: -0.2, color: selected === "outro" ? colors.emberDeep : colors.textMuted }}
            >
              Outro
            </AppText>
          </View>
        </Pressable>
      </View>

      <View style={{ flex: 1, minHeight: 18 }} />

      <PrimaryButton label="Continuar" onPress={onContinue} />
    </View>
  );
}
