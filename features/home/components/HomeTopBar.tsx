import { Pressable, View } from "react-native";
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
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 16 }}>
      <View className="flex-row items-center gap-1.5">
        <AppText
          family="archivo"
          weight="black"
          italic
          style={{ fontSize: 19, letterSpacing: -0.4, color: colors.text }}
        >
          Avant
        </AppText>
        <View className="flex-row items-center gap-0.5">
          <View style={{ width: 9, height: 2, backgroundColor: colors.ember, transform: [{ skewX: "-30deg" }] }} />
          <View
            style={{ width: 5, height: 2, backgroundColor: colors.emberSoft, transform: [{ skewX: "-30deg" }] }}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-3.5">
        <Pressable onPress={onPressBell} hitSlop={8} className="relative" style={{ width: 20, height: 20 }}>
          <BellIcon color={colors.textMuted} />
          {hasNotification ? (
            <View
              className="absolute rounded-full"
              style={{ top: 0, right: 1, width: 5, height: 5, backgroundColor: colors.ember }}
            />
          ) : null}
        </Pressable>

        <View
          className="items-center justify-center rounded-full"
          style={{ width: 34, height: 34, borderWidth: 1.5, borderColor: colors.ember }}
        >
          <AppText family="archivo" weight="bold" style={{ fontSize: 13, color: colors.text }}>
            {avatarInitial}
          </AppText>
        </View>
      </View>
    </View>
  );
}
