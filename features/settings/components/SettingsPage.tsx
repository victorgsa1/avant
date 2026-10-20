import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type SettingsPageProps = {
  title: string;
  /** A mesma linha que leva até aqui no Perfil. */
  subtitle?: string;
  /** Tela com campo de texto: a rolagem acompanha o teclado. */
  keyboard?: boolean;
  /** Carregamento inicial: troca o conteúdo pelo indicador. */
  loading?: boolean;
  /** Falha sem dado nenhum para mostrar: troca o conteúdo pelo erro. */
  error?: string | null;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  children?: ReactNode;
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/profile");
}

/**
 * A casca das telas que saem do Perfil: voltar fixo no topo e o título
 * grande rolando com o conteúdo, no mesmo tamanho do "Perfil".
 */
export function SettingsPage({
  title,
  subtitle,
  keyboard = false,
  loading = false,
  error,
  onRetry,
  refreshing = false,
  onRefresh,
  children,
}: SettingsPageProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const body = loading ? (
    <ScreenLoading />
  ) : error ? (
    <ScreenError message={error} onRetry={onRetry} />
  ) : (
    children
  );

  const content = (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <AppText
          family="archivo"
          weight="black"
          accessibilityRole="header"
          style={{ fontSize: 32, lineHeight: 37, letterSpacing: -1.3, color: colors.text }}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 6, fontSize: 15, lineHeight: 21, color: colors.textMuted }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {body}
    </>
  );

  const scrollProps = {
    className: "flex-1",
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: "handled" as const,
    contentContainerStyle: { flexGrow: 1, paddingBottom: insets.bottom + 48 },
    refreshControl: onRefresh ? (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ember} />
    ) : undefined,
  };

  return (
    <Screen>
      <View style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 6 }}>
        <Pressable
          onPress={goBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <ChevronLeftIcon size={14} color={colors.text} />
        </Pressable>
      </View>

      {keyboard ? (
        <KeyboardAwareScrollView {...scrollProps} bottomOffset={24}>
          {content}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView {...scrollProps}>{content}</ScrollView>
      )}
    </Screen>
  );
}
