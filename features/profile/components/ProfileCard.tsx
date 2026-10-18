import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { PencilIcon } from "@/components/ui/icons/settings";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type ProfileCardProps = {
  name: string;
  handle: string;
  avatarUrl?: string | null;
  onPress: () => void;
};

/**
 * Quem está logado, num cartão de papel — claro nos dois temas, como o card
 * da principal na Hoje. No claro o papel some contra o fundo, então ganha o
 * tom pêssego e uma borda.
 */
export function ProfileCard({ name, handle, avatarUrl, onPress }: ProfileCardProps) {
  const { colors, isDark } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${handle}. Editar informações pessoais`}
      style={{
        marginHorizontal: 16,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 18,
        borderRadius: 22,
        backgroundColor: isDark ? colors.paper : colors.emberWash,
        borderWidth: isDark ? 0 : 1,
        borderColor: colors.arcLight,
        opacity: pressed ? 0.9 : 1,
      }}
    >
      <Avatar name={name} uri={avatarUrl} size={70} tone="accent" />

      <View style={{ flex: 1, minWidth: 0 }}>
        <View className="flex-row items-start" style={{ gap: 10 }}>
          <AppText
            family="archivo"
            weight="black"
            numberOfLines={1}
            style={{ flex: 1, fontSize: 23, letterSpacing: -0.8, color: colors.onPaper }}
          >
            {name}
          </AppText>

          <View
            className="flex-row items-center rounded-full"
            style={{ gap: 6, height: 36, paddingHorizontal: 14, borderWidth: 1.5, borderColor: colors.ember }}
          >
            <PencilIcon size={14} color={colors.ember} />
            <AppText family="archivo" weight="bold" style={{ fontSize: 14, color: colors.ember }}>
              Editar
            </AppText>
          </View>
        </View>

        {handle ? (
          <AppText
            family="manrope"
            weight="medium"
            numberOfLines={1}
            style={{ marginTop: -2, fontSize: 15, color: colors.onPaperMuted }}
          >
            {handle}
          </AppText>
        ) : null}
        <AppText family="manrope" weight="medium" style={{ marginTop: 8, fontSize: 13, color: colors.onPaperMuted }}>
          Informações pessoais
        </AppText>
      </View>
    </Pressable>
  );
}
