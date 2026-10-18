import { useState } from "react";
import { AppText } from "@/components/ui/AppText";
import { PeopleIcon, SparkleIcon } from "@/components/ui/icons";
import { ChecklistIcon, TrashIcon, UserOutlineIcon } from "@/components/ui/icons/settings";
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
import { confirmAction } from "@/services/native/confirm";

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

  const deleteAccount = () =>
    confirmAction({
      title: "Apagar sua conta?",
      message: "Isso remove seu histórico, seu progresso e suas conversas. Não dá para desfazer.",
      confirmLabel: "Apagar conta",
      destructive: true,
      onConfirm: () => {
        setDeleting(true);
        setError(null);
        void usersApi
          .deleteMe()
          .then(() => signOut())
          .catch((caught) => {
            setError(userMessage(caught));
            setDeleting(false);
          });
      },
    });

  return (
    <SettingsPage title="Dados e privacidade" subtitle="Seus dados e exclusão da conta" keyboard>
      <SettingsGroup
        title="O que o Avant guarda"
        footer="O Avant registra o que você planeja e o que acontece com esse plano. É isso que permite adaptar o plano ao seu comportamento real."
      >
        <SettingsItem icon={UserOutlineIcon} title="Conta" subtitle="Nome, @usuário e e-mail" />
        <SettingsItem icon={ChecklistIcon} title="Plano" subtitle="Áreas, hábitos e ações do dia" />
        <SettingsItem icon={SparkleIcon} title="Comportamento" subtitle="Conclusões, faltas, horários e retomadas" />
        <SettingsItem icon={PeopleIcon} title="Social" subtitle="Amizades, atividade e conversas" />
      </SettingsGroup>

      <SettingsGroup title="Apagar conta" tone="danger">
        <SettingsBlock>
          <AppText family="manrope" weight="medium" style={{ fontSize: 14, lineHeight: 20, color: colors.textMuted }}>
            {user?.email ? `A conta ${user.email} ` : "A sua conta "}e tudo ligado a ela serão removidos. Escreva{" "}
            <AppText family="manrope" weight="bold" style={{ color: colors.text }}>
              {CONFIRMATION}
            </AppText>{" "}
            para liberar o botão.
          </AppText>
          <TextField
            label="Confirmação"
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={CONFIRMATION}
          />
        </SettingsBlock>
        <SettingsItem
          icon={TrashIcon}
          tone="danger"
          title={deleting ? "Apagando…" : "Apagar minha conta"}
          disabled={!armed || deleting}
          onPress={deleteAccount}
        />
      </SettingsGroup>
      <SettingsMessage message={error} />
    </SettingsPage>
  );
}
