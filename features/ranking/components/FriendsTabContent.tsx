import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Friend } from "../types";

function FriendRow({ friend }: { friend: Friend }) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 38, height: 38, backgroundColor: colors.surfaceSunken }}
      >
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.textMuted }}>
          {friend.name.charAt(0)}
        </AppText>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}>
          {friend.name}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
          {friend.handle}
        </AppText>
      </View>
      <View className="flex-row items-center" style={{ gap: 9 }}>
        <View className="overflow-hidden rounded-full" style={{ width: 44, height: 5, backgroundColor: colors.bg }}>
          <View className="h-full rounded-full" style={{ width: `${friend.pct}%`, backgroundColor: colors.ember }} />
        </View>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          {friend.pct}%
        </AppText>
      </View>
    </View>
  );
}

type FriendsTabContentProps = {
  friends: Friend[];
  onPressAddFriends?: () => void;
};

export function FriendsTabContent({ friends, onPressAddFriends }: FriendsTabContentProps) {
  const { colors } = useTheme();
  return (
    <>
      <View className="flex-row items-baseline justify-between px-6" style={{ paddingTop: 24 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
          Seus amigos
        </AppText>
        <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: colors.textMuted }}>
          {friends.length} amigos
        </AppText>
      </View>

      <View className="px-6" style={{ paddingTop: 14 }}>
        <View
          className="flex-row items-center rounded-2xl"
          style={{ gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14, paddingHorizontal: 15 }}
        >
          <SearchIcon />
          <AppText family="manrope" weight="medium" style={{ fontSize: 13.5, color: colors.textFaint }}>
            Nome ou @usuário
          </AppText>
        </View>
      </View>

      <View className="px-6" style={{ paddingTop: 8 }}>
        {friends.map((friend) => (
          <FriendRow key={friend.handle} friend={friend} />
        ))}
      </View>

      <View className="px-6" style={{ paddingTop: 22 }}>
        <Pressable
          onPress={onPressAddFriends}
          className="flex-row items-center justify-center rounded-full"
          style={{
            gap: 9,
            backgroundColor: colors.ember,
            paddingVertical: 16,
            paddingHorizontal: 22,
            boxShadow: `0 12px 26px ${colors.ember}38`,
          }}
        >
          <PlusIcon size={16} />
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 14.5, letterSpacing: -0.1, color: colors.onEmber }}>
            Adicionar amigos
          </AppText>
        </Pressable>
        <AppText
          family="manrope"
          weight="medium"
          style={{ fontSize: 11.5, color: colors.textMuted, textAlign: "center", marginTop: 10 }}
        >
          Busque por nome, @usuário ou compartilhe seu convite.
        </AppText>
      </View>
    </>
  );
}
