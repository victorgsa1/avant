import { MoonIcon, PhoneIcon, SunIcon } from "@/components/ui/icons/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SettingsGroup, SettingsOption, type SettingsIcon } from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import type { ThemeMode } from "@/services/storage/preferencesStorage";

const MODES: { value: ThemeMode; label: string; help: string; icon: SettingsIcon }[] = [
  { value: "system", label: "Do sistema", help: "Acompanha o claro/escuro do celular.", icon: PhoneIcon },
  { value: "light", label: "Claro", help: "Papel claro, sempre.", icon: SunIcon },
  { value: "dark", label: "Escuro", help: "Fundo escuro, sempre.", icon: MoonIcon },
];

export default function AppearanceScreen() {
  const { mode, setMode } = useTheme();

  return (
    <SettingsPage title="Aparência" subtitle="Claro, escuro ou do sistema">
      <SettingsGroup title="Tema" footer="A escolha vale só neste aparelho e muda o app na hora.">
        {MODES.map((option) => (
          <SettingsOption
            key={option.value}
            icon={option.icon}
            title={option.label}
            subtitle={option.help}
            selected={mode === option.value}
            onSelect={() => setMode(option.value)}
          />
        ))}
      </SettingsGroup>
    </SettingsPage>
  );
}
