import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { speechModule, useSpeechEvent } from "../speech";
import { AppText } from "@/components/ui/AppText";
import { MicIcon, TinyCheckIcon } from "@/components/ui/icons";
import { fonts } from "@/constants/theme";
import { useTheme } from "@/components/theme/ThemeProvider";

const MAX_LENGTH = 280;
// Reserve room in the first text line so typing never runs under the mic.
const MIC_SIZE = 34;

// Erros que só significam "a pessoa parou/não falou" — não viram mensagem.
const SILENT_VOICE_ERRORS = new Set(["aborted", "no-speech", "speech-timeout"]);

type AnswerFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Left-hand footer hint shown while the field is still empty. */
  hint: string;
  height?: number;
  /** Deterministic validation message (UX only; backend is authoritative). */
  error?: string | null;
  /** Uma linha só, sem rodapé — o "Outro motivo" da lista de barreiras. */
  compact?: boolean;
  maxLength?: number;
};

const COMPACT_HEIGHT = 58;

/** Acrescenta um trecho (ditado ou resposta pronta) ao que já foi escrito. */
export function joinAnswer(base: string, addition: string): string {
  const text = addition.trim();
  if (!text) return base;
  const separator = base && !/\s$/.test(base) ? " " : "";
  return `${base}${separator}${text}`.slice(0, MAX_LENGTH);
}

const joinDictation = joinAnswer;

export function AnswerField({
  value,
  onChangeText,
  placeholder,
  hint,
  height = 186,
  error,
  compact = false,
  maxLength = MAX_LENGTH,
}: AnswerFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Os eventos do reconhecedor são globais: só o campo que iniciou o ditado
  // reage a eles. `baseRef` guarda o texto de antes da fala para as
  // parciais substituírem (e não acumularem) a transcrição.
  const ownsRecognitionRef = useRef(false);
  const baseRef = useRef("");

  // The design's "active" card (ember border + halo) is the state once the
  // person has actually started answering, not merely tapped in.
  const active = focused || listening || value.length > 0;
  const shownError = error ?? voiceError;
  const invalid = !!shownError;

  const borderColor = invalid ? colors.danger : active ? colors.ember : colors.line;
  const haloColor = invalid ? colors.danger : colors.ember;

  useSpeechEvent("result", (event) => {
    if (!ownsRecognitionRef.current) return;
    const next = joinDictation(baseRef.current, event.results[0]?.transcript ?? "");
    if (event.isFinal) baseRef.current = next;
    onChangeText(next);
  });

  useSpeechEvent("end", () => {
    if (!ownsRecognitionRef.current) return;
    ownsRecognitionRef.current = false;
    setListening(false);
  });

  useSpeechEvent("error", (event) => {
    if (!ownsRecognitionRef.current) return;
    ownsRecognitionRef.current = false;
    setListening(false);
    if (SILENT_VOICE_ERRORS.has(event.error)) return;
    setVoiceError(
      event.error === "not-allowed"
        ? "Permita o acesso ao microfone para responder falando."
        : "Não conseguimos usar o ditado agora. Tente digitar.",
    );
  });

  // Sair da tela no meio da fala não pode deixar o microfone aberto.
  useEffect(() => {
    return () => {
      if (ownsRecognitionRef.current) speechModule?.abort();
    };
  }, []);

  const toggleVoice = async () => {
    if (!speechModule) {
      setVoiceError("Atualize o app para usar o ditado.");
      return;
    }
    if (listening) {
      speechModule.stop();
      return;
    }

    setVoiceError(null);
    if (!speechModule.isRecognitionAvailable()) {
      setVoiceError("O ditado não está disponível neste aparelho.");
      return;
    }

    const permission = await speechModule.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceError("Permita o acesso ao microfone para responder falando.");
      return;
    }

    baseRef.current = value;
    ownsRecognitionRef.current = true;
    setListening(true);
    speechModule.start({ lang: "pt-BR", interimResults: true, continuous: false });
  };

  return (
    <View>
    <View
      style={{
        height: compact ? COMPACT_HEIGHT : height,
        borderRadius: compact ? 18 : 26,
        paddingHorizontal: active ? 19 : 20,
        ...(compact
          ? { justifyContent: "center" as const }
          : { paddingTop: active ? 19 : 20, paddingBottom: active ? 14 : 15 }),
        backgroundColor: colors.surface,
        borderWidth: active || invalid ? 1.5 : 1,
        borderColor,
        boxShadow: active || invalid ? `0 0 0 4px ${haloColor}17` : `0 2px 10px ${colors.shadow}`,
      }}
    >
      <Pressable
        onPress={() => void toggleVoice()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={listening ? "Parar ditado" : "Responder falando"}
        className="absolute items-center justify-center rounded-full"
        style={{
          // Compacto: centrado na altura (descontada a borda, que engrossa ativa).
          top: compact ? (COMPACT_HEIGHT - MIC_SIZE) / 2 - (active ? 1.5 : 1) : active ? 11 : 12,
          right: active ? 11 : 12,
          width: MIC_SIZE,
          height: MIC_SIZE,
          backgroundColor: listening ? colors.ember : colors.emberTint,
          zIndex: 1,
        }}
      >
        <MicIcon size={15} color={listening ? colors.onEmber : undefined} />
      </Pressable>

      <TextInput
        multiline={!compact}
        value={value}
        onChangeText={(text) => {
          setVoiceError(null);
          onChangeText(text);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        maxLength={maxLength}
        selectionColor={colors.ember}
        textAlignVertical={compact ? "center" : "top"}
        returnKeyType={compact ? "done" : undefined}
        style={{
          ...(compact ? {} : { flex: 1, lineHeight: 23 }),
          padding: 0,
          paddingRight: MIC_SIZE + 4,
          fontFamily: fonts.manrope.medium,
          fontSize: 15,
          color: colors.textStrong,
        }}
      />

      {compact ? null : (
      <View className="flex-row items-center justify-between">
        {listening ? (
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.ember }}>
            Ouvindo… toque no microfone para parar
          </AppText>
        ) : value.length > 0 ? (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <TinyCheckIcon />
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.emberWarm }}>
              Salvo automaticamente
            </AppText>
          </View>
        ) : (
          <AppText family="manrope" weight="medium" style={{ fontSize: 11, color: colors.textWhisper }}>
            {hint}
          </AppText>
        )}
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textWhisper }}>
          {value.length} / {maxLength}
        </AppText>
      </View>
      )}
    </View>

      {invalid ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 10, paddingHorizontal: 6, fontSize: 12.5, lineHeight: 18, color: colors.danger }}
        >
          {shownError}
        </AppText>
      ) : null}
    </View>
  );
}
