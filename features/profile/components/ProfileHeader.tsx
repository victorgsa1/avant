import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

function HeaderStripes() {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, width: 152, height: 194, overflow: "hidden" }}>
      <Svg width={152} height={194} viewBox="0 0 152 194" fill="none" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="avPerfA" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.emberTint} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.emberTint} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="avPerfB" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.arcMid} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.arcMid} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="avPerfC" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.arcStrong} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.arcStrong} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d="M42 0 L82 0 L40 194 L0 194 Z" fill="url(#avPerfA)" />
        <Path d="M88 0 L118 0 L76 194 L46 194 Z" fill="url(#avPerfB)" />
        <Path d="M124 0 L138 0 L96 194 L82 194 Z" fill="url(#avPerfC)" />
      </Svg>
    </View>
  );
}

type ProfileHeaderProps = {
  name: string;
  handle: string;
  avatarInitial: string;
  onPressEdit?: () => void;
};

export function ProfileHeader({ name, handle, avatarInitial, onPressEdit }: ProfileHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: "relative" }}>
      <HeaderStripes />

      <View className="px-6" style={{ paddingTop: insets.top + 40 }}>
        <AppText family="archivo" weight="black" style={{ fontSize: 34, lineHeight: 36, letterSpacing: -1.4, color: colors.text }}>
          Perfil
        </AppText>

        <View className="flex-row items-center" style={{ gap: 16, marginTop: 24 }}>
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 66,
              height: 66,
              backgroundColor: colors.inverse,
              boxShadow: `0 0 0 3px ${colors.surface}, 0 0 0 5px ${colors.ember}`,
            }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 24, color: colors.onInverse }}>
              {avatarInitial}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText family="archivo" weight="black" style={{ fontSize: 22, letterSpacing: -0.8, color: colors.text }}>
              {name}
            </AppText>
            <AppText family="manrope" weight="medium" style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              {handle}
            </AppText>
            <AppText
              onPress={onPressEdit}
              family="manrope"
              weight="bold"
              style={{
                fontSize: 12.5,
                color: colors.ember,
                marginTop: 8,
                alignSelf: "flex-start",
                borderBottomWidth: 1.5,
                borderBottomColor: colors.arcStrong,
                paddingBottom: 1,
              }}
            >
              Editar perfil
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
