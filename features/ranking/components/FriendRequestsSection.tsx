import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { FriendRequestResponse } from "@/services/http/types";

type FriendRequestsSectionProps = {
  incoming: FriendRequestResponse[];
  outgoing: FriendRequestResponse[];
  busy: boolean;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
};

export function FriendRequestsSection({
  incoming,
  outgoing,
  busy,
  onAccept,
  onDecline,
}: FriendRequestsSectionProps) {
  const { colors } = useTheme();

  if (incoming.length === 0 && outgoing.length === 0) return null;

  return (
    <View className="px-6" style={{ paddingTop: 24 }}>
      {incoming.length > 0 ? (
        <>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
            Solicitações
          </AppText>

          {incoming.map((request) => (
            <View
              key={request.id}
              className="flex-row items-center"
              style={{
                gap: 12,
                paddingVertical: 13,
                borderBottomWidth: 1,
                borderBottomColor: colors.surfaceSunken,
              }}
            >
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 38, height: 38, backgroundColor: colors.emberTint }}
              >
                <AppText family="archivo" weight="extraBold" style={{ fontSize: 14, color: colors.emberInk }}>
                  {request.user.name.charAt(0).toUpperCase()}
                </AppText>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, letterSpacing: -0.2, color: colors.text }}>
                  {request.user.name}
                </AppText>
                <AppText family="manrope" weight="medium" style={{ marginTop: 2, fontSize: 11.5, color: colors.textMuted }}>
                  @{request.user.username}
                </AppText>
              </View>

              <Pressable
                onPress={() => onDecline(request.id)}
                disabled={busy}
                className="rounded-full"
                style={{ paddingVertical: 8, paddingHorizontal: 13, backgroundColor: colors.surfaceSunken }}
              >
                <AppText family="archivo" weight="extraBold" style={{ fontSize: 12, color: colors.textMuted }}>
                  Recusar
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => onAccept(request.id)}
                disabled={busy}
                className="rounded-full"
                style={{ paddingVertical: 8, paddingHorizontal: 15, backgroundColor: colors.ember }}
              >
                <AppText family="archivo" weight="extraBold" style={{ fontSize: 12, color: colors.onEmber }}>
                  Aceitar
                </AppText>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      {outgoing.length > 0 ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: incoming.length > 0 ? 14 : 0, fontSize: 12, color: colors.textMuted }}
        >
          {outgoing.length === 1
            ? "1 convite enviado aguardando resposta."
            : `${outgoing.length} convites enviados aguardando resposta.`}
        </AppText>
      ) : null}
    </View>
  );
}
