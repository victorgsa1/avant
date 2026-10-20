import { Image, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon, ClockIcon, FlameIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { artFor } from "../activityAssets";

type PrimaryDoneCardProps = {
  title: string;
  /** Chave do desenho, a mesma do card antes de concluir. */
  iconKey: string | null;
  completedAt: string | null;
  xp: number;
  streakDays: number;
};

/** "18h32" — no mesmo formato do horário do card antes de concluir. */
function timeOf(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * A principal depois de feita: a mesma folha clara do compromisso, com o
 * mesmo desenho — o botão dá lugar ao que o dia rendeu.
 */
export function PrimaryDoneCard({ title, iconKey, completedAt, xp, streakDays }: PrimaryDoneCardProps) {
  const { colors } = useTheme();
  const art = artFor(iconKey, title);
  const time = timeOf(completedAt);

  return (
    <View className="px-5" style={{ marginTop: 24 }}>
      <View
        className="overflow-hidden rounded-[30px]"
        style={{ backgroundColor: colors.paper, padding: 22 }}
      >
        {art.kind === "illustration" ? (
          <View
            pointerEvents="none"
            style={{ position: "absolute", right: 8, top: 46, width: 148, height: 138 }}
          >
            <Image source={art.source} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </View>
        ) : (
          <View pointerEvents="none" style={{ position: "absolute", right: 30, top: 68, opacity: 0.45 }}>
            <art.Icon size={86} color={colors.onPaperMuted} />
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 9 }}>
            <Animated.View
              entering={ZoomIn.springify().damping(12)}
              className="items-center justify-center rounded-full"
              style={{ width: 22, height: 22, backgroundColor: colors.ember }}
            >
              <CheckmarkIcon size={10} color={colors.onEmber} />
            </Animated.View>
            <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.onPaper }}>
              Principal feita
            </AppText>
          </View>

          {time ? (
            <View className="flex-row items-center" style={{ gap: 7 }}>
              <ClockIcon size={15} color={colors.onPaperMuted} />
              <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.onPaperMuted }}>
                {time}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Reserva a faixa da direita para o desenho: o texto quebra antes. */}
        <View style={{ marginTop: 16, paddingRight: art.kind === "illustration" ? 104 : 92 }}>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 40, lineHeight: 44, letterSpacing: -1.8, color: colors.onPaper }}
          >
            {title}
          </AppText>
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ marginTop: 6, fontSize: 14.5, lineHeight: 20, color: colors.onPaperMuted }}
          >
            {time ? `Feita hoje às ${time}` : "Feita hoje"}
          </AppText>
        </View>

        <View className="flex-row items-center" style={{ marginTop: 20, gap: 8 }}>
          <View className="rounded-full" style={{ backgroundColor: colors.ember, paddingVertical: 10, paddingHorizontal: 16 }}>
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.onEmber }}>
              +{xp} xp
            </AppText>
          </View>
          {streakDays > 0 ? (
            <View
              className="flex-row items-center rounded-full"
              style={{ gap: 6, backgroundColor: colors.paperSunken, paddingVertical: 10, paddingHorizontal: 14 }}
            >
              <FlameIcon size={14} color={colors.ember} />
              <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.onPaper }}>
                {streakDays} {streakDays === 1 ? "dia seguido" : "dias seguidos"}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
