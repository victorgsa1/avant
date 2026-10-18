import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SOCIAL_ART } from "../../art";
import { plural } from "../../format";

type FriendRequestsBannerProps = {
  incomingCount: number;
  outgoingCount: number;
  onPress: () => void;
};

/**
 * Pedidos recebidos ganham a folha clara com o envelope — é o que pede ação.
 * Só enviados (esperando o outro lado) viram uma linha discreta.
 */
export function FriendRequestsBanner({ incomingCount, outgoingCount, onPress }: FriendRequestsBannerProps) {
  const { colors } = useTheme();

  if (incomingCount === 0 && outgoingCount === 0) return null;

  if (incomingCount === 0) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="mx-5 flex-row items-center justify-between"
        style={{ marginTop: 16, paddingVertical: 6 }}
      >
        <AppText family="manrope" weight="medium" style={{ fontSize: 14, color: colors.textMuted }}>
          {plural(outgoingCount, "pedido enviado", "pedidos enviados")} · aguardando resposta
        </AppText>
        <ChevronIcon size={11} color={colors.textMuted} />
      </Pressable>
    );
  }

  const label = plural(incomingCount, "pedido de amizade", "pedidos de amizade");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. Ver`}
      className="mx-5 flex-row items-center rounded-[22px]"
      style={{ marginTop: 16, gap: 16, paddingVertical: 12, paddingLeft: 14, paddingRight: 20, backgroundColor: colors.paper }}
    >
      <View>
        <Image source={SOCIAL_ART.pedidos} resizeMode="contain" style={{ width: 62, height: 62 }} />
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            top: -2,
            right: -4,
            minWidth: 24,
            height: 24,
            paddingHorizontal: 6,
            backgroundColor: colors.ember,
            borderWidth: 2,
            borderColor: colors.paper,
          }}
        >
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 12, color: colors.onEmber }}>
            {incomingCount > 9 ? "9+" : incomingCount}
          </AppText>
        </View>
      </View>

      <AppText
        family="archivo"
        weight="extraBold"
        numberOfLines={2}
        style={{ flex: 1, fontSize: 17, letterSpacing: -0.3, color: colors.onPaper }}
      >
        {label}
      </AppText>

      <View className="flex-row items-center" style={{ gap: 10 }}>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 15, color: colors.onPaper }}>
          Ver
        </AppText>
        <ChevronIcon size={13} color={colors.onPaper} />
      </View>
    </Pressable>
  );
}
