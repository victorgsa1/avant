import { useState } from "react";
import { Alert, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

const CONFIRMATION = "APAGAR";

/**
 * Dados e privacidade.
 *
 * Apagar a conta é irreversível e derruba tudo em cascata no servidor
 * (ações, progresso, amizades, conversas). Por isso exige digitar a
 * palavra de confirmação além do alerta do sistema.
 */
export default function DataScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useSession();

  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const armed = confirmation.trim().toUpperCase() === CONFIRMATION;

  const deleteAccount = () => {
    const run = async () => {
      setDeleting(true);
      setError(null);
      try {
        await usersApi.deleteMe();
        await signOut();
      } catch (caught) {
        setError(userMessage(caught));
        setDeleting(false);
      }
    };

    if (Platform.OS === "web") {
      void run();
      return;
    }

    Alert.alert(
      "Apagar sua conta?",
      "Isso remove seu histórico, seu progresso e suas conversas. Não dá para desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar conta", style: "destructive", onPress: () => void run() },
      ],
    );
  };

  return (
    <Screen>
      <PageHeader title="Dados e privacidade" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <SettingsSection
          title="O QUE O AVANT GUARDA"
          footer="O Avant registra o que você planeja e o que acontece com esse plano. É isso que permite adaptar o plano ao seu comportamento real."
        >
          <SettingsRow label="Conta" description="Nome, @usuário e e-mail" />
          <SettingsRow label="Plano" description="Áreas, hábitos e ações do dia" />
          <SettingsRow
            label="Comportamento"
            description="Conclusões, faltas, horários e retomadas"
          />
          <SettingsRow label="Social" description="Amizades, ranking e conversas" last />
        </SettingsSection>

        <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 14 }}>
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 13, letterSpacing: 0.2, color: colors.danger, paddingLeft: 4 }}
          >
            APAGAR CONTA
          </AppText>

          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 13, lineHeight: 19.5, color: colors.textMuted, paddingHorizontal: 4 }}
          >
            {user?.email ? `A conta ${user.email} ` : "A sua conta "}
            e tudo ligado a ela serão removidos. Escreva {CONFIRMATION} para liberar o botão.
          </AppText>

          <TextField
            label="Confirmação"
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={CONFIRMATION}
          />

          {error ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error}
            </AppText>
          ) : null}

          <SettingsSection>
            <SettingsRow
              label={deleting ? "Apagando…" : "Apagar minha conta"}
              destructive
              last
              disabled={!armed || deleting}
              onPress={deleteAccount}
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </Screen>
  );
}
