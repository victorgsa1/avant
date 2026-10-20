import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "@/constants/theme";
import { uiPreferences, type ThemeMode } from "@/services/storage/preferencesStorage";

type ThemeValue = {
  colors: ThemeColors;
  scheme: "light" | "dark";
  isDark: boolean;
  /** "system" segue o aparelho; as outras duas fixam a aparência. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

// Por padrão segue o ajuste de claro/escuro do aparelho — `useColorScheme`
// re-renderiza na troca, então virar o interruptor do sistema restila o app
// ao vivo. A tela de Aparência pode fixar claro ou escuro; a escolha fica em
// AsyncStorage e volta na próxima abertura.
//
// Isso só funciona porque app.json define `userInterfaceStyle: "automatic"`.
// Com o padrão do Expo ("light") o SO prende o app em claro e
// `useColorScheme()` sempre devolve "light", não importa o que este código
// faça.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    let active = true;
    void uiPreferences.getThemeMode().then((stored) => {
      if (active) setModeState(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    // Aplica na hora e persiste em segundo plano: a troca de aparência não
    // deve esperar disco.
    setModeState(next);
    void uiPreferences.setThemeMode(next);
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme = mode === "system" ? systemScheme : mode;
    return {
      colors: scheme === "dark" ? darkColors : lightColors,
      scheme,
      isDark: scheme === "dark",
      mode,
      setMode,
    };
  }, [mode, setMode, systemScheme]);

  // A escolha de Aparência também vale para o lado nativo: tab bar de Liquid
  // Glass, alertas, teclado. Sem isto eles seguem o aparelho — app no escuro
  // com iPhone no claro deixava a tab bar branca a cada troca de aba até a
  // tela rolar. Com o modo fixo, `useColorScheme` passa a devolver esse valor;
  // "unspecified" devolve o controle ao aparelho. O react-native-web não tem
  // `setColorScheme` (chamar derrubava o app inteiro), e lá não há lado
  // nativo para acertar: as cores já saem do `mode` acima.
  useEffect(() => {
    if (process.env.EXPO_OS === "web") return;
    Appearance.setColorScheme(mode === "system" ? "unspecified" : mode);
  }, [mode]);

  // A view raiz nativa fica embaixo da árvore do React; sem isto ela
  // continua com a cor de splash e pisca claro ao abrir no escuro.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(value.colors.bg);
  }, [value.colors.bg]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return value;
}
