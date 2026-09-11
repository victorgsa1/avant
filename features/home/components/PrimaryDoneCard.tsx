import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { DecorativeRings } from "@/components/ui/DecorativeRings";
import { CheckmarkIcon, FlameIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type PrimaryDoneCardProps = {
  title: string;
  completedAt: string | null;
  xp: number;
  streakDays: number;
};

function timeOf(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** A principal depois de feita: o mesmo card, agora como o troféu do dia. */
export function PrimaryDoneCard({ title, completedAt, xp, streakDays }: PrimaryDoneCardProps) {
  const { colors } = useTheme();
  const time = timeOf(completedAt);

  return (
    <View className="mt-[30px] px-5">
      <View
        className="overflow-hidden rounded-[30px] px-[22px] pb-[22px] pt-[22px]"
        style={{ backgroundColor: colors.ember, boxShadow: `0 20px 40px ${colors.ember}38` }}
      >
        <View pointerEvents="none" style={{ position: "absolute", right: -96, top: -108, opacity: 0.12 }}>
          <DecorativeRings
            size={300}
            rings={[
              { radius: 144, strokeWidth: 1.4, color: colors.surface },
              { radius: 112, strokeWidth: 14, color: colors.surface },
              { radius: 82, strokeWidth: 1.4, color: colors.surface },
            ]}
          />
        </View>

        <View className="flex-row items-center gap-3">
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.onEmber,
            }}
          >
            <CheckmarkIcon size={18} color={colors.ember} />
          </Animated.View>
          <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: `${colors.onEmber}EB` }}>
            {time ? `Feita hoje às ${time}` : "Feita hoje"}
          </AppText>
        </View>

        <AppText
          family="archivo"
          weight="black"
          style={{ marginTop: 16, fontSize: 36, lineHeight: 40, letterSpacing: -1.6, color: colors.onEmber }}
        >
          {title}
        </AppText>

        <View className="mt-4 flex-row items-center gap-2">
          <View className="rounded-full" style={{ backgroundColor: colors.onEmber, paddingVertical: 6, paddingHorizontal: 12 }}>
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.ember }}>
              +{xp} xp
            </AppText>
          </View>
          {streakDays > 0 ? (
            <View
              className="flex-row items-center gap-1.5 rounded-full"
              style={{ borderWidth: 1, borderColor: `${colors.onEmber}73`, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <FlameIcon size={13} color={colors.onEmber} />
              <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: colors.onEmber }}>
                {streakDays} {streakDays === 1 ? "dia seguido" : "dias seguidos"}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
