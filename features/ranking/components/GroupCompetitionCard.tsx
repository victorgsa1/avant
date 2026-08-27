import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { GroupAvatar } from "../types";

type GroupCompetitionCardProps = {
  title: string;
  daysLeftLabel: string;
  avatars: GroupAvatar[];
  participantsLabel: string;
  yourRank: number;
  onPressView?: () => void;
};

export function GroupCompetitionCard({
  title,
  daysLeftLabel,
  avatars,
  participantsLabel,
  yourRank,
  onPressView,
}: GroupCompetitionCardProps) {
  const { colors } = useTheme();
  return (
    <View className="mx-5 rounded-[26px]" style={{ backgroundColor: colors.emberTint, padding: 20, paddingHorizontal: 22 }}>
      <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 17, letterSpacing: -0.4, color: colors.text, maxWidth: 190 }}
        >
          {title}
        </AppText>
        <View className="rounded-full" style={{ backgroundColor: colors.surface, paddingVertical: 6, paddingHorizontal: 11 }}>
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberDeep }}>
            {daysLeftLabel}
          </AppText>
        </View>
      </View>

      <View className="flex-row items-center" style={{ gap: 14, marginTop: 16 }}>
        <View className="flex-row">
          {avatars.map((avatar, index) => (
            <View
              key={index}
              className="items-center justify-center rounded-full"
              style={{
                width: 30,
                height: 30,
                marginLeft: index === 0 ? 0 : -9,
                borderWidth: 2,
                borderColor: colors.emberTint,
                backgroundColor: avatar.isCurrentUser ? colors.inverse : colors.surfaceSunken,
              }}
            >
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ fontSize: 11, color: avatar.isCurrentUser ? colors.onInverse : colors.textMuted }}
              >
                {avatar.initial}
              </AppText>
            </View>
          ))}
        </View>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.emberDeep }}>
          {participantsLabel}
        </AppText>
      </View>

      <View className="flex-row items-center justify-between" style={{ marginTop: 18 }}>
        <View className="flex-row items-baseline" style={{ gap: 7 }}>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.emberDeep }}>
            Você está em
          </AppText>
          <AppText family="archivo" weight="black" style={{ fontSize: 24, letterSpacing: -1, color: colors.ember }}>
            #{yourRank}
          </AppText>
        </View>
        <Pressable
          onPress={onPressView}
          className="flex-row items-center rounded-full"
          style={{ gap: 7, backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 16 }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 12.5, color: colors.text }}>
            Ver competição
          </AppText>
          <ChevronRightIcon width={13} />
        </Pressable>
      </View>
    </View>
  );
}
