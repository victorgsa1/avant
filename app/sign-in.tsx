import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { useSession } from "@/features/auth/SessionProvider";
import { validateEmail, validatePassword } from "@/features/auth/validation";
import { userMessage } from "@/services/http/ApiError";

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      // A navegação é feita pelos guards do root layout quando o status muda.
    } catch (error) {
      setFormError(userMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, signIn]);

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para continuar de onde você parou."
      onBack={() => router.back()}
      footer={
        <View style={{ gap: 16 }}>
          {formError ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ textAlign: "center", fontSize: 13, lineHeight: 19, color: colors.danger }}
            >
              {formError}
            </AppText>
          ) : null}

          <PrimaryButton
            label="Entrar"
            onPress={onSubmit}
            loading={submitting}
            withArrow={false}
          />

          <Pressable onPress={() => router.replace("/sign-up")}>
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ textAlign: "center", fontSize: 13, color: colors.textMuted }}
            >
              Ainda não tem conta?{" "}
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.emberInk }}>
                Criar conta
              </AppText>
            </AppText>
          </Pressable>
        </View>
      }
    >
      <TextField
        label="E-mail"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setErrors((e) => ({ ...e, email: null }));
        }}
        error={errors.email}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <TextField
        label="Senha"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setErrors((e) => ({ ...e, password: null }));
        }}
        error={errors.password}
        placeholder="Sua senha"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={onSubmit}
        returnKeyType="go"
      />
    </AuthShell>
  );
}
