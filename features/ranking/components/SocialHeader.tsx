import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { BellIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

function HeaderBlob() {
  const { colors } = useTheme();
  return (
    <Svg width={200} height={180} viewBox="0 0 200 180" fill="none" style={{ position: "absolute", top: -26, right: -30 }}>
      <Circle cx={118} cy={70} r={52} fill={colors.emberTint} />
      <Circle cx={164} cy={104} r={52} fill={colors.arcMid} opacity={0.75} />
      <Circle cx={150} cy={34} r={26} fill={colors.arcStrong} opacity={0.5} />
    </Svg>
  );
}

type SocialHeaderProps = {
  subtitle: string;
  hasNotification?: boolean;
};

export function SocialHeader({ subtitle, hasNotification = true }: SocialHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: "relative" }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0 }}>
        <HeaderBlob />
      </View>

      <View className="flex-row items-start justify-between px-6" style={{ paddingTop: insets.top + 40 }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 34, lineHeight: 36, letterSpacing: -1.4, color: colors.text }}
          >
            Ranking
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, maxWidth: 250 }}
          >
            {subtitle}
          </AppText>
        </View>

        <View className="relative mt-1.5" style={{ width: 20, height: 20 }}>
          <BellIcon />
          {hasNotification ? (
            <View
              className="absolute rounded-full"
              style={{ top: 0, right: 1, width: 5, height: 5, backgroundColor: colors.ember }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
