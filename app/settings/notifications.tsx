import { useCallback, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { SettingsRow, SettingsSection, SettingsToggle } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { minuteLabel, nextHalfHour, usePreferences } from "@/features/settings/usePreferences";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { notificationsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { ReminderResponse } from "@/services/http/types";

const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

function daysLabel(days: number[]): string {
  if (days.length === 7) return "Todos os dias";
  if (days.length === 0) return "Nenhum dia";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((day) => DAY_INITIALS[day])
    .join(" · ");
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const createReminder = async () => {
    if (title.trim().length < 2) {
      setError("Escreva o que o lembrete deve dizer.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await notificationsApi.createReminder({ title: title.trim(), minuteOfDay: minute });
      setTitle("");
      await reminders.refresh();
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const runOnReminder = (action: Promise<unknown>) => {
    void action
      .then(() => reminders.refresh())
      .catch((caught) => setError(userMessage(caught)));
  };

  /** Uma linha, todas as ações — pausar/ativar e apagar no mesmo toque. */
  const openReminderActions = (reminder: ReminderResponse) => {
    const toggle = () =>
      runOnReminder(
        notificationsApi.updateReminder(reminder.id, { isEnabled: !reminder.isEnabled }),
      );
    const remove = () => runOnReminder(notificationsApi.deleteReminder(reminder.id));

    if (Platform.OS === "web") {
      toggle();
      return;
    }

    Alert.alert(reminder.title, `${minuteLabel(reminder.minuteOfDay)} · ${daysLabel(reminder.daysOfWeek)}`, [
      { text: "Cancelar", style: "cancel" },
      { text: reminder.isEnabled ? "Pausar" : "Ativar", onPress: toggle },
      { text: "Apagar", style: "destructive", onPress: remove },
    ]);
  };

  if (preferences.loading && !preferences.data) {
    return (
      <Screen>
        <PageHeader title="Notificações" onBack={() => router.back()} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (!preferences.data) {
    return (
      <Screen>
        <PageHeader title="Notificações" onBack={() => router.back()} />
        <ScreenError
          message={preferences.error ?? "Não foi possível carregar."}
          onRetry={() => void preferences.refresh()}
        />
      </Screen>
    );
  }

  const prefs = preferences.data;

  return (
    <Screen>
      <PageHeader title="Notificações" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <SettingsSection title="O QUE PODE CHEGAR">
          <SettingsToggle
            label="Notificações"
            description="Desligar aqui silencia tudo, inclusive seus lembretes."
            value={prefs.notificationsEnabled}
            onChange={(notificationsEnabled) => preferences.patch({ notificationsEnabled })}
          />
          <SettingsToggle
            label="Intervenções do Avant"
            description="Resgates e retomadas decididos a partir do seu comportamento."
            value={prefs.behavioralNotificationsEnabled}
            disabled={!prefs.notificationsEnabled}
            onChange={(behavioralNotificationsEnabled) =>
              preferences.patch({ behavioralNotificationsEnabled })
            }
          />
          <SettingsToggle
            label="Social"
            description="Pedidos de amizade, convites de competição."
            value={prefs.socialNotificationsEnabled}
            disabled={!prefs.notificationsEnabled}
            last
            onChange={(socialNotificationsEnabled) =>
              preferences.patch({ socialNotificationsEnabled })
            }
          />
        </SettingsSection>

        <SettingsSection
          title="HORÁRIO DE SILÊNCIO"
          footer="Nada é enviado nessa faixa. Toque nos horários para ajustar."
        >
          <SettingsToggle
            label="Ativar silêncio"
            value={prefs.quietHoursEnabled}
            onChange={(quietHoursEnabled) => preferences.patch({ quietHoursEnabled })}
          />
          <SettingsRow
            label="Começa às"
            value={minuteLabel(prefs.quietHoursStart)}
            disabled={!prefs.quietHoursEnabled}
            onPress={() => preferences.patch({ quietHoursStart: nextHalfHour(prefs.quietHoursStart) })}
          />
          <SettingsRow
            label="Termina às"
            value={minuteLabel(prefs.quietHoursEnd)}
            disabled={!prefs.quietHoursEnabled}
            last
            onPress={() => preferences.patch({ quietHoursEnd: nextHalfHour(prefs.quietHoursEnd) })}
          />
        </SettingsSection>

        <SettingsSection
          title="LIMITE DIÁRIO"
          footer="Teto de intervenções por dia. Seus lembretes não entram nessa conta."
        >
          <SettingsRow
            label="Intervenções por dia"
            value={String(prefs.behavioralDailyLimit ?? 2)}
            last
            onPress={() =>
              preferences.patch({
                behavioralDailyLimit: ((prefs.behavioralDailyLimit ?? 2) % 5) + 1,
              })
            }
          />
        </SettingsSection>

        <SettingsSection title="SEUS LEMBRETES">
          {(reminders.data ?? []).map((reminder, index, list) => (
            <SettingsRow
              key={reminder.id}
              label={reminder.title}
              description={`${minuteLabel(reminder.minuteOfDay)} · ${daysLabel(reminder.daysOfWeek)}${
                reminder.isEnabled ? "" : " · pausado"
              }`}
              last={index === list.length - 1}
              onPress={() => openReminderActions(reminder)}
            />
          ))}

          {reminders.data?.length === 0 ? (
            <SettingsRow label="Nenhum lembrete criado" last />
          ) : null}
        </SettingsSection>

        <View style={{ paddingHorizontal: 20, paddingTop: 26, gap: 14 }}>
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 13, letterSpacing: 0.2, color: colors.textMuted, paddingLeft: 4 }}
          >
            NOVO LEMBRETE
          </AppText>

          <TextField
            label="Texto"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            placeholder="Ex.: Separar a roupa do treino"
          />

          <SettingsSection>
            <SettingsRow
              label="Horário"
              value={minuteLabel(minute)}
              last
              onPress={() => setMinute(nextHalfHour(minute))}
            />
          </SettingsSection>

          {error ?? preferences.actionError ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error ?? preferences.actionError}
            </AppText>
          ) : null}

          <PrimaryButton
            label="Criar lembrete"
            withArrow={false}
            loading={saving}
            onPress={() => void createReminder()}
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
