import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SearchIcon } from "@/components/ui/icons";
import { ShieldIcon } from "@/components/ui/icons/settings";
import { useSession } from "@/features/auth/SessionProvider";
import {
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsPill,
  SettingsSwitch,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { usePreferences } from "@/features/settings/usePreferences";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { blocksApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { BlockedUserResponse } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";

/**
 * Privacidade social: quem pode te achar e quem você bloqueou.
 *
 * Desbloquear é imediato — o backend volta a permitir mensagens e a
 * mostrar a pessoa nas buscas. Bloquear acontece na conversa ou no perfil
 * do outro, não aqui.
 */
export default function PrivacyScreen() {
  const { user } = useSession();
  const preferences = usePreferences();
  const blocks = useAsyncResource(useCallback(() => blocksApi.list(), []));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unblock = (blocked: BlockedUserResponse) =>
    confirmAction({
      title: `Desbloquear ${blocked.name}?`,
      message: "A pessoa volta a te encontrar pela busca e a poder te mandar mensagem.",
      confirmLabel: "Desbloquear",
      onConfirm: () => {
        setBusyId(blocked.id);
        setError(null);
        void blocksApi
          .unblock(blocked.id)
          .then(() => blocks.refresh())
          .catch((caught) => setError(userMessage(caught)))
          .finally(() => setBusyId(null));
      },
    });

  const prefs = preferences.data;

  return (
    <SettingsPage
      title="Privacidade social"
      subtitle="Busca por @ e pessoas bloqueadas"
      loading={preferences.loading && !prefs}
      error={!prefs ? (preferences.error ?? "Não foi possível carregar.") : null}
      onRetry={() => void preferences.refresh()}
      refreshing={blocks.refreshing}
      onRefresh={() => void blocks.refresh()}
    >
      {prefs ? (
        <SettingsGroup
          title="Busca"
          footer="Desligado, ninguém te encontra pela busca de @usuário. Amizades que já existem continuam."
        >
          <SettingsSwitch
            icon={SearchIcon}
            title="Encontrável por @usuário"
            subtitle={user?.username ? `Seus amigos te acham como @${user.username}.` : null}
            value={prefs.discoverableByUsername}
            onChange={(discoverableByUsername) => preferences.patch({ discoverableByUsername })}
          />
        </SettingsGroup>
      ) : null}

      <SettingsGroup
        title="Bloqueados"
        footer="Quem você bloqueia não te encontra, não te manda mensagem e sai da sua lista de amigos."
      >
        {(blocks.data ?? []).map((blocked) => (
          <SettingsItem
            key={blocked.id}
            leading={<Avatar name={blocked.name} uri={blocked.avatarUrl} size={42} />}
            title={blocked.name}
            subtitle={`@${blocked.username}`}
            right={
              <SettingsPill
                label="Desbloquear"
                disabled={busyId === blocked.id}
                accessibilityLabel={`Desbloquear ${blocked.name}`}
                onPress={() => unblock(blocked)}
              />
            }
          />
        ))}
        {blocks.data?.length === 0 ? (
          <SettingsItem
            icon={ShieldIcon}
            title="Ninguém bloqueado"
            subtitle="Dá para bloquear alguém pela conversa ou pelo perfil da pessoa."
          />
        ) : null}
        {!blocks.data ? (
          <SettingsItem
            title={blocks.error ? "Não deu para carregar" : "Carregando…"}
            subtitle={blocks.error ? "Toque para tentar de novo." : null}
            onPress={blocks.error ? () => void blocks.refresh() : undefined}
          />
        ) : null}
      </SettingsGroup>

      <SettingsMessage message={error ?? preferences.actionError} />
    </SettingsPage>
  );
}
