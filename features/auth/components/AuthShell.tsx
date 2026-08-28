import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppText } from "@/components/ui/AppText";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { OnboardingCanvas } from "@/features/onboarding/components/OnboardingCanvas";

type AuthShellProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** Moldura compartilhada das telas de e-mail/senha (entrar e criar conta). */
export function AuthShell({ title, subtitle, onBack, children, footer }: AuthShellProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <OnboardingCanvas>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 26,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={onBack}
            hitSlop={10}
            className="items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <ChevronLeftIcon color={colors.textMuted} />
          </Pressable>

          <AppText
            family="archivo"
            weight="black"
            style={{
              marginTop: 28,
              fontSize: 32,
              lineHeight: 35,
              letterSpacing: -1.4,
              color: colors.text,
            }}
          >
            {title}
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{
              marginTop: 10,
              maxWidth: 310,
              fontSize: 14.5,
              lineHeight: 22,
              color: colors.textMuted,
            }}
          >
            {subtitle}
          </AppText>

          <View style={{ marginTop: 28, gap: 16 }}>{children}</View>

          <View style={{ flex: 1, minHeight: 20 }} />

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingCanvas>
  );
}
