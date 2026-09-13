import { ActivityIndicator, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { AdaptiveIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AdaptationProposal } from "@/services/http/types";

type AdaptationCardProps = {
  proposal: AdaptationProposal;
  busy?: boolean;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
};

/**
 * O card "aprendi algo sobre você".
 *
 * É aqui que o motor adaptativo aparece — e é o único lugar onde ele
 * aparece. Não há caixa de conversa: o Avant observou o comportamento,
 * chegou a uma proposta e devolve a decisão para a pessoa. Manter o plano
 * é sempre uma resposta legítima, por isso os dois botões têm o mesmo peso.
 */
export function AdaptationCard({ proposal, busy = false, onApply, onDismiss }: AdaptationCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5" style={{ marginTop: 18 }}>
      <View
        className="flex-row flex-wrap items-center rounded-[24px]"
        style={{ backgroundColor: colors.surface, padding: 14, gap: 12 }}
      >
        <View
          className="items-center justify-center"
          style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: colors.emberMid }}
        >
          <AdaptiveIcon size={22} color={colors.inverse} />
        </View>

        {/* flexBasis dá o ponto de quebra: em tela estreita os botões descem. */}
        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 150 }}>
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
        </View>

        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={() => onDismiss(proposal.id)}
            disabled={busy}
            className="items-center justify-center rounded-full"
            style={{
              paddingVertical: 11,
              paddingHorizontal: 18,
              borderWidth: 1.3,
              borderColor: colors.lineStrong,
              opacity: busy ? 0.5 : 1,
            }}
          >
            <AppText family="archivo" weight="bold" style={{ fontSize: 13.5, color: colors.textMuted }}>
              Manter
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => onApply(proposal.id)}
            disabled={busy}
            className="items-center justify-center rounded-full"
            style={{
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
      </View>
    </View>
  );
}
