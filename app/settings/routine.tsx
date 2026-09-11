import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { OptionPills, SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { minuteLabel, nextHalfHour, usePreferences } from "@/features/settings/usePreferences";
import type { PreferredPeriod, RecoveryMode, UserPace } from "@/services/http/types";

const PACES: { value: UserPace; label: string }[] = [
  { value: "GENTLE", label: "Leve" },
  { value: "BALANCED", label: "Equilibrado" },
  { value: "CHALLENGING", label: "Puxado" },
];

const PERIODS: { value: PreferredPeriod; label: string }[] = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
  { value: "FLEXIBLE", label: "Tanto faz" },
];

const RECOVERY: { value: RecoveryMode; label: string }[] = [
  { value: "GRADUAL", label: "Voltar devagar" },
  { value: "BALANCED", label: "Equilibrado" },
  { value: "DIRECT", label: "Voltar direto" },
];

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
];

/**
 * Rotina e horários. É daqui que sai a janela padrão do dia — e o motor
 * adaptativo pode propor mover um hábito quando os números mostrarem que
 * outra faixa funciona melhor.
 */
export default function RoutineScreen() {
  const { colors } = useTheme();
  const { data, loading, error, refresh, patch, actionError } = usePreferences();

  if (loading && !data) {
    return (
      <Screen>
        <PageHeader title="Rotina e horários" onBack={() => router.back()} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <PageHeader title="Rotina e horários" onBack={() => router.back()} />
        <ScreenError message={error ?? "Não foi possível carregar."} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="Rotina e horários" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <SettingsSection
          title="RITMO"
          footer="O ritmo influencia quantas ações o Avant coloca no seu dia."
        >
          <OptionPills
            options={PACES}
            value={data.pace}
            onChange={(pace) => patch({ pace })}
          />
        </SettingsSection>

        <SettingsSection
          title="MELHOR PERÍODO"
          footer="Onde o Avant tenta encaixar as ações quando você não define horário."
        >
          <OptionPills
            options={PERIODS}
            value={data.preferredPeriod}
            onChange={(preferredPeriod) => patch({ preferredPeriod })}
          />
        </SettingsSection>

        <SettingsSection title="JANELA DO DIA" footer="Toque para avançar de 30 em 30 minutos.">
          <SettingsRow
            label="Começa às"
            value={minuteLabel(data.preferredStartMinute)}
            onPress={() => patch({ preferredStartMinute: nextHalfHour(data.preferredStartMinute) })}
          />
          <SettingsRow
            label="Termina às"
            value={minuteLabel(data.preferredEndMinute)}
            last
            onPress={() => patch({ preferredEndMinute: nextHalfHour(data.preferredEndMinute) })}
          />
        </SettingsSection>

        <SettingsSection
          title="QUANDO EU FALHO"
          footer="Depois de dias perdidos, o Avant reduz a exigência antes de voltar ao normal."
        >
          <OptionPills
            options={RECOVERY}
            value={data.recoveryMode}
            onChange={(recoveryMode) => patch({ recoveryMode })}
          />
        </SettingsSection>

        <SettingsSection title="SEMANA">
          <OptionPills
            options={WEEKDAYS.map((day) => ({ value: String(day.value), label: day.label }))}
            value={String(data.weekStartsOn)}
            onChange={(value) => patch({ weekStartsOn: Number(value) })}
          />
          <SettingsRow label="Fuso horário" value={data.timezone} last />
        </SettingsSection>

        {actionError ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 14, paddingHorizontal: 24, fontSize: 12.5, color: colors.danger }}
          >
            {actionError}
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
