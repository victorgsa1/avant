import { ActivityIndicator, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { AdaptiveIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AdaptationProposal, SkipReasonCode } from "@/services/http/types";
import { FrictionChips } from "./SkipReasonSheet";

type AdaptationCardProps = {
  proposal: AdaptationProposal;
  busy?: boolean;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  /** Resposta de um toque quando a proposta é uma pergunta. */
  onAnswer?: (id: string, code: SkipReasonCode) => void;
  /** "Por que isso?" — abre o que o Avant aprendeu. */
  onOpenLearned?: () => void;
};

/**
 * O card "aprendi algo sobre você".
 *
 * É aqui que o motor adaptativo aparece. Não há caixa de conversa: o Avant
 * observou o comportamento, chegou a uma proposta e devolve a decisão para a
 * pessoa. Manter o plano é sempre uma resposta legítima, por isso os dois
 * botões têm o mesmo peso. Quando o motor não sabe o que atrapalhou, o card
 * vira uma pergunta de um toque em vez de um palpite.
 */
export function AdaptationCard({
  proposal,
  busy = false,
  onApply,
  onDismiss,
  onAnswer,
  onOpenLearned,
}: AdaptationCardProps) {
  const { colors } = useTheme();
  const isQuestion = proposal.kind === "QUESTION" && onAnswer != null;

  return (
    <View className="px-5" style={{ marginTop: 18 }}>
      {/*
        Texto e botões em linhas separadas. Na mesma linha com flex-wrap, o
        texto (que encolhe) disputava espaço com os botões (que não
        encolhem) e virava uma coluna de poucas letras com rótulo longo.
      */}
      <View className="rounded-[24px]" style={{ backgroundColor: colors.surface, padding: 14, gap: 12 }}>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="items-center justify-center"
            style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: colors.emberMid }}
          >
            <AdaptiveIcon size={22} color={colors.inverse} />
          </View>

          <View style={{ flex: 1 }}>
            <AppText
              family="archivo"
              weight="extraBold"
              style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}
            >
              {proposal.title}
            </AppText>
            <AppText
              family="manrope"
              weight="medium"
              style={{ marginTop: 2, fontSize: 12.5, lineHeight: 17, color: colors.textMuted }}
            >
              {proposal.message}
            </AppText>
            {onOpenLearned && !isQuestion ? (
              <Pressable onPress={onOpenLearned} style={{ marginTop: 6, alignSelf: "flex-start" }}>
                <AppText
                  family="manrope"
                  weight="semiBold"
                  style={{ fontSize: 12, color: colors.textFaint, textDecorationLine: "underline" }}
                >
                  O que o Avant aprendeu
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        {isQuestion ? (
          <View style={{ gap: 10 }}>
            <FrictionChips
              options={proposal.options ?? undefined}
              disabled={busy}
              onSelect={(code) => onAnswer?.(proposal.id, code)}
            />
            <Pressable onPress={() => onDismiss(proposal.id)} disabled={busy} style={{ alignSelf: "flex-start" }}>
              <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.textMuted }}>
                {proposal.dismissLabel ?? "Agora não"}
              </AppText>
            </Pressable>
          </View>
        ) : (
          // Os dois crescem por igual (mesmo peso); se o par não couber numa
          // linha ("Não é prioridade agora" + "Seguir com o plano"), um desce.
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            <Pressable
              onPress={() => onDismiss(proposal.id)}
              disabled={busy}
              className="items-center justify-center rounded-full"
              style={{
                flexGrow: 1,
                paddingVertical: 11,
                paddingHorizontal: 18,
                borderWidth: 1.3,
                borderColor: colors.lineStrong,
                opacity: busy ? 0.5 : 1,
              }}
            >
              <AppText family="archivo" weight="bold" style={{ fontSize: 13.5, color: colors.textMuted }}>
                {proposal.dismissLabel ?? "Manter"}
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => onApply(proposal.id)}
              disabled={busy}
              className="items-center justify-center rounded-full"
              style={{
                flexGrow: 1,
                paddingVertical: 11,
                paddingHorizontal: 18,
                borderWidth: 1.3,
                borderColor: colors.ember,
                opacity: busy ? 0.5 : 1,
              }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={colors.ember} />
              ) : (
                <AppText
                  family="archivo"
                  weight="bold"
                  numberOfLines={1}
                  style={{ fontSize: 13.5, color: colors.ember }}
                >
                  {proposal.applyLabel}
                </AppText>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
