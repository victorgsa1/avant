import { useState, type ComponentType, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import {
  BarsIcon,
  BookIcon,
  BriefcaseIcon,
  CalendarDotIcon,
  ClockIcon,
  CloudIcon,
  ComebackIcon,
  DumbbellIcon,
  HeartFilledIcon,
  MinusIcon,
  MusicIcon,
  PeopleIcon,
  PlusLineIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { windowFromMinute } from "../planBuilder";
import type { PlanEdits, StarterPlan } from "../types";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type PlanStepProps = {
  plan: StarterPlan;
  /** A prévia do servidor ainda está sendo montada. */
  planLoading?: boolean;
  /** A prévia falhou e o card mostra o plano padrão da área. */
  isFallback?: boolean;
  error?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  /** O plano como está na tela — o do servidor com as correções por cima. */
  values: PlanEdits;
  onChange: (patch: Partial<PlanEdits>) => void;
};

/** "19h30" — o horário que a pessoa escolheu para o compromisso. */
function timeLabel(startMinute: number): string {
  const hours = Math.floor(startMinute / 60);
  const minutes = startMinute % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

type IconComponent = ComponentType<{ size?: number; color?: string }>;

const AREA_ICONS: Record<string, IconComponent> = {
  Saúde: DumbbellIcon,
  Rotina: ClockIcon,
  Trabalho: BriefcaseIcon,
  Estudos: BookIcon,
  Finanças: BarsIcon,
  Relacionamentos: PeopleIcon,
  Criatividade: MusicIcon,
};

function PlanLoading() {
  const { colors } = useTheme();
  return (
    <View
      className="items-center justify-center rounded-[26px]"
      style={{
        marginTop: 14,
        gap: 14,
        paddingVertical: 48,
        paddingHorizontal: 24,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.emberChip,
      }}
    >
      <ActivityIndicator color={colors.ember} />
      <AppText
        family="manrope"
        weight="semiBold"
        style={{ textAlign: "center", fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
      >
        Entendendo o que você disse e montando seu plano…
      </AppText>
    </View>
  );
}

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

/** O card do plano (principal + versões) e as complementares, se houver. */
function PlanDetails({
  plan,
  isFallback,
  values,
}: {
  plan: StarterPlan;
  isFallback?: boolean;
  values: PlanEdits;
}) {
  const { colors } = useTheme();
  const AreaIcon = AREA_ICONS[plan.areaName] ?? SparkleIcon;
  return (
    <>
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
            <AreaIcon size={20} color={colors.onEmber} />
          </View>
          <View className="flex-1">
            {/* Título, horário e frequência saem do que está na tela: editar
                em cima muda o card embaixo, sem confirmar nada ainda. */}
            <AppText family="archivo" weight="black" style={{ fontSize: 18, letterSpacing: -0.5, color: colors.text }}>
              {values.title}
            </AppText>
            <AppText family="manrope" weight="bold" style={{ marginTop: 2, fontSize: 12.5, color: colors.emberInk }}>
              {plan.areaName} · {windowFromMinute(values.startMinute)} · {values.weeklyTarget}x por semana
            </AppText>
          </View>
        </View>

        <PlanRow icon={<CalendarDotIcon />} title="Nos dias normais" detail={plan.normalDays} />
        <PlanRow icon={<CloudIcon />} title="Nos dias difíceis" detail={plan.hardDays} />
        <PlanRow icon={<ComebackIcon />} title="Se você perder um dia" detail={plan.missedDay} tone="highlight" />
      </View>

      {plan.extras.length > 0 ? (
        <View
          className="rounded-[20px]"
          style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, gap: 10, backgroundColor: colors.surface }}
        >
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.textFaint }}>
            Para acompanhar (opcional, sem XP)
          </AppText>
          {plan.extras.map((extra) => (
            <View key={extra.title}>
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.textStrong }}>
                {extra.title}
              </AppText>
              <AppText family="manrope" weight="semiBold" style={{ marginTop: 1, fontSize: 12, color: colors.textMuted }}>
                {extra.detail}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {isFallback ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 10, paddingHorizontal: 4, fontSize: 12, lineHeight: 17, color: colors.textFaint }}
        >
          Não conseguimos personalizar agora, então este é o plano padrão da área. Dá para ajustar depois.
        </AppText>
      ) : null}
    </>
  );
}

function StepperRow({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const { colors } = useTheme();
  const round = (icon: ReactNode, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      haptic="selection"
      className="items-center justify-center rounded-full"
      style={{ width: 36, height: 36, borderWidth: 1.3, borderColor: colors.lineStrong }}
    >
      {icon}
    </Pressable>
  );

  return (
    <View className="flex-row items-center justify-between" style={{ paddingTop: 14 }}>
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 13.5, color: colors.textMuted }}>
        {label}
      </AppText>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        {round(<MinusIcon size={18} color={colors.textStrong} />, onDecrease)}
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ minWidth: 86, textAlign: "center", fontSize: 15, color: colors.text }}
        >
          {value}
        </AppText>
        {round(<PlusLineIcon size={18} color={colors.textStrong} />, onIncrease)}
      </View>
    </View>
  );
}

/**
 * Corrigir o plano aqui mesmo.
 *
 * Antes, "Quero ajustar" voltava uma pergunta: para mudar a atividade, a
 * pessoa tinha que reformular a própria história até a IA devolver outra
 * coisa. Atividade, frequência e horário são correções diretas — e é isso
 * que "Sim, esse é meu plano" grava.
 */
function PlanEditor({
  values,
  onChange,
}: {
  values: PlanEdits;
  onChange: (patch: Partial<PlanEdits>) => void;
}) {
  const { colors } = useTheme();
  const wrapMinute = (minute: number) => (minute + 24 * 60) % (24 * 60);

  return (
    <View
      className="rounded-[22px]"
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      <TextField
        label="Atividade"
        value={values.title}
        onChangeText={(title) => onChange({ title })}
        maxLength={80}
      />
      <StepperRow
        label="Vezes por semana"
        value={`${values.weeklyTarget}x`}
        onDecrease={() => onChange({ weeklyTarget: Math.max(1, values.weeklyTarget - 1) })}
        onIncrease={() => onChange({ weeklyTarget: Math.min(7, values.weeklyTarget + 1) })}
      />
      <StepperRow
        label="Começa às"
        value={timeLabel(values.startMinute)}
        onDecrease={() => onChange({ startMinute: wrapMinute(values.startMinute - 30) })}
        onIncrease={() => onChange({ startMinute: wrapMinute(values.startMinute + 30) })}
      />
    </View>
  );
}

export function PlanStep({
  plan,
  planLoading,
  isFallback,
  error,
  loading,
  onConfirm,
  values,
  onChange,
}: PlanStepProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
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

      {planLoading ? <PlanLoading /> : <PlanDetails plan={plan} isFallback={isFallback} values={values} />}

      {!planLoading && editing ? <PlanEditor values={values} onChange={onChange} /> : null}

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

      {error ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginBottom: 10, textAlign: "center", fontSize: 12.5, lineHeight: 18, color: colors.danger }}
        >
          {error}
        </AppText>
      ) : null}

      <PrimaryButton
        label="Sim, esse é meu plano"
        onPress={onConfirm}
        loading={loading}
        disabled={planLoading}
        withArrow={false}
      />

      <Pressable
        onPress={() => setEditing((current) => !current)}
        disabled={planLoading}
        className="items-center"
        style={{ marginTop: 12, opacity: planLoading ? 0.4 : 1 }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
          {editing ? "Pronto" : "Quero ajustar"}
        </AppText>
      </Pressable>
    </View>
  );
}
