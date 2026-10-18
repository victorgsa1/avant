import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/layout/ScreenState";
import { HeartIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { SocialFeedItem } from "@/services/http/types";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "8 a 14 de set" — a semana em que o resumo do amigo se baseia. */
function periodLabel(startIso: string | null, endIso: string | null): string | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  const endLabel = `${end.getDate()} de ${MONTHS[end.getMonth()]}`;
  if (start.getMonth() === end.getMonth()) return `${start.getDate()} a ${endLabel}`;
  return `${start.getDate()} de ${MONTHS[start.getMonth()]} a ${endLabel}`;
}

function ActivityCard({ item, onToggleLike }: { item: SocialFeedItem; onToggleLike: () => void }) {
  const { colors } = useTheme();
  const period = periodLabel(item.periodStart, item.periodEnd);
  const firstName = item.user.name.split(" ")[0];

  return (
    <View className="overflow-hidden rounded-[26px]" style={{ backgroundColor: colors.paper, padding: 20 }}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 34, height: 34, backgroundColor: colors.paperSunken }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.onPaperMuted }}>
            {firstName.charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.onPaper }}>
            {firstName}
          </AppText>
          <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.onPaperMuted }}>
            Resumo do Avant
          </AppText>
        </View>
      </View>

      <AppText
        family="archivo"
        weight="black"
        style={{ marginTop: 16, fontSize: 21, lineHeight: 25, letterSpacing: -0.6, color: colors.onPaper }}
      >
        {item.title}
      </AppText>
      <AppText family="manrope" weight="medium" style={{ marginTop: 6, fontSize: 13.5, lineHeight: 19, color: colors.onPaperMuted }}>
        {item.body}
      </AppText>

      {period ? (
        <AppText family="manrope" weight="medium" style={{ marginTop: 12, fontSize: 11.5, color: colors.onPaperMuted }}>
          Semana de {period} · com base nos registros de {firstName}.
        </AppText>
      ) : null}

      <Pressable
        onPress={onToggleLike}
        haptic="selection"
        className="flex-row items-center self-start"
        style={{ gap: 7, marginTop: 16 }}
      >
        <HeartIcon size={17} filled={item.likedByMe} color={item.likedByMe ? colors.ember : colors.onPaperMuted} />
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 12.5, color: item.likedByMe ? colors.ember : colors.onPaperMuted }}
        >
          Curtir{item.likeCount > 0 ? ` · ${item.likeCount}` : ""}
        </AppText>
      </Pressable>
    </View>
  );
}

type ActivityTabContentProps = {
  items: SocialFeedItem[];
  onToggleLike: (insightId: string) => void;
};

/** A aba Atividade: os resumos semanais dos amigos, um por card. */
export function ActivityTabContent({ items, onToggleLike }: ActivityTabContentProps) {
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <View className="px-6" style={{ paddingTop: 8 }}>
        <EmptyState
          title="Nada por aqui ainda"
          description="Quando um amigo fechar a semana, o resumo aparece aqui."
        />
      </View>
    );
  }

  return (
    <View className="px-6" style={{ paddingTop: 8, gap: 14 }}>
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
        Dos seus amigos
      </AppText>
      {items.map((item) => (
        <ActivityCard key={item.id} item={item} onToggleLike={() => onToggleLike(item.id)} />
      ))}
    </View>
  );
}
