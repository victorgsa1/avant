import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type SimpleListSectionProps = {
  title: string;
  items: string[];
  onPressItem?: (item: string) => void;
  topPadding?: number;
};

export function SimpleListSection({ title, items, onPressItem, topPadding = 34 }: SimpleListSectionProps) {
  const { colors } = useTheme();
  return (
    <View className="px-6" style={{ paddingTop: topPadding }}>
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
        {title}
      </AppText>
      <View style={{ marginTop: 4 }}>
        {items.map((item) => (
          <Pressable
            key={item}
            onPress={() => onPressItem?.(item)}
            className="flex-row items-center"
            style={{ gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }}
          >
            <AppText
              family="archivo"
              weight="semiBold"
              style={{ flex: 1, fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}
            >
              {item}
            </AppText>
            <ChevronRightIcon width={13} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
