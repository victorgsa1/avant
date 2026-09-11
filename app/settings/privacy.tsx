import { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { SettingsRow, SettingsSection, SettingsToggle } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { usePreferences } from "@/features/settings/usePreferences";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { blocksApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/**
 * Privacidade: quem pode te achar e quem você bloqueou.
 *
 * Desbloquear é imediato — o backend volta a permitir mensagens e a
 * mostrar a pessoa nas buscas. Bloquear acontece na conversa ou no perfil
 * do outro, não aqui.
 */
export default function PrivacyScreen() {
  const { colors } = useTheme();
  const preferences = usePreferences();
  const blocks = useAsyncResource(useCallback(() => blocksApi.list(), []));
  const [error, setError] = useState<string | null>(null);

  const unblock = (userId: string) => {
    void blocksApi
      .unblock(userId)
      .then(() => blocks.refresh())
      .catch((caught) => setError(userMessage(caught)));
  };

  if (preferences.loading && !preferences.data) {
    return (
      <Screen>
        <PageHeader title="Privacidade" onBack={() => router.back()} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (!preferences.data) {
    return (
      <Screen>
        <PageHeader title="Privacidade" onBack={() => router.back()} />
        <ScreenError
          message={preferences.error ?? "Não foi possível carregar."}
          onRetry={() => void preferences.refresh()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="Privacidade" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <SettingsSection
          title="VISIBILIDADE"
          footer="Com isso desligado, ninguém te encontra pela busca de @usuário. Amizades já existentes continuam."
        >
          <SettingsToggle
            label="Encontrável por @usuário"
            value={preferences.data.discoverableByUsername}
            last
            onChange={(discoverableByUsername) =>
              preferences.patch({ discoverableByUsername })
            }
          />
        </SettingsSection>

        <SettingsSection
          title="BLOQUEADOS"
          footer="Pessoas bloqueadas não te encontram, não te mandam mensagem e somem do seu ranking."
        >
          {(blocks.data ?? []).map((blocked, index, list) => (
            <SettingsRow
              key={blocked.id}
              label={blocked.name}
              description={`@${blocked.username}`}
              value="Desbloquear"
              last={index === list.length - 1}
              onPress={() => unblock(blocked.id)}
            />
          ))}

          {blocks.data?.length === 0 ? <SettingsRow label="Ninguém bloqueado" last /> : null}
        </SettingsSection>

        {error ?? preferences.actionError ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 14, paddingHorizontal: 24, fontSize: 12.5, color: colors.danger }}
          >
            {error ?? preferences.actionError}
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
