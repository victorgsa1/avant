import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

function DirectionMountain() {
  const { colors } = useTheme();
  return (
    <Svg
      width={150}
      height={100}
      viewBox="0 0 150 100"
      fill="none"
      style={{ position: "absolute", right: -10, bottom: -14, opacity: 0.6 }}
    >
      <Path d="M0 100 L38 56 L60 72 L96 26 L124 54 L150 30 L150 100 Z" fill={colors.arcMid} />
      <Path d="M96 26 V6" stroke={colors.emberDeep} strokeWidth={2} />
      <Path d="M96 7 L110 11 L96 15 Z" fill={colors.emberDeep} />
    </Svg>
  );
}

type DirectionCardProps = {
  statement: string;
  helperText: string;
  onPressEdit?: () => void;
};

export function DirectionCard({ statement, helperText, onPressEdit }: DirectionCardProps) {
  const { colors } = useTheme();
  return (
    <>
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text, paddingHorizontal: 24, paddingTop: 34 }}
      >
        Minha direção
      </AppText>

      <View
        className="mx-5 overflow-hidden rounded-[28px]"
        style={{ marginTop: 12, backgroundColor: colors.emberTint, padding: 24, paddingTop: 24, paddingBottom: 22 }}
      >
        <DirectionMountain />
        <View style={{ maxWidth: 262 }}>
          <AppText
            family="archivo"
            weight="bold"
            style={{ fontSize: 19, lineHeight: 25.6, letterSpacing: -0.5, color: colors.text }}
          >
            {statement}
          </AppText>
          <View className="flex-row items-center" style={{ gap: 16, marginTop: 18 }}>
            <AppText
              onPress={onPressEdit}
              family="manrope"
              weight="bold"
              style={{
                fontSize: 12.5,
                color: colors.emberDeep,
                backgroundColor: colors.surface,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 16,
                overflow: "hidden",
              }}
            >
              Editar
            </AppText>
            <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.emberDeep }}>
              {helperText}
            </AppText>
          </View>
        </View>
      </View>
    </>
  );
}
