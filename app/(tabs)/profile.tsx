import Constants from "expo-constants";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/layout/Screen";
import { useSession } from "@/features/auth/SessionProvider";
import { AccountFooter } from "@/features/profile/components/AccountFooter";
import { UnderConstruction } from "@/features/profile/components/UnderConstruction";
import { confirmAction } from "@/services/native/confirm";

const APP_VERSION = `v${Constants.expoConfig?.version ?? "0.0.1"}`;

/** Espaço da barra de abas flutuante (62 de altura + 12 da borda + folga). */
const TAB_BAR_CLEARANCE = 96;

/**
 * O perfil ainda está em obra: só a animação e o Sair — sem ele não haveria
 * como deslogar. Sem rolagem: cabe na tela e não tem o que puxar.
 */
export default function ProfileScreen() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <View
        className="flex-1"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}
      >
        <View className="flex-1 justify-center">
          <UnderConstruction />
        </View>
        <AccountFooter
          versionLabel={APP_VERSION}
          onPressSignOut={() =>
            confirmAction({
              title: "Sair da conta?",
              message: "Você vai precisar entrar de novo com seu e-mail e senha.",
              confirmLabel: "Sair",
              destructive: true,
              onConfirm: () => void signOut(),
            })
          }
        />
      </View>
    </Screen>
  );
}
