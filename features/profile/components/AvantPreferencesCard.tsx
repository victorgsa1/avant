import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AvantPreference } from "../types";

type AvantPreferencesCardProps = {
  preferences: AvantPreference[];
};

export function AvantPreferencesCard({ preferences }: AvantPreferencesCardProps) {
  const { colors } = useTheme();
  return (
    <>
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text, paddingHorizontal: 24, paddingTop: 34 }}
      >
        Como o Avant trabalha comigo
      </AppText>

      <View
        className="mx-5 overflow-hidden rounded-[26px]"
        style={{ marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
      >
        {preferences.map((pref, index) => (
          <View
            key={pref.label}
            className="flex-row items-start"
            style={{
              gap: 12,
              padding: 18,
              paddingHorizontal: 20,
              borderBottomWidth: index < preferences.length - 1 ? 1 : 0,
              borderBottomColor: colors.surfaceRaised,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.textMuted }}>
                {pref.label}
              </AppText>
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ fontSize: 15.5, letterSpacing: -0.3, color: colors.text, marginTop: 3 }}
              >
                {pref.value}
              </AppText>
              <AppText
                family="manrope"
                weight="medium"
                style={{ fontSize: 12, lineHeight: 16.8, color: colors.textMuted, marginTop: 4, maxWidth: 236 }}
              >
                {pref.help}
              </AppText>
            </View>
            <ChevronRightIcon width={13} color={colors.textFaint} />
          </View>
        ))}
      </View>
    </>
  );
}
