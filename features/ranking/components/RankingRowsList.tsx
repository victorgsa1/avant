import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { RankRow } from "../types";

function RankRowItem({ row }: { row: RankRow }) {
  const { colors } = useTheme();
  const isYou = !!row.isCurrentUser;
  const isUp = row.move.startsWith("↑");

  return (
    <View
      className="flex-row items-center rounded-2xl"
      style={{
        gap: 13,
        paddingVertical: 13,
        paddingHorizontal: 12,
        backgroundColor: isYou ? colors.emberTint : "transparent",
      }}
    >
      <AppText
        family="archivo"
        weight="black"
        style={{ width: 16, fontSize: 13, color: isYou ? colors.ember : colors.textFaint }}
      >
        {row.pos}
      </AppText>
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 34,
          height: 34,
          backgroundColor: isYou ? colors.inverse : colors.surfaceSunken,
          borderWidth: isYou ? 2 : 0,
          borderColor: colors.ember,
        }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 12, color: isYou ? colors.onInverse : colors.textMuted }}>
          {row.name.charAt(0)}
        </AppText>
      </View>
      <AppText
        family="archivo"
        weight={isYou ? "extraBold" : "bold"}
        style={{ flex: 1, fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}
      >
        {row.name}
      </AppText>
      {row.move ? (
        <AppText family="manrope" weight="bold" style={{ fontSize: 11, color: isUp ? colors.success : colors.textFaint }}>
          {row.move}
        </AppText>
      ) : null}
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 13, minWidth: 34, textAlign: "right", color: isYou ? colors.text : colors.textMuted }}
      >
        {row.pct}%
      </AppText>
    </View>
  );
}

type RankingRowsListProps = {
  rows: RankRow[];
};

export function RankingRowsList({ rows }: RankingRowsListProps) {
  return (
    <View className="px-6" style={{ paddingTop: 28 }}>
      {rows.map((row) => (
        <RankRowItem key={row.pos} row={row} />
      ))}
    </View>
  );
}
