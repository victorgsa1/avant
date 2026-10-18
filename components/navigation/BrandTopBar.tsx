import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvantLogo } from "@/components/ui/AvantLogo";
import { Avatar } from "@/components/ui/Avatar";
import { BellIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type BrandTopBarProps = {
  /** Nome de quem está logado — vira a inicial quando não há foto. */
  name: string;
  avatarUrl?: string | null;
  hasNotification?: boolean;
  onPressBell?: () => void;
  onPressAvatar?: () => void;
  /** No próprio Perfil o avatar não leva a lugar nenhum: some. */
  showAvatar?: boolean;
};

/**
 * A barra do topo das abas: a marca à esquerda, sino e avatar à direita.
 *
 * `Screen` é full-bleed, então a barra cuida do próprio `insets.top`.
 */
export function BrandTopBar({
  name,
  avatarUrl,
  hasNotification = false,
  onPressBell,
  onPressAvatar,
  showAvatar = true,
}: BrandTopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 14 }}>
      <View accessible accessibilityRole="header" accessibilityLabel="Avant">
        <AvantLogo height={28} />
      </View>

      <View className="flex-row items-center" style={{ gap: 16 }}>
        <Pressable
          onPress={onPressBell}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hasNotification ? "Notificações, há novidades" : "Notificações"}
          className="relative"
          style={{ width: 25, height: 25 }}
        >
          <BellIcon size={25} color={colors.text} />
          {hasNotification ? (
            <View
              className="absolute rounded-full"
              style={{ top: 0, right: 1, width: 6, height: 6, backgroundColor: colors.ember }}
            />
          ) : null}
        </Pressable>

        {showAvatar ? (
          <Pressable
            onPress={onPressAvatar}
            disabled={!onPressAvatar}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Avatar name={name} uri={avatarUrl} size={38} tone="sunken" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
