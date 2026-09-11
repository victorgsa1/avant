import { Haptics } from "@/services/native/haptics";

/**
 * Toques leves no ritmo da subida do confete; o último, mais firme, cai
 * quando a contagem do XP termina (350ms de espera + 900ms contando).
 */
const BURST_TAPS_MS = [180, 360, 560];
const XP_LANDED_MS = 1250;

/**
 * Vibração da recompensa: um "sucesso" quando o confete sai e, com o
 * confete ligado, toques acompanhando a subida. Retorna a limpeza dos
 * timers para quem sair da tela antes do fim.
 */
export function playCelebrationHaptics(withBurst: boolean): () => void {
  if (!Haptics) return () => undefined;
  const haptics = Haptics;

  void haptics.notificationAsync(haptics.NotificationFeedbackType.Success).catch(() => undefined);
  if (!withBurst) return () => undefined;

  const timers = [
    ...BURST_TAPS_MS.map((delay) =>
      setTimeout(() => {
        void haptics.impactAsync(haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }, delay),
    ),
    setTimeout(() => {
      void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }, XP_LANDED_MS),
  ];

  return () => timers.forEach(clearTimeout);
}
