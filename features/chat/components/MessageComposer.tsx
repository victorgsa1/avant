import { useCallback, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fonts } from "@/constants/theme";

// Mesmo limite do backend (`MESSAGE_MAX_LENGTH`). O servidor revalida.
const MAX_LENGTH = 4000;

type MessageComposerProps = {
  onSend: (body: string) => void;
  onTyping: () => void;
  disabled?: boolean;
};

export function MessageComposer({ onSend, onTyping, disabled }: MessageComposerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState("");

  const canSend = value.trim().length > 0 && !disabled;

  const submit = useCallback(() => {
    if (!canSend) return;
    onSend(value);
    setValue("");
  }, [canSend, onSend, value]);

  return (
    <View
      className="flex-row items-end"
      style={{
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        borderTopWidth: 1,
        borderTopColor: colors.line,
        backgroundColor: colors.bg,
      }}
    >
      <View
        className="flex-1 rounded-3xl"
        style={{
          minHeight: 46,
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <TextInput
          value={value}
          onChangeText={(text) => {
            setValue(text);
            if (text.length > 0) onTyping();
          }}
          placeholder="Escreva uma mensagem"
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={MAX_LENGTH}
          selectionColor={colors.ember}
          style={{
            padding: 0,
            maxHeight: 110,
            fontFamily: fonts.manrope.medium,
            fontSize: 14.5,
            lineHeight: 20,
            color: colors.textStrong,
          }}
        />
      </View>

      <Pressable
        onPress={submit}
        disabled={!canSend}
        className="items-center justify-center rounded-full"
        style={{
          width: 46,
          height: 46,
          backgroundColor: canSend ? colors.ember : colors.surfaceSunken,
        }}
      >
        <ArrowRightIcon width={17} color={canSend ? colors.onEmber : colors.textFaint} />
      </Pressable>
    </View>
  );
}
