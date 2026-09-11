import { useCallback, useState } from "react";
import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { useSession } from "@/features/auth/SessionProvider";
import { validateEmail, validateName, validatePassword } from "@/features/auth/validation";
import { ApiError, userMessage } from "@/services/http/ApiError";

type FieldErrors = {
  name?: string | null;
  email?: string | null;
  password?: string | null;
};

// O @usuário não é pedido aqui: o backend gera um provisório a partir do
// nome e a pessoa escolhe o definitivo na primeira visita ao social.
export default function SignUpScreen() {
  const { colors } = useTheme();
  const { signUp } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      // Conflitos conhecidos viram erro no campo certo, não um alerta genérico.
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_IN_USE") {
        setErrors((e) => ({ ...e, email: "Este e-mail já está em uso." }));
      } else {
        setFormError(userMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, name, password, signUp]);

  return (
    <AuthShell
      title="Criar sua conta"
      subtitle="Leva menos de um minuto. Depois a gente monta seu primeiro movimento."
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

          <PrimaryButton label="Criar conta" onPress={onSubmit} loading={submitting} />

          <Pressable onPress={() => router.replace("/sign-in")}>
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ textAlign: "center", fontSize: 13, color: colors.textMuted }}
            >
              Já tem conta?{" "}
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 13, color: colors.emberInk }}>
                Entrar
              </AppText>
            </AppText>
          </Pressable>
        </View>
      }
    >
      <TextField
        label="Seu nome"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setErrors((e) => ({ ...e, name: null }));
        }}
        error={errors.name}
        placeholder="Como quer ser chamado"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />

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
        hint="Pelo menos 8 caracteres."
        placeholder="Crie uma senha"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
    </AuthShell>
  );
}
