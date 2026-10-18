import { router, usePathname } from "expo-router";
import { Tabs, TabList, TabSlot, TabTrigger } from "expo-router/ui";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvantButton } from "@/components/navigation/AvantButton";
import { AvantMenu, type AvantMenuAction } from "@/components/navigation/AvantMenu";
import { SimpleTabBar } from "@/components/navigation/SimpleTabBar";
import { CUSTOM_TAB_BAR_HEIGHT, NATIVE_TAB_BAR_TOP, USES_NATIVE_TABS } from "@/components/navigation/tabBar";
import { useTheme } from "@/components/theme/ThemeProvider";
import { DevResetOnboardingButton } from "@/features/onboarding/components/DevResetOnboardingButton";
import { tapHaptic } from "@/services/native/haptics";

const ROUTES = ["/", "/social", "/progress", "/profile"];

// iOS 26+ gets the system tab bar itself (UITabBarController via
// react-native-screens), not a JS imitation of it: real Liquid Glass, the
// lens that follows the finger when you drag across tabs, and the separate
// glass circle on the right — the same bar Music and Photos use. Everywhere
// else (Android, web, older iOS) keeps the custom floating bar.
export default function TabsLayout() {
  return USES_NATIVE_TABS ? <NativeTabsLayout /> : <CustomTabsLayout />;
}

/** Estado do menu do botão Avant e o que cada item faz. */
function useAvantMenu() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  const select = useCallback((action: AvantMenuAction) => {
    setOpen(false);
    if (action === "complementary") {
      router.push("/new-action");
      return;
    }
    // "Algo mudou", "Novo objetivo" e "Registrar algo" ainda não têm tela.
    Alert.alert("Em breve", "Essa opção chega numa das próximas atualizações.");
  }, []);
  return { open, close, toggle, select };
}

function NativeTabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const menu = useAvantMenu();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* `disableAutomaticContentInsets`: the headers already pad for the
          status bar themselves (see Screen), and the scroll views already
          leave room at the bottom — letting UIKit inset them too would
          double both. Só ícones na barra: o nome de cada aba fica no
          `accessibilityLabel`, para o VoiceOver. */}
      <NativeTabs tintColor={colors.ember}>
        <NativeTabs.Trigger name="index" accessibilityLabel="Hoje" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf="sun.max.fill" />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="social" accessibilityLabel="Social" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf="person.2.fill" />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="progress" accessibilityLabel="Progresso" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf="chart.pie.fill" />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile" accessibilityLabel="Perfil" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>

        {/* Botão Avant. É uma aba só para o iOS desenhá-lo como o círculo de
            vidro separado à direita (o lugar que a Apple reserva ao papel
            `search`). `disabled` impede o toque de selecioná-la — só dispara o
            `tabPress`, que abre o menu. A logo vai em `original` para manter
            o laranja da marca em vez de herdar a cor dos ícones. */}
        <NativeTabs.Trigger
          name="add"
          role="search"
          disabled
          accessibilityLabel="Avant"
          listeners={{
            tabPress: () => {
              tapHaptic("light");
              menu.toggle();
            },
          }}
        >
          <NativeTabs.Trigger.Icon src={require("@/assets/avant-mark-tab.png")} renderingMode="original" />
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* DEV: some sozinho fora de __DEV__. A barra nativa termina 49pt
          acima da área segura; o botão fica 12pt acima dela. */}
      <DevResetOnboardingButton bottom={insets.bottom + NATIVE_TAB_BAR_TOP + 12} />

      <AvantMenu
        visible={menu.open}
        onClose={menu.close}
        onSelect={menu.select}
        bottom={insets.bottom + NATIVE_TAB_BAR_TOP + 10}
        right={20}
      />
    </View>
  );
}

function CustomTabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const activeIndex = Math.max(0, ROUTES.indexOf(pathname));
  const menu = useAvantMenu();
  const barTop = insets.bottom + 12 + CUSTOM_TAB_BAR_HEIGHT;

  return (
    <Tabs style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabSlot />

      <View
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: insets.bottom + 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <SimpleTabBar activeIndex={activeIndex} />
        </View>

        <AvantButton onPress={menu.toggle} />
      </View>

      {/* DEV: some sozinho fora de __DEV__. Fica 12px acima da barra. */}
      <DevResetOnboardingButton bottom={barTop + 12} />

      <AvantMenu visible={menu.open} onClose={menu.close} onSelect={menu.select} bottom={barTop + 10} right={18} />

      <TabList style={{ display: "none" }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="social" href="/social" />
        <TabTrigger name="progress" href="/progress" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>
    </Tabs>
  );
}
