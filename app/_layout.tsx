import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  Inter_900Black_Italic,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
  type Theme,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";
import { SessionProvider, useSession } from "@/features/auth/SessionProvider";
import "../global.css";

SplashScreen.preventAutoHideAsync();

// Split from RootLayout so it can read the session context the layout provides.
// `Stack.Protected` unmounts the screens whose guard is false and redirects to
// the first reachable one, so a cold start always lands on /login.
function RootNavigator() {
  const { status } = useSession();
  const { colors, isDark } = useTheme();

  // React Navigation paints its own container background (#f2f2f2 by default),
  // which sits above our screens' backgrounds and shows through during
  // transitions. Feeding it the palette keeps that layer in the right theme.
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.line,
      primary: colors.ember,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={status === "signedOut"}>
          <Stack.Screen name="login" />
        </Stack.Protected>

        <Stack.Protected guard={status === "onboarding"}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={status === "ready"}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Inter_900Black_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
