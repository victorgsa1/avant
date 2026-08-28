import { ActivityIndicator, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  withArrow?: boolean;
  /** The final CTAs in the flow sit taller and cast a heavier shadow. */
  emphasis?: "normal" | "strong";
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  withArrow = true,
  emphasis = "normal",
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const strong = emphasis === "strong";
  const inert = disabled || loading;

  return (
    <Pressable onPress={inert ? undefined : onPress} disabled={inert}>
      <View
        className="flex-row items-center justify-center rounded-full"
        style={{
          height: strong ? 60 : 58,
          gap: 10,
          opacity: inert ? 0.55 : 1,
          backgroundColor: colors.ember,
          boxShadow: strong ? `0 16px 34px ${colors.ember}57` : `0 12px 26px ${colors.ember}42`,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.onEmber} />
        ) : (
          <>
            <AppText
              family="archivo"
              weight="extraBold"
              style={{ fontSize: strong ? 16 : 15.5, letterSpacing: -0.2, color: colors.onEmber }}
            >
              {label}
            </AppText>
            {withArrow ? <ArrowRightIcon width={17} color={colors.onEmber} /> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}
