import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { PublicProfileResponse } from "@/services/http/types";
import { firstName, monthYearLabel } from "../../format";

type PanelAction = { label: string; primary?: boolean; onPress: () => void };

function ActionButton({ action, personName }: { action: PanelAction; personName: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${action.label} ${personName}`}
      className="flex-1 items-center justify-center rounded-full"
      style={{
        height: 50,
        backgroundColor: action.primary ? colors.ember : "transparent",
        borderWidth: action.primary ? 0 : 1.3,
        borderColor: colors.lineStrong,
      }}
    >
      <AppText
        family="archivo"
        weight="extraBold"
        style={{ fontSize: 15, color: action.primary ? colors.onEmber : colors.textMuted }}
      >
        {action.label}
      </AppText>
    </Pressable>
  );
}

type RelationPanelProps = {
  profile: PublicProfileResponse;
  busy: boolean;
  onAccept: (requestId: string) => void;
  onRemoveRequest: (requestId: string) => void;
  onAdd: (username: string) => void;
};

/**
 * O que liga você a essa pessoa e o próximo passo possível: responder o
 * pedido que ela mandou, cancelar o seu, adicionar — ou só "vocês são amigos".
 */
export function RelationPanel({ profile, busy, onAccept, onRemoveRequest, onAdd }: RelationPanelProps) {
  const { colors } = useTheme();
  const name = firstName(profile.name);
  const { requestId } = profile;

  if (profile.relation === "self") return null;

  if (profile.relation === "friends") {
    return (
      <View className="mx-5 flex-row items-center justify-center" style={{ marginTop: 28, gap: 8 }}>
        <CheckmarkIcon size={14} color={colors.emberInk} />
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 14.5, color: colors.textStrong }}>
          {profile.friendsSince
            ? `Amigos desde ${monthYearLabel(profile.friendsSince)}`
            : "Vocês são amigos"}
        </AppText>
      </View>
    );
  }

  let message: string | null = null;
  let actions: PanelAction[] = [];

  if (profile.relation === "request_received") {
    message = `${name} te mandou um pedido de amizade.`;
    if (requestId) {
      actions = [
        { label: "Recusar", onPress: () => onRemoveRequest(requestId) },
        { label: "Aceitar", primary: true, onPress: () => onAccept(requestId) },
      ];
    }
  } else if (profile.relation === "request_sent") {
    message = `Pedido enviado. Falta ${name} aceitar.`;
    if (requestId) actions = [{ label: "Cancelar pedido", onPress: () => onRemoveRequest(requestId) }];
  } else {
    actions = [{ label: "Adicionar amigo", primary: true, onPress: () => onAdd(profile.username) }];
  }

  return (
    <View className="mx-5" style={{ marginTop: 28 }}>
      {message ? (
        <AppText
          family="manrope"
          weight="semiBold"
          style={{ fontSize: 15, lineHeight: 21, textAlign: "center", color: colors.textStrong }}
        >
          {message}
        </AppText>
      ) : null}

      <View className="flex-row items-center justify-center" style={{ marginTop: message ? 16 : 0, gap: 10, minHeight: 50 }}>
        {busy ? (
          <ActivityIndicator color={colors.ember} />
        ) : (
          actions.map((action) => <ActionButton key={action.label} action={action} personName={profile.name} />)
        )}
      </View>
    </View>
  );
}
