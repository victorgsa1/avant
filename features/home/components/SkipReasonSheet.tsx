import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { FrictionOption, SkipReasonCode } from "@/services/http/types";

/**
 * Espelha `FRICTION_OPTIONS` do servidor (engine/domain/friction.ts). Fica
 * local para o toque não depender de uma requisição a mais.
 */
export const FRICTION_OPTIONS: FrictionOption[] = [
  { code: "NO_TIME", label: "Sem tempo" },
  { code: "LOW_ENERGY", label: "Cansaço" },
  { code: "NO_ACCESS", label: "Não estava no lugar certo" },
  { code: "TOO_HARD", label: "Ficou difícil demais" },
  { code: "FORGOT", label: "Esqueci" },
  { code: "NOT_PRIORITY", label: "Não era prioridade hoje" },
  { code: "OTHER", label: "Outra coisa" },
];

export function FrictionChips({
  options = FRICTION_OPTIONS,
  onSelect,
  disabled = false,
}: {
  options?: FrictionOption[];
  onSelect: (code: SkipReasonCode) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
      {options.map((option) => (
        <Pressable
          key={option.code}
          haptic="selection"
          disabled={disabled}
          onPress={() => onSelect(option.code)}
          accessibilityRole="button"
          className="rounded-full"
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1.3,
            borderColor: colors.lineStrong,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 13.5, color: colors.text }}>
            {option.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

type SkipReasonSheetProps = {
  visible: boolean;
  /** Título da ação sendo pulada — a pergunta é sobre ELA. */
  actionTitle: string | null;
  onSelect: (code: SkipReasonCode) => void;
  /** Pular sem responder continua sendo permitido: o motivo é ajuda, não pedágio. */
  onSkipWithoutReason: () => void;
  onClose: () => void;
};

/**
 * "O que atrapalhou hoje?" — um toque ao pular. É o sinal de maior retorno
 * do motor adaptativo: separa falta de tempo (mover o horário) de ação
 * pesada demais (reduzir) de prioridade (reconectar), sem nenhuma IA.
 */
export function SkipReasonSheet({ visible, actionTitle, onSelect, onSkipWithoutReason, onClose }: SkipReasonSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
          gap: 14,
        }}
      >
        <View>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 19, letterSpacing: -0.4, color: colors.text }}>
            O que atrapalhou hoje?
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 4, fontSize: 13, lineHeight: 18, color: colors.textMuted }}
          >
            {actionTitle
              ? `Pular "${actionTitle}" não apaga nada. Um toque ajuda o Avant a ajustar do jeito certo.`
              : "Um toque ajuda o Avant a ajustar do jeito certo."}
          </AppText>
        </View>

        <FrictionChips onSelect={onSelect} />

        <Pressable onPress={onSkipWithoutReason} className="items-center" style={{ paddingVertical: 8 }}>
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ fontSize: 13, color: colors.textMuted, textDecorationLine: "underline" }}
          >
            Pular sem responder
          </AppText>
        </Pressable>
      </View>
    </Modal>
  );
}
