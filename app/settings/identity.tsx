import { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SettingsBlock, SettingsGroup, SettingsMessage } from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

const COMPASS = require("../../assets/onboarding/bussola.png");

function updatedLabel(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return `Atualizada em ${date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.`;
}

/**
 * A "direção" é o que a pessoa escreveu no onboarding sobre quem quer ser.
 * Editável porque isso muda com o tempo — e o motor adaptativo usa esse
 * texto como contexto quando precisa entender uma queda de execução.
 */
export default function IdentityScreen() {
  const { colors } = useTheme();
  const identity = useAsyncResource(useCallback(() => usersApi.getIdentity(), []), { refetchOnFocus: false });

  const [statement, setStatement] = useState("");
  const [why, setWhy] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Preenche uma vez só: recarregar não pode apagar o que está sendo digitado.
  useEffect(() => {
    if (hydrated || identity.loading || identity.error) return;
    setStatement(identity.data?.statement ?? "");
    setWhy(identity.data?.whyItMatters ?? "");
    setHydrated(true);
  }, [hydrated, identity.data, identity.loading, identity.error]);

  const save = async () => {
    if (statement.trim().length < 10) {
      setError("Escreva pelo menos uma frase sobre quem você quer ser.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await usersApi.putIdentity({
        statement: statement.trim(),
        whyItMatters: why.trim() || undefined,
      });
      router.back();
    } catch (caught) {
      setError(userMessage(caught));
      setSaving(false);
    }
  };

  return (
    <SettingsPage
      title="Sua direção"
      subtitle="Quem você quer se tornar"
      keyboard
      loading={!hydrated && !identity.error}
      error={hydrated ? null : identity.error}
      onRetry={() => void identity.refresh()}
    >
      <SettingsGroup>
        <SettingsBlock style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Image source={COMPASS} style={{ width: 50, height: 60 }} resizeMode="contain" />
          <AppText
            family="manrope"
            weight="medium"
            style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.textMuted }}
          >
            Isso não é uma meta com prazo. É a direção que o Avant usa para entender o que faz sentido propor para
            você.
          </AppText>
        </SettingsBlock>
      </SettingsGroup>

      <SettingsGroup title="Em suas palavras" footer={updatedLabel(identity.data?.updatedAt)}>
        <SettingsBlock>
          <TextField
            label="Quem você quer se tornar"
            value={statement}
            onChangeText={setStatement}
            multiline
            numberOfLines={4}
            maxLength={240}
            placeholder="Ex.: Alguém que cuida do corpo sem precisar de motivação."
          />
          <TextField
            label="Por que isso importa"
            value={why}
            onChangeText={setWhy}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <PrimaryButton label="Salvar direção" withArrow={false} loading={saving} onPress={() => void save()} />
        </SettingsBlock>
      </SettingsGroup>
      <SettingsMessage message={error} />
    </SettingsPage>
  );
}
