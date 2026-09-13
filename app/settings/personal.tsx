import { useState } from "react";
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
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

export default function PersonalInfoScreen() {
  const { colors } = useTheme();
  const { user, refreshUser } = useSession();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalizedUsername = username.trim().toLowerCase();
  const dirty = name.trim() !== user?.name || normalizedUsername !== user?.username;

  const save = async () => {
    if (!name.trim()) {
      setError("Escreva como quer ser chamado.");
      return;
    }
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError("Usuário: 3 a 20 caracteres, apenas letras, números, ponto e _.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await usersApi.updateMe({ name: name.trim(), username: normalizedUsername });
      await refreshUser();
      setSaved(true);
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Informações pessoais" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>
          <TextField
            label="Nome"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            autoCapitalize="words"
            maxLength={80}
          />

          <TextField
            label="Usuário"
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              setSaved(false);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            hint="É por aqui que seus amigos te encontram."
          />

          {error ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error}
            </AppText>
          ) : null}

          {saved && !dirty ? (
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.success }}>
              Alterações salvas.
            </AppText>
          ) : null}

          <PrimaryButton
            label="Salvar"
            withArrow={false}
            loading={saving}
            disabled={!dirty}
            onPress={() => void save()}
          />
        </View>

        <SettingsSection title="CONTA" footer="Estes dados não podem ser editados por aqui.">
          <SettingsRow label="E-mail" value={user?.email ?? ""} />
          <SettingsRow label="Código de convite" value={user?.inviteCode ?? ""} />
          <SettingsRow
            label="E-mail verificado"
            value={user?.emailVerified ? "Sim" : "Ainda não"}
            last
          />
        </SettingsSection>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
