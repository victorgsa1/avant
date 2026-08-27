import * as SystemUI from "expo-system-ui";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "@/constants/theme";

type ThemeValue = {
  colors: ThemeColors;
  scheme: "light" | "dark";
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

// Follows the phone's own light/dark setting. `useColorScheme` re-renders on
// change, so flipping the system toggle restyles the app live — there is no
// in-app override on purpose.
//
// This only works because app.json sets `userInterfaceStyle: "automatic"`.
// With the Expo default ("light") the OS pins the app to light mode and
// `useColorScheme()` always returns "light", no matter what this code does.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";

  const value = useMemo<ThemeValue>(
    () => ({
      colors: scheme === "dark" ? darkColors : lightColors,
      scheme,
      isDark: scheme === "dark",
    }),
    [scheme],
  );

  // The native root view sits under React's tree; without this it stays the
  // launch color and flashes light when opening the app in dark mode.
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
