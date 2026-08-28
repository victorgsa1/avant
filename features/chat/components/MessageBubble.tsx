import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { PendingMessage } from "../hooks/useConversation";

function timeOf(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type MessageBubbleProps = {
  message: PendingMessage;
  isMine: boolean;
  /** Em grupo, mostramos quem falou quando o autor muda. */
  showSender: boolean;
};

/**
 * Bolha de mensagem. O corpo é SEMPRE renderizado como texto puro — nunca
 * HTML/Markdown: a mensagem é conteúdo hostil por definição.
 */
export function MessageBubble({ message, isMine, showSender }: MessageBubbleProps) {
  const { colors } = useTheme();

  if (message.type === "SYSTEM") {
    return (
      <View className="items-center" style={{ paddingVertical: 10 }}>
        <AppText
          family="manrope"
          weight="semiBold"
          style={{ fontSize: 11.5, color: colors.textWhisper, textAlign: "center" }}
        >
          {message.sender?.name ? `${message.sender.name} ` : ""}
          {message.body}
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ alignItems: isMine ? "flex-end" : "flex-start", paddingVertical: 3 }}>
      {showSender && !isMine && message.sender ? (
        <AppText
          family="manrope"
          weight="bold"
          style={{ marginBottom: 3, marginLeft: 14, fontSize: 11.5, color: colors.textMuted }}
        >
          {message.sender.name}
        </AppText>
      ) : null}

      <View
        style={{
          maxWidth: "82%",
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderBottomRightRadius: isMine ? 6 : 20,
          borderBottomLeftRadius: isMine ? 20 : 6,
          backgroundColor: isMine ? colors.ember : colors.surface,
          borderWidth: isMine ? 0 : 1,
          borderColor: colors.line,
          opacity: message.pending ? 0.65 : 1,
        }}
      >
        <AppText
          family="manrope"
          weight="medium"
          style={{ fontSize: 14.5, lineHeight: 21, color: isMine ? colors.onEmber : colors.textStrong }}
        >
          {message.body}
        </AppText>

        <View className="flex-row items-center" style={{ gap: 6, marginTop: 4, alignSelf: "flex-end" }}>
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ fontSize: 10, color: isMine ? colors.onEmber : colors.textWhisper, opacity: isMine ? 0.75 : 1 }}
          >
            {message.failed ? "não enviada" : timeOf(message.createdAt)}
          </AppText>
        </View>
      </View>
    </View>
  );
}
