import { useCallback, useState } from "react";
import { LogoutIcon, MailIcon } from "@/components/ui/icons";
import { PhoneIcon } from "@/components/ui/icons/settings";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/features/auth/SessionProvider";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsPill,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { authApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { SessionResponse } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";

function lastUsedLabel(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return "agora há pouco";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

export default function SecurityScreen() {
  const { user, signOut } = useSession();
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

  const revoke = (session: SessionResponse) =>
    confirmAction({
      title: "Encerrar sessão?",
      message: `${session.deviceName} precisará entrar de novo.`,
      confirmLabel: "Encerrar",
      destructive: true,
      onConfirm: () => {
        void authApi
          .revokeSession(session.id)
          .then(() => sessions.refresh())
          .catch((caught) => setError(userMessage(caught)));
      },
    });

  const logoutEverywhere = () =>
    confirmAction({
      title: "Sair de todos os aparelhos?",
      message: "Você precisará entrar de novo em cada um deles, inclusive neste.",
      confirmLabel: "Sair de todos",
      destructive: true,
      onConfirm: () => {
        void authApi
          .logoutAll()
          .then(() => signOut())
          .catch((caught) => setError(userMessage(caught)));
      },
    });

  return (
    <SettingsPage
      title="E-mail e segurança"
      subtitle="Senha e aparelhos conectados"
      keyboard
      refreshing={sessions.refreshing}
      onRefresh={() => void sessions.refresh()}
    >
      <SettingsGroup title="E-mail" footer="É com ele que você entra no Avant.">
        <SettingsItem
          icon={MailIcon}
          title={user?.email ?? ""}
          subtitle={user?.emailVerified ? "Verificado" : "Ainda não verificado"}
        />
      </SettingsGroup>

      <SettingsGroup title="Trocar senha" footer="Ao trocar a senha, todos os aparelhos saem da conta — inclusive este.">
        <SettingsBlock>
          <TextField
            label="Senha atual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
          />
          <TextField
            label="Nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            hint="Pelo menos 8 caracteres."
          />
          <PrimaryButton
            label="Trocar senha"
            withArrow={false}
            loading={saving}
            disabled={!current || !next}
            onPress={() => void changePassword()}
          />
        </SettingsBlock>
      </SettingsGroup>
      <SettingsMessage message={error} />

      <SettingsGroup
        title="Aparelhos conectados"
        footer="Cada aparelho tem a própria sessão. Encerrar uma não afeta as outras."
      >
        {(sessions.data ?? []).map((session) => (
          <SettingsItem
            key={session.id}
            icon={PhoneIcon}
            title={session.deviceName}
            subtitle={`Última atividade ${lastUsedLabel(session.lastUsedAt)}`}
            right={
              <SettingsPill
                label="Encerrar"
                accessibilityLabel={`Encerrar sessão de ${session.deviceName}`}
                onPress={() => revoke(session)}
              />
            }
          />
        ))}
        {sessions.data?.length === 0 ? <SettingsItem icon={PhoneIcon} title="Nenhuma sessão ativa encontrada" /> : null}
        {!sessions.data ? (
          <SettingsItem
            title={sessions.error ? "Não deu para carregar" : "Carregando…"}
            subtitle={sessions.error ? "Toque para tentar de novo." : null}
            onPress={sessions.error ? () => void sessions.refresh() : undefined}
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup tone="danger">
        <SettingsItem icon={LogoutIcon} tone="danger" title="Sair de todos os aparelhos" onPress={logoutEverywhere} />
      </SettingsGroup>
    </SettingsPage>
  );
}
