import { ActivityIndicator, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
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
 * é sempre uma resposta legítima, por isso os dois botões têm o mesmo
 * peso visual.
 */
export function AdaptationCard({ proposal, busy = false, onApply, onDismiss }: AdaptationCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5" style={{ marginTop: 22 }}>
      <View
        className="rounded-[26px]"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.emberTint,
          padding: 20,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View
            className="rounded-full"
            style={{ width: 6, height: 6, backgroundColor: colors.ember }}
          />
          <AppText
            family="manrope"
            weight="bold"
            style={{ fontSize: 11, letterSpacing: 0.6, color: colors.emberDeep }}
          >
            APRENDI ALGO SOBRE VOCÊ
          </AppText>
        </View>

        <AppText
          family="archivo"
          weight="extraBold"
          style={{ marginTop: 12, fontSize: 17, letterSpacing: -0.4, color: colors.text }}
        >
          {proposal.title}
        </AppText>

        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 8, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
        >
          {proposal.message}
        </AppText>

        <View className="flex-row" style={{ marginTop: 18, gap: 10 }}>
          <Pressable
            onPress={() => onDismiss(proposal.id)}
            disabled={busy}
            className="flex-1 items-center justify-center rounded-full"
            style={{
              paddingVertical: 13,
              backgroundColor: colors.surfaceSunken,
              borderWidth: 1,
              borderColor: colors.line,
              opacity: busy ? 0.5 : 1,
            }}
          >
            <AppText
              family="archivo"
              weight="extraBold"
              style={{ fontSize: 13.5, color: colors.textMuted }}
            >
              Manter como está
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => onApply(proposal.id)}
            disabled={busy}
            className="flex-1 items-center justify-center rounded-full"
            style={{ paddingVertical: 13, backgroundColor: colors.ember, opacity: busy ? 0.5 : 1 }}
          >
            {busy ? (
              <ActivityIndicator color={colors.onEmber} />
            ) : (
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ fontSize: 13.5, color: colors.onEmber }}
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
