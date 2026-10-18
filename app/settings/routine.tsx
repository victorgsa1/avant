import { GlobeIcon, MoonIcon, SunIcon } from "@/components/ui/icons/settings";
import {
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsOption,
  SettingsSegmented,
  SettingsStepper,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { minuteLabel, stepMinute, usePreferences } from "@/features/settings/usePreferences";
import type { PreferredPeriod, RecoveryMode, UserPace } from "@/services/http/types";

const STEP = 30;

const PACES: { value: UserPace; label: string; help: string }[] = [
  { value: "GENTLE", label: "Leve", help: "Carga baixa enquanto o hábito não firma." },
  { value: "BALANCED", label: "Equilibrado", help: "Ajusta suas ações sem deixá-las fáceis demais." },
  { value: "CHALLENGING", label: "Intenso", help: "Sobe a régua quando você está em sequência." },
];

const PERIODS: { value: PreferredPeriod; label: string }[] = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
  { value: "FLEXIBLE", label: "Tanto faz" },
];

const RECOVERY: { value: RecoveryMode; label: string; help: string }[] = [
  { value: "GRADUAL", label: "Voltar aos poucos", help: "Ações menores nos primeiros dias de retomada." },
  { value: "BALANCED", label: "No ritmo normal", help: "Retoma o plano habitual assim que você volta." },
  { value: "DIRECT", label: "Direto de onde parei", help: "Sem redução: você volta exatamente de onde parou." },
];

const WEEK_STARTS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
];

/** Sem janela definida, o primeiro toque parte de um horário comum. */
const DEFAULT_START = 7 * 60;
const DEFAULT_END = 22 * 60;

/**
 * Rotina e horários. É daqui que sai a janela padrão do dia — e o motor
 * adaptativo pode propor mover um hábito quando os números mostrarem que
 * outra faixa funciona melhor.
 */
export default function RoutineScreen() {
  const { data, loading, error, refresh, patch, actionError } = usePreferences();

  return (
    <SettingsPage
      title="Rotina e horários"
      subtitle="Períodos, ritmo e retomada"
      loading={loading && !data}
      error={!data ? (error ?? "Não foi possível carregar.") : null}
      onRetry={() => void refresh()}
    >
      {data ? (
        <>
          <SettingsGroup title="Seu ritmo" description="Quantas ações o Avant coloca no seu dia.">
            {PACES.map((pace) => (
              <SettingsOption
                key={pace.value}
                title={pace.label}
                subtitle={pace.help}
                selected={pace.value === data.pace}
                onSelect={() => patch({ pace: pace.value })}
              />
            ))}
          </SettingsGroup>

          <SettingsGroup
            title="Melhor período"
            footer="Onde o Avant tenta encaixar as ações quando você não define horário."
          >
            <SettingsSegmented
              options={PERIODS}
              value={data.preferredPeriod}
              onChange={(preferredPeriod) => patch({ preferredPeriod })}
            />
          </SettingsGroup>

          <SettingsGroup title="Janela do dia" footer="Fora dessa faixa o Avant não marca ações para você.">
            <SettingsStepper
              icon={SunIcon}
              title="Começa às"
              value={minuteLabel(data.preferredStartMinute)}
              onDecrement={() =>
                patch({ preferredStartMinute: stepMinute(data.preferredStartMinute, -STEP, DEFAULT_START) })
              }
              onIncrement={() =>
                patch({ preferredStartMinute: stepMinute(data.preferredStartMinute, STEP, DEFAULT_START) })
              }
            />
            <SettingsStepper
              icon={MoonIcon}
              title="Termina às"
              value={minuteLabel(data.preferredEndMinute)}
              onDecrement={() => patch({ preferredEndMinute: stepMinute(data.preferredEndMinute, -STEP, DEFAULT_END) })}
              onIncrement={() => patch({ preferredEndMinute: stepMinute(data.preferredEndMinute, STEP, DEFAULT_END) })}
            />
          </SettingsGroup>

          <SettingsGroup
            title="Quando você sai da rotina"
            description="Depois de dias perdidos, como o Avant te traz de volta."
          >
            {RECOVERY.map((mode) => (
              <SettingsOption
                key={mode.value}
                title={mode.label}
                subtitle={mode.help}
                selected={mode.value === data.recoveryMode}
                onSelect={() => patch({ recoveryMode: mode.value })}
              />
            ))}
          </SettingsGroup>

          <SettingsGroup title="Semana">
            <SettingsSegmented
              label="A semana começa no"
              options={WEEK_STARTS}
              value={String(data.weekStartsOn)}
              onChange={(value) => patch({ weekStartsOn: Number(value) })}
            />
            <SettingsItem icon={GlobeIcon} title="Fuso horário" value={data.timezone} />
          </SettingsGroup>
        </>
      ) : null}

      <SettingsMessage message={actionError} />
    </SettingsPage>
  );
}
