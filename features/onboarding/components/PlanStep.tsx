import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import {
  CalendarDotIcon,
  CloudIcon,
  ComebackIcon,
  DumbbellIcon,
  HeartFilledIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { StarterPlan } from "../types";
import { PrimaryButton } from "./PrimaryButton";

type PlanStepProps = {
  plan: StarterPlan;
  onConfirm: () => void;
  onAdjust?: () => void;
};

type PlanRowProps = {
  icon: ReactNode;
  title: string;
  detail: string;
  // The "se você perder um dia" row is the one the design tints — it's the
  // rule people actually need to remember.
  tone?: "default" | "highlight";
};

function PlanRow({ icon, title, detail, tone = "default" }: PlanRowProps) {
  const { colors } = useTheme();
  const highlight = tone === "highlight";
  return (
    <View
      className="flex-row items-center"
      style={{
        gap: 13,
        paddingHorizontal: 18,
        paddingTop: highlight ? 13 : 12,
        paddingBottom: highlight ? 15 : 12,
        backgroundColor: highlight ? colors.emberChip : "transparent",
      }}
    >
      <View
        className="items-center justify-center rounded-[12px]"
        style={{ width: 36, height: 36, backgroundColor: highlight ? colors.surface : colors.emberChip }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 14, letterSpacing: -0.2, color: highlight ? colors.emberDeep : colors.textStrong }}
        >
          {title}
        </AppText>
        <AppText
          family="manrope"
          weight="semiBold"
          style={{ marginTop: 1, fontSize: 12.5, color: highlight ? colors.emberDeep : colors.textMuted }}
        >
          {detail}
        </AppText>
      </View>
    </View>
  );
}

export function PlanStep({ plan, onConfirm, onAdjust }: PlanStepProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-1" style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
      <View style={{ paddingHorizontal: 4 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ marginTop: 20, fontSize: 30, lineHeight: 32.5, letterSpacing: -1.3, color: colors.text }}
        >
          Seu ponto de partida
        </AppText>
        <View className="flex-row" style={{ marginTop: 10, gap: 9, maxWidth: 326 }}>
          <View style={{ marginTop: 2 }}>
            <SparkleIcon />
          </View>
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
          >
            {plan.summary}
          </AppText>
        </View>
      </View>

      <View
        className="overflow-hidden rounded-[26px]"
        style={{
          marginTop: 14,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.emberChip,
          boxShadow: `0 14px 34px ${colors.shadowStrong}`,
        }}
      >
        <View
          className="flex-row items-center"
          style={{
            gap: 13,
            paddingHorizontal: 18,
            paddingTop: 16,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.emberChip,
          }}
        >
          <View
            className="items-center justify-center rounded-[14px]"
            style={{ width: 42, height: 42, backgroundColor: colors.ember, boxShadow: `0 6px 14px ${colors.ember}47` }}
          >
            <DumbbellIcon />
          </View>
          <View className="flex-1">
            <AppText family="archivo" weight="black" style={{ fontSize: 18, letterSpacing: -0.5, color: colors.text }}>
              {plan.title}
            </AppText>
            <AppText family="manrope" weight="bold" style={{ marginTop: 2, fontSize: 12.5, color: colors.emberInk }}>
              {plan.window}
            </AppText>
          </View>
        </View>

        <PlanRow icon={<CalendarDotIcon />} title="Nos dias normais" detail={plan.normalDays} />
        <PlanRow icon={<CloudIcon />} title="Nos dias difíceis" detail={plan.hardDays} />
        <PlanRow icon={<ComebackIcon />} title="Se você perder um dia" detail={plan.missedDay} tone="highlight" />
      </View>

      <View
        className="flex-row rounded-[20px]"
        style={{ marginTop: 12, gap: 11, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: colors.emberWash }}
      >
        <View style={{ marginTop: 2 }}>
          <HeartFilledIcon />
        </View>
        <AppText family="manrope" weight="semiBold" style={{ flex: 1, fontSize: 12.5, lineHeight: 19, color: colors.emberDeep }}>
          Seu plano não precisa sobreviver aos dias perfeitos.{" "}
          <AppText family="manrope" weight="extraBold" style={{ fontSize: 12.5, lineHeight: 19, color: colors.emberDeep }}>
            Ele precisa sobreviver aos dias difíceis.
          </AppText>
        </AppText>
      </View>

      <View style={{ flex: 1, minHeight: 10 }} />

      <AppText
        family="archivo"
        weight="extraBold"
        style={{ marginBottom: 11, fontSize: 15, letterSpacing: -0.3, color: colors.textStrong }}
      >
        Isso faz sentido para você?
      </AppText>

      <PrimaryButton label="Sim, esse é meu plano" onPress={onConfirm} withArrow={false} />

      <Pressable onPress={onAdjust} className="items-center" style={{ marginTop: 12 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
          Quero ajustar
        </AppText>
      </Pressable>
    </View>
  );
}
