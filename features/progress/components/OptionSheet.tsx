import { Modal, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

export type SheetOption = { value: string; label: string };

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: SheetOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** Lista de escolha única que sobe da base: o mês, o hábito do calendário. */
export function OptionSheet({ visible, title, options, selected, onSelect, onClose }: OptionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        haptic="none"
        accessibilityLabel="Fechar"
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
      >
        {/* Toque dentro da folha não fecha: só o fundo fecha. */}
        <Pressable
          haptic="none"
          onPress={() => undefined}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 22,
            paddingBottom: insets.bottom + 16,
            maxHeight: "70%",
          }}
        >
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 19, letterSpacing: -0.4, color: colors.text, paddingHorizontal: 24, marginBottom: 8 }}
          >
            {title}
          </AppText>
          <ScrollView>
            {options.map((option) => {
              const active = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  haptic="selection"
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="flex-row items-center justify-between"
                  style={{ paddingVertical: 15, paddingHorizontal: 24 }}
                >
                  <AppText
                    family="manrope"
                    weight={active ? "bold" : "medium"}
                    style={{ fontSize: 15.5, color: active ? colors.emberInk : colors.text }}
                  >
                    {option.label}
                  </AppText>
                  {active ? (
                    <View className="rounded-full" style={{ width: 8, height: 8, backgroundColor: colors.ember }} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
