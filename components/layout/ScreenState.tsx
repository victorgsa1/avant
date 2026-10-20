import { ActivityIndicator, Image, View } from "react-native";
import type { ImageSourcePropType, StyleProp, ViewProps, ViewStyle } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

/** Estado de carregamento inicial de uma aba. */
export function ScreenLoading() {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center" style={{ paddingBottom: 80 }}>
      <ActivityIndicator color={colors.ember} />
    </View>
  );
}

/** Falha de carregamento, com ação de tentar de novo. */
export function ScreenError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: 40, paddingBottom: 80 }}>
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 17, letterSpacing: -0.4, textAlign: "center", color: colors.text }}
      >
        Não deu para carregar
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ marginTop: 8, fontSize: 13.5, lineHeight: 20, textAlign: "center", color: colors.textMuted }}
      >
        {message}
      </AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ marginTop: 18 }}>
          <View
            className="rounded-full"
            style={{
              paddingVertical: 11,
              paddingHorizontal: 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
              Tentar de novo
            </AppText>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Lista vazia — título curto + uma linha de contexto.
 *
 * `style` e `onLayout` precisam chegar à View raiz: como
 * `ListEmptyComponent`, a lista injeta por eles a desinversão (`scaleY: -1`)
 * quando é `inverted` — sem isso o texto aparece de cabeça para baixo.
 */
export function EmptyState({
  title,
  description,
  action,
  image,
  style,
  onLayout,
}: {
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  image?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  onLayout?: ViewProps["onLayout"];
}) {
  const { colors } = useTheme();
  return (
    <View
      className="items-center"
      style={[{ paddingVertical: 34, paddingHorizontal: 26 }, style]}
      onLayout={onLayout}
    >
      {image ? (
        <Image source={image} style={{ width: 88, height: 88, marginBottom: 14 }} resizeMode="contain" />
      ) : null}
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 15.5, letterSpacing: -0.3, textAlign: "center", color: colors.textStrong }}
      >
        {title}
      </AppText>
      {description ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 7, fontSize: 13, lineHeight: 19.5, textAlign: "center", color: colors.textMuted }}
        >
          {description}
        </AppText>
      ) : null}
      {action ? (
        <Pressable onPress={action.onPress} style={{ marginTop: 14 }}>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.emberInk }}>
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
