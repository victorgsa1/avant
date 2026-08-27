import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

type SocialButtonProps = {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
  /**
   * `contrast` is the Apple button: black on light, white on dark. Apple's
   * Sign in with Apple guidelines require it to invert with the surrounding
   * appearance rather than stay one fixed color.
   */
  tone?: "contrast" | "plain";
};

export function SocialButton({ label, icon, onPress, tone = "plain" }: SocialButtonProps) {
  const { colors } = useTheme();
  const contrast = tone === "contrast";

  return (
    <Pressable onPress={onPress}>
      <View
        className="flex-row items-center justify-center rounded-full"
        style={{
          height: 56,
          gap: 10,
          backgroundColor: contrast ? colors.contrast : colors.surface,
          borderWidth: contrast ? 0 : 1,
          borderColor: colors.line,
          boxShadow: contrast ? `0 10px 24px ${colors.shadowStrong}` : `0 2px 10px ${colors.shadow}`,
        }}
      >
        {icon}
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 15, letterSpacing: -0.2, color: contrast ? colors.onContrast : colors.textStrong }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
