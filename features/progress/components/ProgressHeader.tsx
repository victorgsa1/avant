import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { DecorativeRings } from "@/components/ui/DecorativeRings";
import { BellIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type ProgressHeaderProps = {
  greeting: string;
  name: string;
  hasNotification?: boolean;
};

export function ProgressHeader({ greeting, name, hasNotification = true }: ProgressHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: "relative" }}>
      <View pointerEvents="none" style={{ position: "absolute", top: -186, right: -206 }}>
        <DecorativeRings
          size={440}
          rings={[
            { radius: 166, strokeWidth: 1.5, color: colors.arcMid },
            { radius: 140, strokeWidth: 1.5, color: colors.arcStrong },
          ]}
        />
      </View>

      <View className="flex-row items-start justify-between px-6" style={{ paddingTop: insets.top + 40 }}>
        <View>
          <AppText family="archivo" weight="medium" style={{ fontSize: 13.5, color: colors.textMuted }}>
            {greeting}, {name}
          </AppText>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 34, lineHeight: 36, letterSpacing: -1.4, color: colors.text, marginTop: 6 }}
          >
            Seu progresso
          </AppText>
          <AppText family="manrope" weight="medium" style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
            Você está construindo consistência.
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
