import { StatusBar } from "expo-status-bar";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { AppleIcon, GoogleIcon, MailIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SocialButton } from "@/features/auth/components/SocialButton";
import { useSession } from "@/features/auth/SessionProvider";
import { LoginArt } from "@/features/onboarding/components/illustrations";
import { OnboardingCanvas } from "@/features/onboarding/components/OnboardingCanvas";

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();

  return (
    <OnboardingCanvas>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        className="flex-1 items-center"
        style={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 20, paddingHorizontal: 26 }}
      >
        {/* No eyebrow label above the logo: the flag planted on the peak in
            LoginArt already says "ponto de partida", and a badge over a
            wordmark is a landing-page pattern, not an app one. */}
        <View style={{ flex: 1, minHeight: 16 }} />

        <LoginArt />

        <AppText
          family="archivo"
          weight="black"
          style={{ marginTop: 26, fontSize: 46, letterSpacing: -2.4, color: colors.text }}
        >
          Avant
        </AppText>
        <AppText
          family="manrope"
          weight="medium"
          style={{
            marginTop: 10,
            maxWidth: 282,
            fontSize: 15,
            lineHeight: 23,
            textAlign: "center",
            color: colors.textMuted,
          }}
        >
          Um plano que sobrevive aos dias difíceis. Comece pequeno, mas comece hoje.
        </AppText>

        <View style={{ flex: 1.1, minHeight: 26 }} />

        <View className="w-full" style={{ gap: 11 }}>
          <SocialButton
            tone="contrast"
            label="Continuar com Apple"
            // The logo has to invert with the button, so it can't rely on the
            // icon's own (always-light) default color.
            icon={<AppleIcon size={18} color={colors.onContrast} />}
            onPress={signIn}
          />
          <SocialButton label="Continuar com Google" icon={<GoogleIcon size={18} />} onPress={signIn} />

          <View className="flex-row items-center" style={{ gap: 12, marginVertical: 3 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.textWhisper }}>
              ou
            </AppText>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
          </View>

          <SocialButton label="Continuar com e-mail" icon={<MailIcon size={18} />} onPress={signIn} />
        </View>

        <Pressable onPress={signIn} style={{ marginTop: 18 }}>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.textMuted }}>
            Já tem conta?{" "}
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.emberInk }}>
              Entrar
            </AppText>
          </AppText>
        </Pressable>

        <AppText
          family="manrope"
          weight="medium"
          style={{
            marginTop: 16,
            maxWidth: 300,
            fontSize: 11.5,
            lineHeight: 17,
            textAlign: "center",
            color: colors.textWhisper,
          }}
        >
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do Avant.
        </AppText>
      </View>
    </OnboardingCanvas>
  );
}
