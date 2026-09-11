import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { DecorativeRings } from "@/components/ui/DecorativeRings";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type NextActionCardProps = {
  /** Rótulo do topo do card. */
  label?: string;
  windowLabel: string;
  title: string;
  /** O que fazer, em uma linha (a versão do dia). */
  detail?: string | null;
  /** Null quando a ação não é medida em minutos. */
  minutes: number | null;
  xp: number;
  onPressStart?: () => void;
  onPressAdjust?: () => void;
};

export function NextActionCard({
  label = "A seguir",
  windowLabel,
  title,
  detail,
  minutes,
  xp,
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
          <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: `${colors.onEmber}EB` }}>
            {label}
          </AppText>
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
            style={{ fontSize: 40, lineHeight: 44, letterSpacing: -2, color: colors.onEmber }}
          >
            {title}
          </AppText>
          {detail ? (
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ marginTop: 6, fontSize: 13.5, lineHeight: 19, color: `${colors.onEmber}D9` }}
            >
              {detail}
            </AppText>
          ) : null}
          <View className="mt-3 flex-row items-center gap-2">
            {minutes ? (
              <View
                className="rounded-full"
                style={{ borderWidth: 1, borderColor: `${colors.onEmber}73`, paddingVertical: 5, paddingHorizontal: 11 }}
              >
                <AppText family="manrope" weight="bold" style={{ fontSize: 12, color: `${colors.onEmber}E6` }}>
                  {minutes} min
                </AppText>
              </View>
            ) : null}
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

        <View className="mt-5 flex-row items-center gap-2.5">
          <Pressable
            onPress={onPressStart}
            className="flex-1 flex-row items-center justify-center gap-2.5 rounded-full"
            style={{ backgroundColor: colors.onEmber, paddingVertical: 16, paddingHorizontal: 22 }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.ember }}>
              Concluir com foto
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
