import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { SocialTab } from "../types";

const TABS: { key: SocialTab; label: string }[] = [
  { key: "ranking", label: "Ranking" },
  { key: "amigos", label: "Amigos" },
  { key: "competicoes", label: "Competições" },
];

type SocialTabsProps = {
  active: SocialTab;
  onChange: (tab: SocialTab) => void;
};

export function SocialTabs({ active, onChange }: SocialTabsProps) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row px-6 mt-1"
      style={{ gap: 22, borderBottomWidth: 1, borderBottomColor: colors.bg }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              paddingBottom: 12,
              borderBottomWidth: 2.5,
              borderBottomColor: isActive ? colors.ember : "transparent",
              marginBottom: -1,
            }}
          >
            <AppText
              family="archivo"
              weight={isActive ? "extraBold" : "semiBold"}
              style={{ fontSize: 14.5, letterSpacing: -0.2, color: isActive ? colors.ember : colors.textMuted }}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
