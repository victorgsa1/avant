import { useState } from "react";
import { Image, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fonts } from "@/constants/theme";
import { SOCIAL_ART } from "@/features/social/art";
import { ActionError } from "@/features/social/components/TabState";
import { formatJoinCode } from "@/features/social/share";
import { competitionsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/** O servidor normaliza também; aqui é só para o campo mostrar limpo. */
function cleanCode(value: string): string {
  return value.replace(/[^0-9a-z]/gi, "").toUpperCase().slice(0, 12);
}

/**
 * "Entrar com código". Também é o destino do link que um participante
 * compartilha (`/join-competition?code=AB12CD`) — chega preenchido, mas
 * só entra no toque.
 */
export default function JoinCompetitionScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(cleanCode(String(params.code ?? "")));
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    if (code.length < 4 || joining) return;
    setJoining(true);
    setError(null);
    try {
      const competition = await competitionsApi.joinByCode(code);
      router.replace(`/competition/${competition.id}`);
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setJoining(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Entrar com código" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 28, paddingBottom: 60 }}
      >
        <View className="items-center">
          <Image source={SOCIAL_ART.jornada} resizeMode="contain" style={{ width: 168, height: 118 }} />
          <AppText
            family="archivo"
            weight="black"
            style={{ marginTop: 14, fontSize: 24, letterSpacing: -0.8, textAlign: "center", color: colors.text }}
          >
            Qual é o código?
          </AppText>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 6, fontSize: 14, lineHeight: 20, textAlign: "center", color: colors.textMuted }}
          >
            Quem já está na competição encontra o código no placar dela.
          </AppText>
        </View>

        <TextInput
          value={formatJoinCode(code)}
          onChangeText={(value) => {
            setCode(cleanCode(value));
            setError(null);
          }}
          placeholder="ABC 123"
          placeholderTextColor={colors.textFaint}
          autoFocus={!params.code}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => void join()}
          selectionColor={colors.ember}
          accessibilityLabel="Código da competição"
          style={{
            marginTop: 26,
            height: 68,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1.3,
            borderColor: error ? colors.danger : colors.line,
            fontFamily: fonts.archivo.extraBold,
            fontSize: 26,
            letterSpacing: 4,
            textAlign: "center",
            color: colors.text,
          }}
        />

        <ActionError message={error} />

        <View style={{ marginTop: 22 }}>
          <PrimaryButton
            label="Entrar na competição"
            onPress={() => void join()}
            loading={joining}
            disabled={code.length < 4}
            withArrow={false}
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
