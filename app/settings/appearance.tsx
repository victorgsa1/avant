import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { OptionPills, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemeMode } from "@/services/storage/preferencesStorage";

const MODES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Do sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export default function AppearanceScreen() {
  const { mode, setMode } = useTheme();

  return (
    <Screen>
      <PageHeader title="Aparência" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        <SettingsSection
          title="TEMA"
          footer="A escolha vale só neste aparelho. Em “Do sistema”, o Avant acompanha o ajuste de claro/escuro do celular."
        >
          <OptionPills options={MODES} value={mode} onChange={setMode} />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}
