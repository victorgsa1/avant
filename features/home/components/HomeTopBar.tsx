import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { BellIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type HomeTopBarProps = {
  avatarInitial: string;
  onPressBell?: () => void;
  hasNotification?: boolean;
};

export function HomeTopBar({ avatarInitial, onPressBell, hasNotification = true }: HomeTopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 14 }}>
      <View className="flex-row items-center" style={{ gap: 7 }}>
        <AppText
          family="archivo"
          weight="black"
          italic
          style={{ fontSize: 26, letterSpacing: -0.8, color: colors.text }}
        >
          Avant
        </AppText>
        <View className="flex-row items-center" style={{ gap: 3 }}>
          <View style={{ width: 4, height: 15, borderRadius: 2, backgroundColor: colors.ember, transform: [{ skewX: "-14deg" }] }} />
          <View style={{ width: 4, height: 15, borderRadius: 2, backgroundColor: colors.ember, transform: [{ skewX: "-14deg" }] }} />
        </View>
      </View>

      <View className="flex-row items-center" style={{ gap: 16 }}>
        <Pressable onPress={onPressBell} hitSlop={10} className="relative" style={{ width: 25, height: 25 }}>
          <BellIcon size={25} color={colors.text} />
          {hasNotification ? (
            <View
              className="absolute rounded-full"
              style={{ top: 0, right: 1, width: 6, height: 6, backgroundColor: colors.ember }}
            />
          ) : null}
        </Pressable>

        <View
          className="items-center justify-center rounded-full"
          style={{ width: 38, height: 38, backgroundColor: colors.surfaceSunken }}
        >
          <AppText family="archivo" weight="bold" style={{ fontSize: 15, color: colors.text }}>
            {avatarInitial}
          </AppText>
        </View>
      </View>
    </View>
  );
}
