import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { NavHojeIcon, NavProfileIcon, NavProgressIcon, NavSocialIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const TABS: { href: Href; icon: typeof NavHojeIcon; label: string }[] = [
  { href: "/", icon: NavHojeIcon, label: "Hoje" },
  { href: "/social", icon: NavSocialIcon, label: "Social" },
  { href: "/progress", icon: NavProgressIcon, label: "Progresso" },
  { href: "/profile", icon: NavProfileIcon, label: "Perfil" },
];

// Custom floating bar for everywhere the system iOS 26 tab bar isn't
// available (Android, web, older iOS) — see `app/(tabs)/_layout.tsx`.
// Só ícones, como na barra nativa; o nome vai para o leitor de tela.
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
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => router.navigate(tab.href)}
            style={[
              {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 22,
              },
              isActive ? { backgroundColor: `${colors.ember}29` } : null,
            ]}
          >
            <tab.icon size={22} color={isActive ? colors.ember : colors.onInverseMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}
