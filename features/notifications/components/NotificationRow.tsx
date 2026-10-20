import { useState, type ComponentType } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import {
  BarsIcon,
  ChevronIcon,
  ComebackIcon,
  FlameIcon,
  HeartIcon,
  PeopleIcon,
  ShineIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { BellOutlineIcon, ClockOutlineIcon } from "@/components/ui/icons/settings";
import { RankBarsIcon, UserPlusIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { NotificationResponse, NotificationType } from "@/services/http/types";
import { receivedAtLabel } from "../format";

type Icon = ComponentType<{ size?: number; color?: string }>;

/** Rótulo curto e ícone de cada tipo — o app não mostra o enum cru. */
const TYPE_META: Record<NotificationType, { label: string; icon: Icon; size?: number }> = {
  REMINDER: { label: "Lembrete", icon: ClockOutlineIcon },
  BEHAVIORAL_REMINDER: { label: "Lembrete", icon: ClockOutlineIcon },
  RESCUE: { label: "Resgate", icon: HeartIcon },
  RECOVERY: { label: "Retomada", icon: ComebackIcon },
  COMEBACK: { label: "Retomada", icon: ComebackIcon },
  WEEKLY_PROGRESS: { label: "Semana", icon: BarsIcon },
  INSIGHT: { label: "Descoberta", icon: SparkleIcon, size: 18 },
  ACHIEVEMENT: { label: "Conquista", icon: ShineIcon },
  STREAK: { label: "Sequência", icon: FlameIcon },
  FRIEND_REQUEST: { label: "Amizade", icon: UserPlusIcon },
  FRIEND_ACCEPTED: { label: "Amizade", icon: PeopleIcon },
  COMPETITION_INVITE: { label: "Competição", icon: RankBarsIcon },
  COMPETITION_UPDATE: { label: "Competição", icon: RankBarsIcon },
  SOCIAL: { label: "Social", icon: PeopleIcon },
  SYSTEM: { label: "Avant", icon: BellOutlineIcon },
  GENERAL: { label: "Avant", icon: BellOutlineIcon },
};

const FALLBACK_META = TYPE_META.GENERAL;

type NotificationRowProps = {
  notification: NotificationResponse;
  /** Mostra o chevron: tocar leva para outra tela, não só marca como lida. */
  navigable: boolean;
  onPress: () => void;
};

/**
 * Uma notificação da caixa de entrada: ícone do tipo, tipo e hora, título e
 * texto. Não lida ganha o fundo pêssego, o ícone cheio e o ponto laranja.
 */
export function NotificationRow({ notification, navigable, onPress }: NotificationRowProps) {
  const { colors } = useTheme();
  // O NativeWind descarta `style` em forma de função no Pressable, então o
  // "pressionado" vem de estado (mesmo jeito do SettingsItem).
  const [pressed, setPressed] = useState(false);

  const unread = notification.readAt == null;
  const meta = TYPE_META[notification.type] ?? FALLBACK_META;
  const TypeIcon = meta.icon;
  const receivedAt = receivedAtLabel(notification.createdAt);
  const background = pressed ? colors.surfaceRaised : unread ? colors.emberWash : "transparent";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? "Não lida. " : ""}${meta.label}, ${receivedAt}. ${notification.title}. ${notification.body}`}
      style={{
        flexDirection: "row",
        gap: 14,
        paddingVertical: 16,
        paddingLeft: 16,
        paddingRight: 14,
        backgroundColor: background,
      }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: unread ? colors.ember : colors.surfaceSunken,
        }}
      >
        <TypeIcon size={meta.size ?? 20} color={unread ? colors.onEmber : colors.textMuted} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <AppText
            family="manrope"
            weight="bold"
            numberOfLines={1}
            style={{ flexShrink: 1, fontSize: 12, letterSpacing: 0.1, color: unread ? colors.emberInk : colors.textFaint }}
          >
            {meta.label}
          </AppText>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textWhisper }} />
          <AppText family="manrope" weight="medium" numberOfLines={1} style={{ fontSize: 12, color: colors.textFaint }}>
            {receivedAt}
          </AppText>
        </View>

        <AppText
          family="archivo"
          weight={unread ? "extraBold" : "bold"}
          style={{
            marginTop: 4,
            fontSize: 15.5,
            lineHeight: 20,
            letterSpacing: -0.3,
            color: unread ? colors.text : colors.textStrong,
          }}
        >
          {notification.title}
        </AppText>

        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 3, fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}
        >
          {notification.body}
        </AppText>
      </View>

      {/*
        Coluna fixa para o ponto e o chevron: com ou sem destino, o ponto
        cai no mesmo lugar em todas as linhas.
      */}
      <View style={{ width: 10, alignItems: "center", justifyContent: "center" }}>
        {unread ? (
          <View
            className="absolute rounded-full"
            style={{ top: 4, width: 8, height: 8, backgroundColor: colors.ember }}
          />
        ) : null}
        {navigable ? <ChevronIcon size={12} color={colors.textFaint} /> : null}
      </View>
    </Pressable>
  );
}
