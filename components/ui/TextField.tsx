import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fonts } from "@/constants/theme";

type TextFieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  /** Mensagem de erro (já traduzida para o usuário). */
  error?: string | null;
  hint?: string;
};

/**
 * Campo de formulário do padrão visual do Avant: pílula com borda ember
 * quando ativa, borda `danger` quando inválida.
 */
export function TextField({ label, error, hint, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const invalid = !!error;

  const borderColor = invalid ? colors.danger : focused ? colors.ember : colors.line;

  return (
    <View style={{ gap: 7 }}>
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.textMuted }}>
        {label}
      </AppText>

      <View
        className="rounded-3xl"
        style={{
          height: 54,
          justifyContent: "center",
          paddingHorizontal: 18,
          backgroundColor: colors.surface,
          borderWidth: focused || invalid ? 1.5 : 1,
          borderColor,
          boxShadow:
            focused || invalid
              ? `0 0 0 4px ${invalid ? colors.danger : colors.ember}17`
              : `0 2px 10px ${colors.shadow}`,
        }}
      >
        <TextInput
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.ember}
          style={{
            padding: 0,
            fontFamily: fonts.manrope.medium,
            fontSize: 15,
            color: colors.textStrong,
          }}
        />
      </View>

      {invalid ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ paddingHorizontal: 4, fontSize: 12, lineHeight: 17, color: colors.danger }}
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ paddingHorizontal: 4, fontSize: 11.5, color: colors.textWhisper }}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
