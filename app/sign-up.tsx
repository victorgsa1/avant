import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { useSession } from "@/features/auth/SessionProvider";
import {
  suggestUsername,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
} from "@/features/auth/validation";
import { ApiError, userMessage } from "@/services/http/ApiError";

type FieldErrors = {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  password?: string | null;
};

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { signUp } = useSession();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Enquanto o usuário não editar o campo, o username acompanha o nome.
  const onChangeName = useCallback(
    (value: string) => {
      setName(value);
      setErrors((e) => ({ ...e, name: null }));
      if (!usernameTouched) setUsername(suggestUsername(value));
    },
    [usernameTouched],
  );

  const onSubmit = useCallback(async () => {
    const nextErrors: FieldErrors = {
      name: validateName(name),
      username: validateUsername(username),
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
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      // Conflitos conhecidos viram erro no campo certo, não um alerta genérico.
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_IN_USE") {
        setErrors((e) => ({ ...e, email: "Este e-mail já está em uso." }));
      } else if (error instanceof ApiError && error.code === "USERNAME_ALREADY_IN_USE") {
        setErrors((e) => ({ ...e, username: "Este nome de usuário já está em uso." }));
      } else {
        setFormError(userMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, name, password, signUp, username]);

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
        onChangeText={onChangeName}
        error={errors.name}
        placeholder="Como quer ser chamado"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />

      <TextField
        label="Nome de usuário"
        value={username}
        onChangeText={(value) => {
          setUsernameTouched(true);
          setUsername(value);
          setErrors((e) => ({ ...e, username: null }));
        }}
        error={errors.username}
        hint="É assim que seus amigos vão te encontrar."
        placeholder="seunome"
        autoCapitalize="none"
        autoCorrect={false}
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
