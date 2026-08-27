import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { PodiumEntry } from "../types";

function PodiumColumn({ entry }: { entry: PodiumEntry }) {
  const { colors } = useTheme();
  const isFirst = entry.place === 1;
  const avatarSize = isFirst ? 60 : 48;

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: avatarSize,
          height: avatarSize,
          backgroundColor: isFirst ? colors.emberTint : colors.surfaceSunken,
          borderWidth: isFirst ? 2.5 : 0,
          borderColor: colors.ember,
        }}
      >
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: Math.round(avatarSize * 0.36), color: isFirst ? colors.emberDeep : colors.textMuted }}
        >
          {entry.initial}
        </AppText>
      </View>

      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 13.5, letterSpacing: -0.2, color: colors.text, marginTop: 9 }}
      >
        {entry.name}
      </AppText>
      <AppText
        family="manrope"
        weight="bold"
        style={{ fontSize: 12, marginTop: 2, color: isFirst ? colors.ember : colors.textMuted }}
      >
        {entry.pct}%
      </AppText>

      <View
        className="items-center rounded-t-[16px]"
        style={{
          marginTop: 10,
          width: "100%",
          height: entry.place === 1 ? 76 : entry.place === 2 ? 54 : 40,
          paddingTop: 10,
          backgroundColor: isFirst ? colors.emberTint : colors.bg,
        }}
      >
        <AppText family="archivo" weight="black" style={{ fontSize: 16, color: isFirst ? colors.ember : colors.textMuted }}>
          {entry.place}
        </AppText>
      </View>
    </View>
  );
}

type RankingPodiumProps = {
  podium: PodiumEntry[];
};

export function RankingPodium({ podium }: RankingPodiumProps) {
  return (
    <View className="flex-row items-end justify-center px-6" style={{ gap: 14, paddingTop: 30 }}>
      {podium.map((entry) => (
        <PodiumColumn key={entry.place} entry={entry} />
      ))}
    </View>
  );
}
