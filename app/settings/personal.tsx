import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { MailIcon } from "@/components/ui/icons";
import { LinkIcon } from "@/components/ui/icons/social";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { usersApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

function memberSince(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `No Avant desde ${date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;
}

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
  const since = memberSince(user?.createdAt);

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
    <SettingsPage title="Informações pessoais" subtitle="Como você aparece para seus amigos" keyboard>
      <View className="items-center" style={{ marginTop: 24, gap: 10 }}>
        <Avatar name={name || user?.name || "?"} uri={user?.avatarUrl} size={88} tone="accent" />
        <View className="items-center" style={{ gap: 2 }}>
          <AppText family="archivo" weight="black" style={{ fontSize: 20, letterSpacing: -0.6, color: colors.text }}>
            {name.trim() || user?.name}
          </AppText>
          {since ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 13, color: colors.textMuted }}>
              {since}
            </AppText>
          ) : null}
        </View>
      </View>

      <SettingsGroup title="Seu perfil">
        <SettingsBlock>
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
          <PrimaryButton
            label="Salvar alterações"
            withArrow={false}
            loading={saving}
            disabled={!dirty}
            onPress={() => void save()}
          />
        </SettingsBlock>
      </SettingsGroup>
      <SettingsMessage message={error} />
      <SettingsMessage message={saved && !dirty ? "Alterações salvas." : null} tone="success" />

      <SettingsGroup title="Conta" footer="Estes dados não podem ser editados por aqui.">
        <SettingsItem
          icon={MailIcon}
          title="E-mail"
          subtitle={user?.email}
          value={user?.emailVerified ? "Verificado" : "Não verificado"}
        />
        <SettingsItem icon={LinkIcon} title="Código de convite" subtitle={user?.inviteCode} />
      </SettingsGroup>
    </SettingsPage>
  );
}
