import { ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AccountFooter } from "@/features/profile/components/AccountFooter";
import { AreasList } from "@/features/profile/components/AreasList";
import { AvantPreferencesCard } from "@/features/profile/components/AvantPreferencesCard";
import { DirectionCard } from "@/features/profile/components/DirectionCard";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { SimpleListSection } from "@/features/profile/components/SimpleListSection";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

export default function ProfileScreen() {
  const { areas, avantPreferences, appPreferences, accountRows } = useProfileData();

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <ProfileHeader name="Gabriel" handle="@gabriel" avatarInitial="G" />

        <DirectionCard
          statement="Quero me tornar alguém disciplinado, saudável e que termina o que começa."
          helperText="definido na sua entrada no Avant"
        />

        <AreasList areas={areas} />

        <AvantPreferencesCard preferences={avantPreferences} />

        <SimpleListSection title="Preferências" items={appPreferences} />

        <SimpleListSection title="Conta" items={accountRows} topPadding={30} />
        <AccountFooter versionLabel="v2.4.0" />
      </ScrollView>
    </Screen>
  );
}
