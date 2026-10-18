import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Noticed } from "../types";
import { SectionTitle } from "./SectionTitle";

type NoticedCardProps = {
  noticed: Noticed;
  busy?: boolean;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  onArchiveInsight: (id: string) => void;
};

/**
 * "O Avant percebeu": o padrão que o motor viu e, quando há, a mudança que
 * ele propõe. Como na Hoje, nada muda sem um sim — "Manter plano" é uma
 * resposta tão legítima quanto aceitar. O cartão é papel nos dois temas.
 */
export function NoticedCard({ noticed, busy = false, onApply, onDismiss, onArchiveInsight }: NoticedCardProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5" style={{ marginTop: 36 }}>
      <View style={{ paddingHorizontal: 2 }}>
        <SectionTitle title="O Avant percebeu" />
      </View>

      <View className="rounded-[28px]" style={{ backgroundColor: colors.paper, padding: 22 }}>
        {noticed.tag || noticed.period ? (
          <View className="flex-row items-center justify-between" style={{ gap: 12, marginBottom: 14 }}>
            {noticed.tag ? (
              <View
                className="rounded-full"
                style={{ backgroundColor: colors.paperSunken, paddingVertical: 5, paddingHorizontal: 12, flexShrink: 1 }}
              >
                <AppText
                  family="manrope"
                  weight="extraBold"
                  numberOfLines={1}
                  style={{ fontSize: 12, color: colors.onPaper }}
                >
                  {noticed.tag}
                </AppText>
              </View>
            ) : (
              <View />
            )}
            {noticed.period ? (
              <AppText family="manrope" weight="medium" style={{ fontSize: 12, color: colors.onPaperMuted }}>
                {noticed.period}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 21, lineHeight: 27, letterSpacing: -0.5, color: colors.onPaper }}
        >
          {noticed.title}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 10, fontSize: 13.5, lineHeight: 20, color: colors.onPaperMuted }}
        >
          {noticed.body}
        </AppText>

        {noticed.kind === "proposal" ? (
          <>
            {noticed.suggestion ? (
              <>
                <View style={{ height: 1, backgroundColor: colors.paperSunken, marginTop: 16 }} />
                <AppText
                  family="manrope"
                  weight="bold"
                  style={{ marginTop: 14, fontSize: 14, color: colors.onPaper }}
                >
                  Sugestão: {noticed.suggestion}
                </AppText>
              </>
            ) : null}

            <View className="flex-row items-center" style={{ gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => onApply(noticed.id)}
                disabled={busy}
                accessibilityRole="button"
                className="items-center justify-center rounded-full"
                style={{ flex: 1.3, minHeight: 50, paddingHorizontal: 14, backgroundColor: colors.ember, opacity: busy ? 0.6 : 1 }}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={colors.onPaper} />
                ) : (
                  <AppText
                    family="archivo"
                    weight="bold"
                    numberOfLines={1}
                    style={{ fontSize: 15, color: colors.onPaper }}
                  >
                    {noticed.applyLabel}
                  </AppText>
                )}
              </Pressable>
              <Pressable
                onPress={() => onDismiss(noticed.id)}
                disabled={busy}
                accessibilityRole="button"
                className="items-center justify-center"
                style={{ flex: 1, minHeight: 50, paddingHorizontal: 8, opacity: busy ? 0.5 : 1 }}
              >
                <AppText
                  family="manrope"
                  weight="semiBold"
                  numberOfLines={1}
                  style={{ fontSize: 14, color: colors.onPaperMuted }}
                >
                  {noticed.dismissLabel}
                </AppText>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            onPress={() => onArchiveInsight(noticed.id)}
            accessibilityRole="button"
            style={{ marginTop: 16, alignSelf: "flex-start", paddingVertical: 4 }}
          >
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 13.5, color: colors.onPaperMuted }}>
              Entendi
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
