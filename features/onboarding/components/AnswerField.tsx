import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { MicIcon, TinyCheckIcon } from "@/components/ui/icons";
import { fonts } from "@/constants/theme";
import { useTheme } from "@/components/theme/ThemeProvider";

const MAX_LENGTH = 280;
// Reserve room in the first text line so typing never runs under the mic.
const MIC_SIZE = 34;

type AnswerFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Left-hand footer hint shown while the field is still empty. */
  hint: string;
  height?: number;
  /** Dictation isn't wired up yet — the affordance lives in the card corner. */
  onPressVoice?: () => void;
};

export function AnswerField({
  value,
  onChangeText,
  placeholder,
  hint,
  height = 186,
  onPressVoice,
}: AnswerFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  // The design's "active" card (ember border + halo) is the state once the
  // person has actually started answering, not merely tapped in.
  const active = focused || value.length > 0;

  return (
    <View
      className="rounded-[26px]"
      style={{
        height,
        paddingHorizontal: active ? 19 : 20,
        paddingTop: active ? 19 : 20,
        paddingBottom: active ? 14 : 15,
        backgroundColor: colors.surface,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? colors.ember : colors.line,
        boxShadow: active ? `0 0 0 4px ${colors.ember}17` : `0 2px 10px ${colors.shadow}`,
      }}
    >
      <Pressable
        onPress={onPressVoice}
        hitSlop={8}
        className="absolute items-center justify-center rounded-full"
        style={{
          top: active ? 11 : 12,
          right: active ? 11 : 12,
          width: MIC_SIZE,
          height: MIC_SIZE,
          backgroundColor: colors.emberTint,
          zIndex: 1,
        }}
      >
        <MicIcon size={15} />
      </Pressable>

      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        maxLength={MAX_LENGTH}
        selectionColor={colors.ember}
        textAlignVertical="top"
        style={{
          flex: 1,
          padding: 0,
          paddingRight: MIC_SIZE + 4,
          fontFamily: fonts.manrope.medium,
          fontSize: 15,
          lineHeight: 23,
          color: colors.textStrong,
        }}
      />

      <View className="flex-row items-center justify-between">
        {value.length > 0 ? (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <TinyCheckIcon />
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.emberWarm }}>
              Salvo automaticamente
            </AppText>
          </View>
        ) : (
          <AppText family="manrope" weight="medium" style={{ fontSize: 11, color: colors.textWhisper }}>
            {hint}
          </AppText>
        )}
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textWhisper }}>
          {value.length} / {MAX_LENGTH}
        </AppText>
      </View>
    </View>
  );
}
