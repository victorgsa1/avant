import { Pressable, View } from "react-native";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AppText } from "@/components/ui/AppText";

type AccountFooterProps = {
  versionLabel: string;
  onPressSignOut?: () => void;
};

export function AccountFooter({ versionLabel, onPressSignOut }: AccountFooterProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 22 }}>
      <Pressable onPress={onPressSignOut}>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 13.5, color: colors.textMuted }}>
          Sair da conta
        </AppText>
      </Pressable>
      <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textFaint }}>
        {versionLabel}
      </AppText>
    </View>
  );
}
