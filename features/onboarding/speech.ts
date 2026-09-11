import type * as SpeechRecognition from "expo-speech-recognition";
import { hasNativeModule } from "@/services/native/optionalNative";

type SpeechLib = typeof SpeechRecognition;

// Só carrega a lib quando o binário tem o módulo nativo (ver optionalNative).
const lib: SpeechLib | null = hasNativeModule("ExpoSpeechRecognition")
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("expo-speech-recognition") as SpeechLib)
  : null;

/** Null num binário sem o módulo: o campo mostra "atualize o app" em vez de quebrar. */
export const speechModule = lib?.ExpoSpeechRecognitionModule ?? null;

/** Sem o módulo, os eventos simplesmente nunca chegam. */
export const useSpeechEvent: SpeechLib["useSpeechRecognitionEvent"] =
  lib?.useSpeechRecognitionEvent ?? (() => undefined);
