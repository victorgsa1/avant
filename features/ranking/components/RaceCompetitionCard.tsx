import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { RestartIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

export type RaceParticipant = {
  name: string;
  current: number;
  total: number;
  pct: number;
  isYou?: boolean;
};

type RaceCompetitionCardProps = {
  title: string;
  daysLeftLabel: string;
  participants: RaceParticipant[];
  footerNote?: string;
};

export function RaceCompetitionCard({ title, daysLeftLabel, participants, footerNote }: RaceCompetitionCardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-5 rounded-[26px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 20, paddingHorizontal: 22 }}
    >
      <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 17, letterSpacing: -0.4, color: colors.text }}>
          {title}
        </AppText>
        <View className="rounded-full" style={{ backgroundColor: colors.emberChip, paddingVertical: 6, paddingHorizontal: 11 }}>
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberDeep }}>
            {daysLeftLabel}
          </AppText>
        </View>
      </View>

      <View style={{ marginTop: 18, gap: 14 }}>
        {participants.map((p) => (
          <View key={p.name}>
            <View className="flex-row items-baseline justify-between">
              <AppText
                family="archivo"
                weight={p.isYou ? "extraBold" : "bold"}
                style={{ fontSize: 13.5, color: p.isYou ? colors.text : colors.text }}
              >
                {p.name}
              </AppText>
              <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.textMuted }}>
                {p.current} / {p.total} ações planejadas ·{" "}
                <AppText
                  family="archivo"
                  weight="black"
                  style={{ fontSize: 13, color: p.isYou ? colors.ember : colors.textMuted }}
                >
                  {p.pct}%
                </AppText>
              </AppText>
            </View>
            <View className="overflow-hidden rounded-full" style={{ height: 7, backgroundColor: colors.bg, marginTop: 8 }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${p.pct}%`, backgroundColor: p.isYou ? colors.ember : colors.arcStrong }}
              />
            </View>
          </View>
        ))}
      </View>

      {footerNote ? (
        <View
          className="flex-row items-center"
          style={{ gap: 7, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.surfaceRaised }}
        >
          <RestartIcon />
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.emberDeep }}>
            {footerNote}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
