import { useCallback, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { validateUsername } from "@/features/auth/validation";
import { usersApi } from "@/services/api";
import { ApiError, userMessage } from "@/services/http/ApiError";

type UsernameSetupModalProps = {
  visible: boolean;
  currentUsername: string;
  /** Chamado após confirmar (com ou sem mudança). */
  onDone: () => void;
};

/**
 * Primeira visita ao social: a pessoa confirma (ou troca) o @usuário
 * público, que é como os amigos vão encontrá-la. A unicidade é decidida
 * pelo backend — aqui só validamos formato para o erro aparecer antes.
 */
export function UsernameSetupModal({ visible, currentUsername, onDone }: UsernameSetupModalProps) {
  const { colors } = useTheme();
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const confirm = useCallback(async () => {
    const next = username.trim().toLowerCase();

    const formatError = validateUsername(next);
    if (formatError) {
      setError(formatError);
      return;
    }

    // Sem mudança: só marca como confirmado, sem gastar uma requisição.
    if (next === currentUsername.toLowerCase()) {
      onDone();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await usersApi.updateMe({ username: next });
      onDone();
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "USERNAME_ALREADY_IN_USE") {
        setError("Esse @usuário já está em uso. Tente outro.");
      } else {
        setError(userMessage(caught));
      }
    } finally {
      setSaving(false);
    }
  }, [currentUsername, onDone, username]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#0000008C", padding: 26 }}>
        <View
          className="w-full rounded-[28px]"
          style={{
            padding: 24,
            backgroundColor: colors.surface,
            boxShadow: `0 24px 60px ${colors.shadowStrong}`,
          }}
        >
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 23, lineHeight: 27, letterSpacing: -0.9, color: colors.text }}
          >
            Como seus amigos te encontram
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 9, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
          >
            Confirme seu @usuário. É o único dado seu que aparece para outras pessoas no ranking.
          </AppText>

          <View style={{ marginTop: 20 }}>
            <TextField
              label="Seu @usuário"
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                setError(null);
              }}
              error={error}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="seunome"
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <PrimaryButton label="Confirmar" onPress={() => void confirm()} loading={saving} withArrow={false} />
          </View>

          <Pressable onPress={onDone} disabled={saving} style={{ marginTop: 12 }}>
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ textAlign: "center", fontSize: 13, color: colors.textMuted }}
            >
              Agora não
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
