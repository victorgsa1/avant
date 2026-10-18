import { useRef, useState } from "react";
import { Platform, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
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
 *
 * Com `secureTextEntry`, ganha o olho para mostrar/ocultar a senha.
 */
export function TextField({ label, error, hint, secureTextEntry, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const invalid = !!error;

  const secure = !!secureTextEntry;
  const hidden = secure && !revealed;

  // O iOS apaga um campo seguro inteiro na primeira tecla depois de ele
  // voltar a ter foco — quem erra o último dígito e toca de novo no campo
  // para corrigir perde a senha toda. Guardamos o valor e a tecla para
  // desfazer essa limpeza e aplicar só o que a pessoa digitou.
  const guardIosClear = Platform.OS === "ios" && hidden;
  const justFocusedRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);

  const handleChangeText = (text: string) => {
    const previous = inputProps.value ?? "";
    let next = text;

    if (guardIosClear && justFocusedRef.current && previous.length > 1 && text.length <= 1) {
      const key = lastKeyRef.current;
      if (key === "Backspace") next = previous.slice(0, -1);
      else if (key && key.length === 1) next = previous + key;
    }

    justFocusedRef.current = false;
    lastKeyRef.current = null;
    inputProps.onChangeText?.(next);
  };

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
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 18,
          paddingRight: secure ? 8 : 18,
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
          secureTextEntry={hidden}
          onChangeText={handleChangeText}
          onKeyPress={(e) => {
            lastKeyRef.current = e.nativeEvent.key;
            inputProps.onKeyPress?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            justFocusedRef.current = true;
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.ember}
          style={{
            flex: 1,
            padding: 0,
            fontFamily: fonts.manrope.medium,
            fontSize: 15,
            color: colors.textStrong,
            // O iOS recicla a view nativa do TextInput: sem um estilo de
            // parágrafo próprio, este campo herda o `lineHeight` de um campo
            // multilinha anterior e o placeholder sai cortado embaixo. O
            // `textAlign` explícito obriga o RN a mandar um parágrafo novo.
            textAlign: "left",
          }}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            haptic="selection"
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Ocultar senha" : "Mostrar senha"}
            style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}
          >
            {revealed ? <EyeOffIcon color={colors.textMuted} /> : <EyeIcon color={colors.textMuted} />}
          </Pressable>
        ) : null}
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
