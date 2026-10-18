import type { ReactNode } from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon } from "@/components/ui/icons";
import { LockIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

const SHARED = [
  "O resumo semanal que o Avant escreve sobre a sua semana, com o total de ações feitas.",
  "Nas competições em que você entrar, sua consistência e sua posição.",
  "Seu nome, @usuário e foto de perfil.",
];

const PRIVATE = [
  "Fotos e localização que comprovam a principal.",
  "Seus hábitos, o plano do dia e o que você escreveu no onboarding.",
  "O que o Avant aprendeu sobre a sua rotina.",
];

type SharingInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
};

/** "O que compartilhar": o que seus amigos veem — e o que fica só com você. */
export function SharingInfoSheet({ visible, onClose, onOpenPrivacy }: SharingInfoSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const list = (items: string[], icon: ReactNode) =>
    items.map((text) => (
      <View key={text} className="flex-row" style={{ gap: 12 }}>
        <View style={{ width: 18, paddingTop: 3, alignItems: "center" }}>{icon}</View>
        <AppText family="manrope" weight="medium" style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.textStrong }}>
          {text}
        </AppText>
      </View>
    ));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} accessibilityLabel="Fechar" />
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 22,
          paddingTop: 22,
          paddingBottom: insets.bottom + 18,
          gap: 18,
        }}
      >
        <View>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 19, letterSpacing: -0.4, color: colors.text }}>
            O que seus amigos veem
          </AppText>
          <AppText family="manrope" weight="medium" style={{ marginTop: 4, fontSize: 13, lineHeight: 18, color: colors.textMuted }}>
            Só amigos aceitos veem a sua atividade. Ninguém mais.
          </AppText>
        </View>

        <View style={{ gap: 10 }}>{list(SHARED, <CheckmarkIcon size={13} color={colors.ember} />)}</View>

        <View style={{ height: 1, backgroundColor: colors.line }} />

        <View style={{ gap: 10 }}>
          <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.textMuted }}>
            Nunca aparece para eles
          </AppText>
          {list(PRIVATE, <LockIcon size={15} color={colors.textMuted} />)}
        </View>

        <Pressable
          onPress={onOpenPrivacy}
          accessibilityRole="button"
          className="items-center justify-center rounded-full"
          style={{ height: 52, borderWidth: 1.3, borderColor: colors.lineStrong }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 14.5, color: colors.text }}>
            Ajustes de privacidade
          </AppText>
        </Pressable>
      </View>
    </Modal>
  );
}
