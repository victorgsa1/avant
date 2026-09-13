import { useCallback, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { authApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import { confirmAction } from "@/services/native/confirm";

function lastUsedLabel(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return "agora há pouco";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.round(hours / 24)} dias`;
}

function confirm(title: string, message: string, onConfirm: () => void) {
  confirmAction({ title, message, destructive: true, onConfirm });
}

export default function SecurityScreen() {
  const { colors } = useTheme();
  const { signOut } = useSession();

  const sessions = useAsyncResource(useCallback(() => authApi.sessions(), []));

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /**
   * Trocar a senha derruba TODAS as sessões no servidor — inclusive esta.
   * Por isso o app sai da conta em seguida: manter a tela aberta com um
   * token que já não vale só geraria erro na próxima ação.
   */
  const changePassword = async () => {
    if (next.length < 8) {
      setError("A nova senha precisa de pelo menos 8 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      await signOut();
    } catch (caught) {
      setError(userMessage(caught));
      setSaving(false);
    }
  };

  const revoke = (id: string) => {
    confirm("Encerrar sessão?", "O aparelho precisará entrar de novo.", () => {
      void authApi
        .revokeSession(id)
        .then(() => sessions.refresh())
        .catch((caught) => setError(userMessage(caught)));
    });
  };

  return (
    <Screen>
      <PageHeader title="E-mail e segurança" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 13, letterSpacing: 0.2, color: colors.textMuted, paddingLeft: 4 }}
          >
            TROCAR SENHA
          </AppText>

          <TextField
            label="Senha atual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextField
            label="Nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            hint="Ao trocar a senha, todos os aparelhos saem da conta."
          />

          {error ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error}
            </AppText>
          ) : null}

          <PrimaryButton
            label="Trocar senha"
            withArrow={false}
            loading={saving}
            disabled={!current || !next}
            onPress={() => void changePassword()}
          />
        </View>

        <SettingsSection
          title="SESSÕES ATIVAS"
          footer="Cada aparelho conectado tem a própria sessão. Encerrar uma não afeta as outras."
        >
          {(sessions.data ?? []).map((session, index, list) => (
            <SettingsRow
              key={session.id}
              label={session.deviceName}
              description={`Última atividade ${lastUsedLabel(session.lastUsedAt)}`}
              onPress={() => revoke(session.id)}
              value="Encerrar"
              last={index === list.length - 1}
            />
          ))}

          {sessions.data?.length === 0 ? (
            <SettingsRow label="Nenhuma sessão ativa encontrada" last />
          ) : null}
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            label="Sair de todos os aparelhos"
            destructive
            last
            onPress={() =>
              confirm(
                "Sair de todos os aparelhos?",
                "Você precisará entrar de novo em cada um deles.",
                () => {
                  void authApi
                    .logoutAll()
                    .then(() => signOut())
                    .catch((caught) => setError(userMessage(caught)));
                },
              )
            }
          />
        </SettingsSection>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
