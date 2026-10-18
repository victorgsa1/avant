import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { FlameIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { PublicProfileResponse } from "@/services/http/types";
import { monthYearLabel } from "../../format";

function Stat({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-1 items-center rounded-[18px]"
      style={{ paddingVertical: 14, paddingHorizontal: 8, backgroundColor: colors.paper }}
    >
      <View className="flex-row items-center" style={{ gap: 5 }}>
        {icon}
        <AppText
          family="archivo"
          weight="black"
          numberOfLines={1}
          style={{ fontSize: 24, letterSpacing: -0.8, color: colors.onPaper }}
        >
          {value}
        </AppText>
      </View>
      <AppText
        family="manrope"
        weight="medium"
        numberOfLines={1}
        style={{ marginTop: 2, fontSize: 12.5, color: colors.onPaperMuted }}
      >
        {label}
      </AppText>
    </View>
  );
}

/**
 * Quem é a pessoa: foto, nome, @usuário e os números "do jogo" — o mesmo
 * recorte que já aparece no ranking e nas buscas. Rotina e áreas ficam com ela.
 */
export function PublicProfileHeader({ profile }: { profile: PublicProfileResponse }) {
  const { colors } = useTheme();

  return (
    <View className="px-5">
      <View className="items-center">
        <Avatar name={profile.name} uri={profile.avatarUrl} size={104} ring />
        <AppText
          family="archivo"
          weight="black"
          numberOfLines={2}
          style={{ marginTop: 16, fontSize: 26, letterSpacing: -0.9, textAlign: "center", color: colors.text }}
        >
          {profile.name}
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={1}
          style={{ marginTop: 2, fontSize: 15, color: colors.textMuted }}
        >
          @{profile.username}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ marginTop: 8, fontSize: 13, color: colors.textFaint }}>
          No Avant desde {monthYearLabel(profile.memberSince)}
        </AppText>
      </View>

      <View
        className="flex-row"
        style={{ marginTop: 24, gap: 10 }}
        accessible
        accessibilityLabel={`Nível ${profile.level}, ${profile.xpTotal} XP. Sequência atual de ${profile.streakCurrent} dias, recorde de ${profile.streakBest}.`}
      >
        <Stat value={String(profile.level)} label={`nível · ${profile.xpTotal} XP`} />
        <Stat
          value={String(profile.streakCurrent)}
          label={profile.streakCurrent === 1 ? "dia seguido" : "dias seguidos"}
          icon={<FlameIcon size={16} color={colors.ember} />}
        />
        <Stat value={String(profile.streakBest)} label="recorde" />
      </View>
    </View>
  );
}
