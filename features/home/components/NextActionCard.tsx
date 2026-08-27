import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { DecorativeRings } from "@/components/ui/DecorativeRings";
import { ArrowRightIcon, ClockIcon, InsightCheckIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type NextActionCardProps = {
  windowLabel: string;
  title: string;
  minutes: number;
  xp: number;
  insight?: string;
  onPressStart?: () => void;
  onPressAdjust?: () => void;
};

export function NextActionCard({
  windowLabel,
  title,
  minutes,
  xp,
  insight,
  onPressStart,
  onPressAdjust,
}: NextActionCardProps) {
  const { colors } = useTheme();
  return (
    <View className="mt-[30px] px-5">
      <View
        className="overflow-hidden rounded-[30px] px-[22px] pb-5 pt-[22px]"
        style={{ backgroundColor: colors.ember, boxShadow: `0 20px 40px ${colors.ember}38` }}
      >
        <View pointerEvents="none" style={{ position: "absolute", right: -96, top: -108, opacity: 0.1 }}>
          <DecorativeRings
            size={300}
            rings={[
              { radius: 144, strokeWidth: 1.4, color: colors.surface },
              { radius: 112, strokeWidth: 14, color: colors.surface },
              { radius: 82, strokeWidth: 1.4, color: colors.surface },
            ]}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <ArrowRightIcon width={18} color={colors.onEmber} />
            <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: `${colors.onEmber}EB` }}>
              A seguir
            </AppText>
          </View>
          <View
            className="flex-row items-center gap-1.5 rounded-full"
            style={{ backgroundColor: `${colors.onEmber}2E`, paddingVertical: 5, paddingHorizontal: 11 }}
          >
            <ClockIcon size={12} color={colors.onEmber} />
            <AppText family="manrope" weight="bold" style={{ fontSize: 11, color: colors.onEmber }}>
              {windowLabel}
            </AppText>
          </View>
        </View>

        <View className="mt-4">
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 44, lineHeight: 48, letterSpacing: -2.2, color: colors.onEmber }}
          >
            {title}
          </AppText>
          <View className="mt-2.5 flex-row items-center gap-2">
            <View
              className="rounded-full"
              style={{ borderWidth: 1, borderColor: `${colors.onEmber}73`, paddingVertical: 5, paddingHorizontal: 11 }}
            >
              <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: `${colors.onEmber}E6` }}>
                {minutes} min
              </AppText>
            </View>
            <View
              className="rounded-full"
              style={{ borderWidth: 1, borderColor: `${colors.onEmber}73`, paddingVertical: 5, paddingHorizontal: 11 }}
            >
              <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: `${colors.onEmber}E6` }}>
                +{xp} xp
              </AppText>
            </View>
          </View>
        </View>

        {insight ? (
          <View
            className="mt-4 flex-row gap-2.5 rounded-[18px]"
            style={{ backgroundColor: `${colors.onEmber}29`, padding: 13 }}
          >
            <View style={{ marginTop: 2 }}>
              <InsightCheckIcon color={colors.onEmber} />
            </View>
            <AppText family="manrope" weight="regular" style={{ flex: 1, fontSize: 12, lineHeight: 17.4, color: `${colors.onEmber}F2` }}>
              {insight}
            </AppText>
          </View>
        ) : null}

        <View className="mt-[18px] flex-row items-center gap-2.5">
          <Pressable
            onPress={onPressStart}
            className="flex-1 flex-row items-center justify-center gap-2.5 rounded-full"
            style={{ backgroundColor: colors.onEmber, paddingVertical: 16, paddingHorizontal: 22 }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.ember }}>
              Começar
            </AppText>
            <ArrowRightIcon width={17} color={colors.ember} />
          </Pressable>
          <Pressable
            onPress={onPressAdjust}
            className="rounded-full"
            style={{ borderWidth: 1.4, borderColor: `${colors.onEmber}8C`, paddingVertical: 16, paddingHorizontal: 20 }}
          >
            <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.onEmber }}>
              Ajustar
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
