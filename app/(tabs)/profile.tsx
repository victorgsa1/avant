import Constants from "expo-constants";
import { RefreshControl, ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { AccountFooter } from "@/features/profile/components/AccountFooter";
import { AreasList } from "@/features/profile/components/AreasList";
import { AvantPreferencesCard } from "@/features/profile/components/AvantPreferencesCard";
import { DirectionCard } from "@/features/profile/components/DirectionCard";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { SimpleListSection } from "@/features/profile/components/SimpleListSection";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

const APP_VERSION = `v${Constants.expoConfig?.version ?? "1.0.0"}`;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useSession();
  const { view, loading, refreshing, error, refresh } = useProfileData();

  const name = user?.name ?? "";
  const handle = user?.username ? `@${user.username}` : "";
  const avatarInitial = name.trim().charAt(0).toUpperCase() || "?";

  if (loading && !view) {
    return (
      <Screen>
        <ProfileHeader name={name} handle={handle} avatarInitial={avatarInitial} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        <ProfileHeader name={name} handle={handle} avatarInitial={avatarInitial} />
        <ScreenError message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  if (!view) return null;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.ember} />
        }
      >
        <ProfileHeader name={name} handle={handle} avatarInitial={avatarInitial} />

        <DirectionCard
          statement={
            view.identityStatement ?? "Você ainda não definiu sua direção. Dá para escrever agora."
          }
          helperText="definido na sua entrada no Avant"
        />

        <AreasList areas={view.areas} />

        <AvantPreferencesCard preferences={view.avantPreferences} />

        <SimpleListSection title="Preferências" items={view.appPreferences} />

        <SimpleListSection title="Conta" items={view.accountRows} topPadding={30} />
        <AccountFooter versionLabel={APP_VERSION} onPressSignOut={() => void signOut()} />
      </ScrollView>
    </Screen>
  );
}
