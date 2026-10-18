import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { SocialFeedItem, WeekTally } from "@/services/http/types";
import { insightArtFor } from "../../art";
import { firstName, weekRangeLabel } from "../../format";
import { LikeButton } from "./LikeButton";

type InsightCardProps = {
  item: SocialFeedItem;
  onToggleLike: () => void;
};

/** A primeira linha do corpo: o resto (as observações da IA) não cabe no card. */
function headlineOf(body: string): string {
  return body.split("\n")[0]?.trim() ?? "";
}

function Art({ item, size, top, right }: { item: SocialFeedItem; size: number; top: number; right: number }) {
  // pointerEvents fica no View: a Image do RN não aceita o prop, e sem ele
  // o desenho engoliria o toque no topo do card.
  return (
    <View pointerEvents="none" style={{ position: "absolute", top, right, width: size, height: size }}>
      <Image source={insightArtFor(item)} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
    </View>
  );
}

function Byline({ item, tone }: { item: SocialFeedItem; tone: "paper" | "surface" }) {
  const { colors } = useTheme();
  const strong = tone === "paper" ? colors.onPaper : colors.text;
  const muted = tone === "paper" ? colors.onPaperMuted : colors.textMuted;

  return (
    <View className="flex-row items-center" style={{ gap: 12 }}>
      <Avatar name={item.user.name} uri={item.user.avatarUrl} size={40} />
      <View>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: strong }}>
          {firstName(item.user.name)}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ marginTop: 1, fontSize: 13, color: muted }}>
          Resumo do Avant
        </AppText>
      </View>
    </View>
  );
}

function TallyTile({ tally }: { tally: WeekTally }) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-1 items-center rounded-2xl"
      style={{ paddingVertical: 12, backgroundColor: colors.paperSunken }}
    >
      <AppText family="archivo" weight="black" style={{ fontSize: 19, letterSpacing: -0.4, color: colors.onPaper }}>
        {tally.completed} de {tally.planned}
      </AppText>
      <AppText family="manrope" weight="medium" style={{ marginTop: 2, fontSize: 13, color: colors.onPaperMuted }}>
        {weekRangeLabel(tally.periodStart, tally.periodEnd) ?? "Esta semana"}
      </AppText>
    </View>
  );
}

/**
 * O resumo mais recente, na folha clara: manchete grande, desenho e a
 * semana comparada com a anterior. Um por feed — é o destaque.
 */
export function FeaturedInsightCard({ item, onToggleLike }: InsightCardProps) {
  const { colors } = useTheme();
  const comparison = item.comparison;
  const headline = headlineOf(item.body);

  return (
    <View className="mx-5 overflow-hidden rounded-[28px]" style={{ backgroundColor: colors.paper, padding: 20 }}>
      <Art item={item} size={128} top={18} right={10} />

      <Byline item={item} tone="paper" />

      <View style={{ marginTop: 16, paddingRight: 112 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 30, lineHeight: 33, letterSpacing: -1.2, color: colors.onPaper }}
        >
          {item.title}
        </AppText>
      </View>
      {headline ? (
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={3}
          style={{ marginTop: 8, fontSize: 15, lineHeight: 21, color: colors.onPaperMuted }}
        >
          {headline}
        </AppText>
      ) : null}

      {comparison ? (
        <View className="flex-row" style={{ gap: 10, marginTop: 18 }}>
          {comparison.previous ? <TallyTile tally={comparison.previous} /> : null}
          <TallyTile tally={comparison.current} />
        </View>
      ) : null}

      <AppText family="manrope" weight="medium" style={{ marginTop: 12, fontSize: 12.5, color: colors.onPaperMuted }}>
        Com base nos registros de {firstName(item.user.name)}.
      </AppText>

      <View style={{ height: 1, backgroundColor: colors.paperSunken, marginTop: 14, marginBottom: 10 }} />

      <LikeButton
        liked={item.likedByMe}
        count={item.likeCount}
        ownerName={firstName(item.user.name)}
        tone="paper"
        onPress={onToggleLike}
      />
    </View>
  );
}

/** "5 → 8 ações · 8–14 set": a evolução em uma linha, quando há o que comparar. */
function metaOf(item: SocialFeedItem): string | null {
  const range = weekRangeLabel(item.periodStart, item.periodEnd);
  const comparison = item.comparison;
  const tally = comparison
    ? comparison.previous
      ? `${comparison.previous.completed} → ${comparison.current.completed} ações`
      : `${comparison.current.completed} de ${comparison.current.planned} ações`
    : null;
  return [tally, range].filter(Boolean).join(" · ") || null;
}

/** Os resumos seguintes, no card do tema — mais baixos, para o feed respirar. */
export function InsightCard({ item, onToggleLike }: InsightCardProps) {
  const { colors } = useTheme();
  const headline = headlineOf(item.body);
  const meta = metaOf(item);

  return (
    <View
      className="mx-5 overflow-hidden rounded-[24px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 18 }}
    >
      <Art item={item} size={100} top={16} right={10} />

      <Byline item={item} tone="surface" />

      <View style={{ marginTop: 14, paddingRight: 96 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 23, lineHeight: 27, letterSpacing: -0.8, color: colors.text }}
        >
          {item.title}
        </AppText>
      </View>
      {headline ? (
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={2}
          style={{ marginTop: 6, fontSize: 14.5, lineHeight: 20, color: colors.textStrong }}
        >
          {headline}
        </AppText>
      ) : null}
      {meta ? (
        <AppText family="manrope" weight="medium" style={{ marginTop: 6, fontSize: 12.5, color: colors.textMuted }}>
          {meta}
        </AppText>
      ) : null}

      <View style={{ height: 1, backgroundColor: colors.line, marginTop: 14, marginBottom: 10 }} />

      <LikeButton
        liked={item.likedByMe}
        count={item.likeCount}
        ownerName={firstName(item.user.name)}
        tone="surface"
        onPress={onToggleLike}
      />
    </View>
  );
}
