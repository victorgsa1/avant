import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { DecorativeRings } from "@/components/ui/DecorativeRings";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { RankingEntry } from "../types";

function Avatar({ initial, highlighted }: { initial: string; highlighted?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: 28,
        height: 28,
        borderWidth: highlighted ? 1.4 : 1,
        borderColor: highlighted ? colors.ember : colors.arcLight,
      }}
    >
      <AppText family="archivo" weight="bold" style={{ fontSize: 11, color: highlighted ? colors.text : colors.emberDeep }}>
        {initial}
      </AppText>
    </View>
  );
}

function RankingRow({ entry, isLast }: { entry: RankingEntry; isLast: boolean }) {
  const { colors } = useTheme();
  const highlighted = !!entry.isCurrentUser;
  return (
    <View
      className="flex-row items-center gap-3.5"
      style={{
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      {highlighted ? (
        <View style={{ position: "absolute", left: -24, top: 6, bottom: 6, width: 3, backgroundColor: colors.ember }} />
      ) : null}
      <AppText
        family="manrope"
        weight={highlighted ? "extraBold" : "bold"}
        style={{ width: 13, fontSize: 12, color: highlighted ? colors.ember : colors.textMuted }}
      >
        {entry.rank}
      </AppText>
      <Avatar initial={entry.initial} highlighted={highlighted} />
      <AppText
        family="archivo"
        weight={highlighted ? "extraBold" : "semiBold"}
        style={{ flex: 1, fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}
      >
        {entry.name}
      </AppText>
      <AppText
        family="manrope"
        weight={highlighted ? "extraBold" : "bold"}
        style={{ fontSize: 13, color: highlighted ? colors.text : colors.textMuted }}
      >
        {entry.xp.toLocaleString("pt-BR")}
      </AppText>
    </View>
  );
}

type FriendsRankingCardProps = {
  ranking: RankingEntry[];
  gapXP: number;
  rivalName: string;
  onPressRanking?: () => void;
};

export function FriendsRankingCard({ ranking, gapXP, rivalName, onPressRanking }: FriendsRankingCardProps) {
  const { colors } = useTheme();
  const currentUser = ranking.find((entry) => entry.isCurrentUser);

  return (
    <View className="mt-[34px] px-6" style={{ position: "relative" }}>
      <View pointerEvents="none" style={{ position: "absolute", left: -90, bottom: -40 }}>
        <DecorativeRings
          size={240}
          rings={[
            { radius: 114, strokeWidth: 12, color: colors.arcLight },
            { radius: 88, strokeWidth: 1.3, color: colors.arcMid },
          ]}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <AppText family="archivo" weight="black" style={{ fontSize: 20, letterSpacing: -0.6, color: colors.text }}>
          Seus amigos
        </AppText>
        <Pressable onPress={onPressRanking} className="flex-row items-center gap-1.5">
          <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.ember }}>
            Ranking
          </AppText>
          <ChevronRightIcon color={colors.ember} />
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-end gap-4">
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <AppText family="archivo" weight="black" style={{ fontSize: 70, lineHeight: 76, letterSpacing: -3.6, color: colors.ember }}>
            {currentUser?.rank ?? 0}
          </AppText>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.6, color: colors.ember, marginTop: 4 }}
          >
            º
          </AppText>
        </View>
        <AppText family="manrope" weight="medium" style={{ fontSize: 13, lineHeight: 18.9, color: colors.textMuted, paddingBottom: 6 }}>
          {gapXP} xp para alcançar{"\n"}
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 15, color: colors.text }}>
            {rivalName}
          </AppText>
        </AppText>
      </View>

      <View className="mt-[18px]">
        {ranking.map((entry, index) => (
          <RankingRow key={entry.rank} entry={entry} isLast={index === ranking.length - 1} />
        ))}
      </View>
    </View>
  );
}
