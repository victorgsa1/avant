import Constants from "expo-constants";
import { ScrollView } from "react-native";
import { router, type Href } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { BrandTopBar } from "@/components/navigation/BrandTopBar";
import { useTabBarClearance } from "@/components/navigation/tabBar";
import { AppText } from "@/components/ui/AppText";
import {
  BellOutlineIcon,
  ChecklistIcon,
  ClockOutlineIcon,
  CompassIcon,
  DatabaseIcon,
  GridIcon,
  LockOutlineIcon,
  MoonIcon,
  ShieldIcon,
} from "@/components/ui/icons/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { LearnedCard } from "@/features/profile/components/LearnedCard";
import { ProfileCard } from "@/features/profile/components/ProfileCard";
import { SignOutButton } from "@/features/profile/components/SignOutButton";
import { SettingsGroup, SettingsItem } from "@/features/settings/components/SettingsGroup";
import { confirmAction } from "@/services/native/confirm";
import type { ThemeMode } from "@/services/storage/preferencesStorage";

const APP_VERSION = Constants.expoConfig?.version ?? "0.0.1";

const THEME_LABELS: Record<ThemeMode, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Escuro",
};

const open = (route: Href) => () => router.push(route);

/**
 * Perfil: quem você é no Avant e a porta para cada ajuste. Não busca nada
 * na entrada — cada tela de ajuste carrega o que precisa quando abre.
 */
export default function ProfileScreen() {
  const { colors, mode } = useTheme();
  const { user, signOut } = useSession();
  const bottomClearance = useTabBarClearance();

  const name = user?.name ?? "";
  const handle = user?.username ? `@${user.username}` : "";

  const confirmSignOut = () =>
    confirmAction({
      title: "Sair da conta?",
      message: "Você vai precisar entrar de novo com seu e-mail e senha.",
      confirmLabel: "Sair",
      destructive: true,
      onConfirm: () => void signOut(),
    });

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomClearance }}
      >
        <BrandTopBar
          name={name}
          showAvatar={false}
          hasNotification={false}
          onPressBell={open("/notifications")}
        />

        <AppText
          family="archivo"
          weight="black"
          accessibilityRole="header"
          style={{ marginTop: 22, paddingHorizontal: 20, fontSize: 34, lineHeight: 38, letterSpacing: -1.4, color: colors.text }}
        >
          Perfil
        </AppText>

        <ProfileCard name={name} handle={handle} avatarUrl={user?.avatarUrl} onPress={open("/settings/personal")} />

        <LearnedCard onPress={open("/settings/learned")} />

        <SettingsGroup title="Sua rotina">
          <SettingsItem
            icon={CompassIcon}
            title="Sua direção"
            subtitle="Quem você quer se tornar"
            onPress={open("/settings/identity")}
          />
          <SettingsItem
            icon={ChecklistIcon}
            title="Seus hábitos"
            subtitle="Pausar, retomar e arquivar"
            onPress={open("/settings/habits")}
          />
          <SettingsItem
            icon={GridIcon}
            title="Áreas da vida"
            subtitle="Organize o que quer cuidar"
            onPress={open("/settings/areas")}
          />
          <SettingsItem
            icon={ClockOutlineIcon}
            title="Rotina e horários"
            subtitle="Períodos, ritmo e retomada"
            onPress={open("/settings/routine")}
          />
        </SettingsGroup>

        <SettingsGroup title="Preferências">
          <SettingsItem
            icon={BellOutlineIcon}
            title="Notificações"
            subtitle="Preferências e seus lembretes"
            onPress={open("/settings/notifications")}
          />
          <SettingsItem
            icon={MoonIcon}
            title="Aparência"
            subtitle="Claro, escuro ou do sistema"
            value={THEME_LABELS[mode]}
            onPress={open("/settings/appearance")}
          />
          <SettingsItem
            icon={ShieldIcon}
            title="Privacidade social"
            subtitle="Busca por @ e pessoas bloqueadas"
            onPress={open("/settings/privacy")}
          />
        </SettingsGroup>

        <SettingsGroup title="Sua conta">
          <SettingsItem
            icon={LockOutlineIcon}
            title="E-mail e segurança"
            subtitle="Senha e aparelhos conectados"
            onPress={open("/settings/security")}
          />
          <SettingsItem
            icon={DatabaseIcon}
            title="Dados e privacidade"
            subtitle="Seus dados e exclusão da conta"
            onPress={open("/settings/data")}
          />
        </SettingsGroup>

        <SignOutButton onPress={confirmSignOut} />

        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: colors.textFaint }}
        >
          Avant · versão {APP_VERSION}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
