import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/**
 * A "direção" é o que a pessoa escreveu no onboarding sobre quem quer ser.
 * Editável porque isso muda com o tempo — e o motor adaptativo usa esse
 * texto como contexto quando precisa entender uma queda de execução.
 */
export default function IdentityScreen() {
  const { colors } = useTheme();
  const identity = useAsyncResource(useCallback(() => usersApi.getIdentity(), []));

  const [statement, setStatement] = useState("");
  const [why, setWhy] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hydrated || !identity.data) return;
    setStatement(identity.data.statement ?? "");
    setWhy(identity.data.whyItMatters ?? "");
    setHydrated(true);
  }, [hydrated, identity.data]);

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
    <Screen>
      <PageHeader title="Sua direção" onBack={() => router.back()} />

      {identity.loading && !identity.data && !hydrated ? <ScreenLoading /> : null}

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>
          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 13, lineHeight: 19.5, color: colors.textMuted }}
          >
            Isso não é uma meta com prazo. É a direção que o Avant usa para
            entender o que faz sentido propor para você.
          </AppText>

          <TextField
            label="Quem você quer se tornar"
            value={statement}
            onChangeText={setStatement}
            multiline
            numberOfLines={4}
            maxLength={240}
          />

          <TextField
            label="Por que isso importa"
            value={why}
            onChangeText={setWhy}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {error ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error}
            </AppText>
          ) : null}

          <PrimaryButton
            label="Salvar"
            withArrow={false}
            loading={saving}
            onPress={() => void save()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
