import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { NavHojeIcon, NavProfileIcon, NavProgressIcon, NavSocialIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const TABS: { href: Href; icon: typeof NavHojeIcon; label: string }[] = [
  { href: "/", icon: NavHojeIcon, label: "Hoje" },
  { href: "/social", icon: NavSocialIcon, label: "Social" },
  { href: "/progress", icon: NavProgressIcon, label: "Progresso" },
  { href: "/profile", icon: NavProfileIcon, label: "Perfil" },
];

// Static fallback for environments without the native glass/gesture/reanimated
// stack compiled in (Expo Go). No GlassView, no GestureDetector, no drag —
// just tap-to-switch, same layout and icons as GlassTabBar.
export function SimpleTabBar({ activeIndex }: { activeIndex: number }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        height: 62,
        borderRadius: 31,
        backgroundColor: colors.inverse,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab.label}
            haptic="selection"
            onPress={() => router.navigate(tab.href)}
            style={[
              {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                paddingVertical: 7,
                borderRadius: 22,
              },
              isActive ? { backgroundColor: `${colors.ember}29` } : null,
            ]}
          >
            <tab.icon color={isActive ? colors.ember : colors.onInverseMuted} />
            <AppText
              family="manrope"
              weight={isActive ? "extraBold" : "semiBold"}
              numberOfLines={1}
              style={{ fontSize: 10, color: isActive ? colors.ember : colors.onInverseMuted }}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
