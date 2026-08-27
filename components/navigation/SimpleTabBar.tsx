import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { NavHojeIcon, NavProfileIcon, NavProgressIcon, NavRankingIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const TABS: { href: Href; icon: typeof NavHojeIcon; label: string }[] = [
  { href: "/", icon: NavHojeIcon, label: "Hoje" },
  { href: "/ranking", icon: NavRankingIcon, label: "Ranking" },
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
        justifyContent: "space-around",
        paddingHorizontal: 8,
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab.label}
            onPress={() => router.navigate(tab.href)}
            className="items-center justify-center rounded-[22px]"
            style={[
              { gap: 4, paddingVertical: 7, paddingHorizontal: 15 },
              isActive ? { backgroundColor: `${colors.ember}29` } : null,
            ]}
          >
            <tab.icon color={isActive ? colors.ember : colors.onInverseMuted} />
            <AppText
              family="manrope"
              weight={isActive ? "extraBold" : "semiBold"}
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
