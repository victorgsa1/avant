import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { router, useLocalSearchParams } from "expo-router";
import type * as ImagePickerLib from "expo-image-picker";
import type * as LocationLib from "expo-location";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { todayApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import { NATIVE_UPDATE_MESSAGE, hasNativeModule } from "@/services/native/optionalNative";

// Câmera e GPS só carregam quando o binário tem os módulos nativos: num
// dev build antigo a tela avisa para atualizar em vez de derrubar o app.
function loadImagePicker(): typeof ImagePickerLib | null {
  if (!hasNativeModule("ExponentImagePicker")) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-image-picker") as typeof ImagePickerLib;
}

function loadLocation(): typeof LocationLib | null {
  if (!hasNativeModule("ExpoLocation")) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-location") as typeof LocationLib;
}

type Spot = { latitude: number; longitude: number; accuracy: number | null };
type Phase = "permissions" | "blocked" | "ready" | "locating" | "sending";

/** Quanto esperar por um GPS novo depois da foto antes de usar o aquecido. */
const FRESH_FIX_TIMEOUT_MS = 8_000;
/** Foto leve sobe rápido em rede móvel e ainda mostra a ação com clareza. */
const PHOTO_QUALITY = 0.4;

const STATUS: Partial<Record<Phase, string>> = {
  permissions: "Pedindo acesso à câmera e à localização…",
  locating: "Registrando sua localização…",
  sending: "Enviando sua comprovação…",
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

function spotOf(position: LocationLib.LocationObject): Spot | null {
  // Posição de app de GPS falso nunca vira prova.
  if (position.mocked) return null;
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
  };
}

/**
 * Concluir a ação principal em um gesto: as permissões são pedidas ao
 * entrar, a câmera abre sozinha e a localização é registrada junto com a
 * foto — a pessoa só fotografa. O servidor revalida tudo (tipo real da
 * imagem, GPS simulado, idade da prova).
 */
export default function CompleteActionScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    minutes?: string;
    /** A versão escolhida na Hoje — em geral "MINIMUM" quando o dia apertou. */
    variantType?: string;
  }>();
  const [phase, setPhase] = useState<Phase>("permissions");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // GPS aquecido desde a entrada: se o fix novo demorar, este é a reserva.
  const warmSpot = useRef<Spot | null>(null);
  const autoOpened = useRef(false);

  const minutes = params.minutes ? Number(params.minutes) : null;
  const subtitle =
    [params.title, minutes ? `${minutes} min` : null].filter(Boolean).join(" · ") ||
    "Sua ação principal de hoje";

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setError(null);
    setPhase("permissions");

    const ImagePicker = loadImagePicker();
    const Location = loadLocation();
    if (!ImagePicker || !Location) {
      setError(NATIVE_UPDATE_MESSAGE);
      setPhase("blocked");
      return false;
    }

    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const location = await Location.requestForegroundPermissionsAsync();
    if (!camera.granted || !location.granted) {
      setError(
        !camera.granted && !location.granted
          ? "O Avant precisa da câmera e da localização para validar a ação principal."
          : !camera.granted
            ? "Permita o acesso à câmera para comprovar a ação."
            : "Permita a localização para comprovar onde a ação aconteceu.",
      );
      setPhase("blocked");
      return false;
    }

    setPhase("ready");
    // Aquece o GPS enquanto a pessoa enquadra a foto.
    void Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((position) => {
        warmSpot.current = spotOf(position) ?? warmSpot.current;
      })
      .catch(() => undefined);
    return true;
  }, []);

  const captureAndSubmit = useCallback(async () => {
    const ImagePicker = loadImagePicker();
    const Location = loadLocation();
    if (!ImagePicker || !Location) {
      setError(NATIVE_UPDATE_MESSAGE);
      setPhase("blocked");
      return;
    }

    setError(null);
    const shot = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: PHOTO_QUALITY,
      allowsEditing: false,
      exif: false,
    });
    const asset = shot.canceled ? null : shot.assets[0];
    if (!asset) return;

    const takenAt = new Date().toISOString();
    setPreview(asset.uri);

    // A localização vai junto da foto: um fix novo, com o aquecido de reserva.
    setPhase("locating");
    const fresh = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null),
      FRESH_FIX_TIMEOUT_MS,
    );
    if (fresh?.mocked) {
      setError("Localização simulada não vale como comprovação. Desative o app de GPS falso.");
      setPhase("ready");
      return;
    }
    const spot = (fresh ? spotOf(fresh) : null) ?? warmSpot.current;
    if (!spot) {
      setError("Não conseguimos sua localização. Ative o GPS e tire a foto de novo.");
      setPhase("ready");
      return;
    }

    setPhase("sending");
    try {
      const form = new FormData();
      // No React Native, {uri, name, type} é como um arquivo entra no FormData.
      form.append("photo", {
        uri: asset.uri,
        name: asset.fileName ?? `prova-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      } as unknown as Blob);
      form.append("latitude", String(spot.latitude));
      form.append("longitude", String(spot.longitude));
      if (spot.accuracy !== null) form.append("accuracy", String(spot.accuracy));
      form.append("mocked", "false");
      form.append("capturedAt", takenAt);
      // Sem isto o servidor conclui pela versão planejada, não pela feita.
      if (params.variantType) form.append("variantType", params.variantType);

      const result = await todayApi.completeWithProof(params.id, form);
      const reward = result.reward;

      router.replace({
        pathname: "/action-reward",
        params: {
          title: result.titleSnapshot,
          xp: String(reward?.xp ?? result.xp.awarded),
          level: reward ? String(reward.level.level) : "",
          progress: String(reward?.level.progressPercent ?? 0),
          remaining: String(reward ? reward.level.xpForNextLevel - reward.level.xpIntoLevel : 0),
          streak: String(reward?.streak ?? 0),
          leveledUp: reward?.leveledUp ? "1" : "0",
        },
      });
    } catch (caught) {
      setError(userMessage(caught));
      setPhase("ready");
    }
  }, [params.id]);

  // Entrou na tela: pede as duas permissões e já abre a câmera.
  useEffect(() => {
    void requestPermissions().then((granted) => {
      if (granted && !autoOpened.current) {
        autoOpened.current = true;
        void captureAndSubmit();
      }
    });
  }, [captureAndSubmit, requestPermissions]);

  const busy = phase === "permissions" || phase === "locating" || phase === "sending";
  const status = STATUS[phase];

  return (
    <AuthShell
      title="Comprovar ação"
      subtitle={subtitle}
      onBack={() => router.back()}
      footer={
        <View style={{ gap: 14 }}>
          {error ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ textAlign: "center", fontSize: 13, lineHeight: 19, color: colors.danger }}
            >
              {error}
            </AppText>
          ) : null}

          <PrimaryButton
            label={phase === "blocked" ? "Permitir acesso" : preview ? "Tirar outra foto" : "Tirar foto"}
            onPress={() => void (phase === "blocked" ? requestPermissions() : captureAndSubmit())}
            loading={busy}
          />

          {phase === "blocked" ? (
            <Pressable onPress={() => void Linking.openSettings()} className="items-center">
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
                Abrir ajustes do aparelho
              </AppText>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <View
        className="overflow-hidden rounded-[26px] items-center justify-center"
        style={{
          height: 320,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        {preview ? (
          <Image source={{ uri: preview }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ paddingHorizontal: 32, textAlign: "center", fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}
          >
            Mostre a ação acontecendo: o lugar, o equipamento, o resultado. A localização é registrada junto
            com a foto e não aparece para ninguém.
          </AppText>
        )}
      </View>

      {status ? (
        <View className="flex-row items-center justify-center" style={{ gap: 10 }}>
          <ActivityIndicator color={colors.ember} />
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.textMuted }}>
            {status}
          </AppText>
        </View>
      ) : null}
    </AuthShell>
  );
}
