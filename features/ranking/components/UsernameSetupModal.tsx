import { useCallback, useState, type ReactNode } from "react";
import { Modal, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { FlameIcon, HeartIcon, PeopleIcon } from "@/components/ui/icons";
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

type Step = "intro" | "username";

/**
 * Primeira visita ao social: uma introdução leve do que a página faz e, em
 * seguida, a escolha do @usuário público (o cadastro não pede — o backend
 * gera um provisório a partir do nome). A unicidade é decidida pelo
 * backend — aqui só validamos formato para o erro aparecer antes.
 */
export function UsernameSetupModal({ visible, currentUsername, onDone }: UsernameSetupModalProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>("intro");
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
          {step === "intro" ? (
            <>
              <AppText
                family="archivo"
                weight="black"
                style={{ fontSize: 23, lineHeight: 27, letterSpacing: -0.9, color: colors.text }}
              >
                Bem-vindo ao social
              </AppText>
              <AppText
                family="manrope"
                weight="medium"
                style={{ marginTop: 9, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
              >
                Aqui a consistência vira algo que vocês fazem juntos.
              </AppText>

              <View style={{ marginTop: 20, gap: 14 }}>
                <IntroItem icon={<HeartIcon color={colors.ember} />} title="Atividade">
                  Veja o resumo semanal dos seus amigos e curta o que eles estão conquistando.
                </IntroItem>
                <IntroItem icon={<PeopleIcon color={colors.ember} />} title="Amigos">
                  Encontre pessoas pelo @usuário e acompanhe quem caminha com você.
                </IntroItem>
                <IntroItem icon={<FlameIcon size={16} color={colors.ember} />} title="Competições">
                  Crie desafios em grupo e mantenham o ritmo lado a lado.
                </IntroItem>
              </View>

              <View style={{ marginTop: 24 }}>
                <PrimaryButton label="Continuar" onPress={() => setStep("username")} />
              </View>
            </>
          ) : (
            <>
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
                Escolha seu @usuário. É o único dado seu que aparece para outras pessoas no Social.
              </AppText>

              <View style={{ marginTop: 20 }}>
                <TextField
                  label="@seunomedeusuario"
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
            </>
          )}

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

function IntroItem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 34, height: 34, backgroundColor: colors.emberTint }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.text }}>
          {title}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 2, fontSize: 12.5, lineHeight: 18, color: colors.textMuted }}
        >
          {children}
        </AppText>
      </View>
    </View>
  );
}
