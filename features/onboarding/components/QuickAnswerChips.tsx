import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { joinAnswer } from "./AnswerField";

type QuickAnswerChipsProps = {
  suggestions: readonly string[];
  value: string;
  onChangeText: (value: string) => void;
};

/**
 * Atalho para responder: um toque preenche o campo vazio ou acrescenta a
 * frase ao que já foi escrito. A resposta continua editável.
 */
export function QuickAnswerChips({ suggestions, value, onChangeText }: QuickAnswerChipsProps) {
  const { colors } = useTheme();

  const add = (suggestion: string) => {
    const base = value.trimEnd();
    // Duas frases prontas seguidas viram duas frases, não uma emendada.
    const closed = base && !/[.!?]$/.test(base) ? `${base}.` : base;
    onChangeText(joinAnswer(closed, suggestion));
  };

  return (
    <View style={{ marginTop: 14 }}>
      <AppText
        family="manrope"
        weight="bold"
        style={{ marginBottom: 8, paddingHorizontal: 2, fontSize: 11.5, color: colors.textFaint }}
      >
        Sem ideia? Toque em uma e ajuste do seu jeito
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Vaza até a borda da tela para o último chip não parecer cortado.
        style={{ marginHorizontal: -24 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}
      >
        {suggestions.map((suggestion) => {
          const used = value.includes(suggestion);
          return (
            <Pressable
              key={suggestion}
              haptic="selection"
              disabled={used}
              onPress={() => add(suggestion)}
              accessibilityRole="button"
              accessibilityLabel={`Usar a resposta: ${suggestion}`}
            >
              <View
                className="rounded-[16px]"
                style={{
                  maxWidth: 240,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: used ? colors.ember : colors.line,
                  backgroundColor: used ? colors.emberTint : colors.surface,
                  opacity: used ? 0.7 : 1,
                }}
              >
                <AppText
                  family="manrope"
                  weight="semiBold"
                  numberOfLines={2}
                  style={{ fontSize: 13, lineHeight: 18, color: used ? colors.emberDeep : colors.textStrong }}
                >
                  {suggestion}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
