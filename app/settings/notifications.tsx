import { useCallback, useState } from "react";
import { Switch, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BarsIcon, PeopleIcon, SparkleIcon } from "@/components/ui/icons";
import { BellOutlineIcon, ClockOutlineIcon, MoonIcon, SunIcon, TrashIcon } from "@/components/ui/icons/settings";
import { Pressable } from "@/components/ui/Pressable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsStepper,
  SettingsSwitch,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { minuteLabel, stepMinute, usePreferences } from "@/features/settings/usePreferences";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { notificationsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { ReminderResponse } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";
import { tapHaptic } from "@/services/native/haptics";

const STEP = 30;
const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 5;
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];
const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function daysLabel(days: number[]): string {
  if (days.length === 7) return "Todos os dias";
  if (days.length === 0) return "Nenhum dia";
  const sorted = days.slice().sort((a, b) => a - b);
  if (sorted.join() === "1,2,3,4,5") return "Dias úteis";
  if (sorted.join() === "0,6") return "Fins de semana";
  return sorted.map((day) => DAY_INITIALS[day]).join(" · ");
}

/** Os sete dias como bolinhas: ligada = o lembrete toca nesse dia. */
function DaysPicker({ value, onChange }: { value: number[]; onChange: (next: number[]) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}>
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.textMuted }}>
        Repetir · {daysLabel(value)}
      </AppText>
      <View className="flex-row justify-between">
        {ALL_DAYS.map((day) => {
          const active = value.includes(day);
          return (
            <Pressable
              key={day}
              haptic="selection"
              onPress={() =>
                onChange(active ? value.filter((item) => item !== day) : [...value, day].sort((a, b) => a - b))
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={DAY_NAMES[day]}
              className="items-center justify-center rounded-full"
              style={{
                width: 38,
                height: 38,
                backgroundColor: active ? colors.ember : "transparent",
                borderWidth: active ? 0 : 1.3,
                borderColor: colors.lineStrong,
              }}
            >
              <AppText
                family="archivo"
                weight="bold"
                style={{ fontSize: 14, color: active ? colors.onEmber : colors.textMuted }}
              >
                {DAY_INITIALS[day]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Preferências de notificação + lembretes do usuário.
 *
 * Duas coisas diferentes na mesma tela, de propósito: o lembrete é o que
 * VOCÊ pediu (e não consome o orçamento de intervenções), enquanto as
 * intervenções comportamentais são decididas pelo motor. O texto explica
 * essa diferença porque ela muda a expectativa.
 */
export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const preferences = usePreferences();
  const reminders = useAsyncResource(useCallback(() => notificationsApi.reminders(), []));

  const [title, setTitle] = useState("");
  const [minute, setMinute] = useState(19 * 60);
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const createReminder = async () => {
    if (title.trim().length < 2) {
      setError("Escreva o que o lembrete deve dizer.");
      return;
    }
    if (days.length === 0) {
      setError("Escolha pelo menos um dia.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await notificationsApi.createReminder({ title: title.trim(), minuteOfDay: minute, daysOfWeek: days });
      setTitle("");
      setDays(ALL_DAYS);
      await reminders.refresh();
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = (reminder: ReminderResponse, isEnabled: boolean) => {
    setError(null);
    reminders.mutate((list) => list.map((item) => (item.id === reminder.id ? { ...item, isEnabled } : item)));
    void notificationsApi
      .updateReminder(reminder.id, { isEnabled })
      .catch((caught) => {
        setError(userMessage(caught));
        void reminders.refresh();
      });
  };

  const deleteReminder = (reminder: ReminderResponse) =>
    confirmAction({
      title: `Apagar "${reminder.title}"?`,
      confirmLabel: "Apagar",
      destructive: true,
      onConfirm: () => {
        void notificationsApi
          .deleteReminder(reminder.id)
          .then(() => reminders.refresh())
          .catch((caught) => setError(userMessage(caught)));
      },
    });

  const prefs = preferences.data;
  const limit = prefs?.behavioralDailyLimit ?? DEFAULT_LIMIT;

  return (
    <SettingsPage
      title="Notificações"
      subtitle="Preferências e seus lembretes"
      keyboard
      loading={preferences.loading && !prefs}
      error={!prefs ? (preferences.error ?? "Não foi possível carregar.") : null}
      onRetry={() => void preferences.refresh()}
    >
      {prefs ? (
        <>
          <SettingsGroup title="O que pode chegar">
            <SettingsSwitch
              icon={BellOutlineIcon}
              title="Notificações"
              subtitle="Desligar aqui silencia tudo, inclusive seus lembretes."
              value={prefs.notificationsEnabled}
              onChange={(notificationsEnabled) => preferences.patch({ notificationsEnabled })}
            />
            <SettingsSwitch
              icon={SparkleIcon}
              title="Intervenções do Avant"
              subtitle="Resgates e retomadas decididos a partir do seu comportamento."
              value={prefs.behavioralNotificationsEnabled}
              disabled={!prefs.notificationsEnabled}
              onChange={(behavioralNotificationsEnabled) => preferences.patch({ behavioralNotificationsEnabled })}
            />
            <SettingsSwitch
              icon={PeopleIcon}
              title="Social"
              subtitle="Pedidos de amizade e convites de competição."
              value={prefs.socialNotificationsEnabled}
              disabled={!prefs.notificationsEnabled}
              onChange={(socialNotificationsEnabled) => preferences.patch({ socialNotificationsEnabled })}
            />
          </SettingsGroup>

          <SettingsGroup title="Horário de silêncio" footer="Nada é enviado nessa faixa, nem lembrete.">
            <SettingsSwitch
              icon={MoonIcon}
              title="Ativar silêncio"
              value={prefs.quietHoursEnabled}
              onChange={(quietHoursEnabled) => preferences.patch({ quietHoursEnabled })}
            />
            <SettingsStepper
              icon={MoonIcon}
              title="Começa às"
              value={minuteLabel(prefs.quietHoursStart)}
              disabled={!prefs.quietHoursEnabled}
              onDecrement={() => preferences.patch({ quietHoursStart: stepMinute(prefs.quietHoursStart, -STEP) })}
              onIncrement={() => preferences.patch({ quietHoursStart: stepMinute(prefs.quietHoursStart, STEP) })}
            />
            <SettingsStepper
              icon={SunIcon}
              title="Termina às"
              value={minuteLabel(prefs.quietHoursEnd)}
              disabled={!prefs.quietHoursEnabled}
              onDecrement={() => preferences.patch({ quietHoursEnd: stepMinute(prefs.quietHoursEnd, -STEP) })}
              onIncrement={() => preferences.patch({ quietHoursEnd: stepMinute(prefs.quietHoursEnd, STEP) })}
            />
          </SettingsGroup>

          <SettingsGroup
            title="Limite diário"
            footer="Teto de intervenções do Avant por dia. Seus lembretes não entram nessa conta."
          >
            <SettingsStepper
              icon={BarsIcon}
              title="Máximo por dia"
              value={String(limit)}
              disabled={!prefs.notificationsEnabled || !prefs.behavioralNotificationsEnabled}
              canDecrement={limit > 1}
              canIncrement={limit < MAX_LIMIT}
              onDecrement={() => preferences.patch({ behavioralDailyLimit: limit - 1 })}
              onIncrement={() => preferences.patch({ behavioralDailyLimit: limit + 1 })}
            />
          </SettingsGroup>
        </>
      ) : null}

      <SettingsGroup title="Seus lembretes" description="Os que você mesmo pediu. Tocam no horário marcado.">
        {(reminders.data ?? []).map((reminder) => (
          <SettingsItem
            key={reminder.id}
            icon={ClockOutlineIcon}
            title={reminder.title}
            subtitle={`${minuteLabel(reminder.minuteOfDay)} · ${daysLabel(reminder.daysOfWeek)}`}
            right={
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <Pressable
                  onPress={() => deleteReminder(reminder)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Apagar lembrete ${reminder.title}`}
                  className="items-center justify-center rounded-full"
                  style={{ width: 34, height: 34 }}
                >
                  <TrashIcon size={20} color={colors.textMuted} />
                </Pressable>
                <Switch
                  value={reminder.isEnabled}
                  onValueChange={(next) => {
                    tapHaptic("selection");
                    toggleReminder(reminder, next);
                  }}
                  accessibilityLabel={`Lembrete ${reminder.title}`}
                  trackColor={{ false: colors.lineStrong, true: colors.ember }}
                  thumbColor={colors.onEmber}
                  ios_backgroundColor={colors.lineStrong}
                />
              </View>
            }
          />
        ))}
        {reminders.data?.length === 0 ? (
          <SettingsItem icon={ClockOutlineIcon} title="Nenhum lembrete ainda" subtitle="Crie o primeiro logo abaixo." />
        ) : null}
        {!reminders.data ? (
          <SettingsItem
            title={reminders.error ? "Não deu para carregar" : "Carregando…"}
            subtitle={reminders.error ? "Toque para tentar de novo." : null}
            onPress={reminders.error ? () => void reminders.refresh() : undefined}
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title="Novo lembrete">
        <SettingsBlock>
          <TextField
            label="O que lembrar"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            placeholder="Ex.: Separar a roupa do treino"
          />
        </SettingsBlock>
        <SettingsStepper
          icon={ClockOutlineIcon}
          title="Horário"
          value={minuteLabel(minute)}
          onDecrement={() => setMinute(stepMinute(minute, -STEP))}
          onIncrement={() => setMinute(stepMinute(minute, STEP))}
        />
        <DaysPicker value={days} onChange={setDays} />
        <SettingsBlock>
          <PrimaryButton
            label="Criar lembrete"
            withArrow={false}
            loading={saving}
            onPress={() => void createReminder()}
          />
        </SettingsBlock>
      </SettingsGroup>

      <SettingsMessage message={error ?? preferences.actionError} />
    </SettingsPage>
  );
}
