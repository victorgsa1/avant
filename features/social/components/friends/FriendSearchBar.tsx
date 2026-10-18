import { TextInput, View } from "react-native";
import { SearchIcon } from "@/components/ui/icons";
import { UserPlusIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { buttonGlow } from "@/constants/glow";
import { fonts } from "@/constants/theme";

type FriendSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onPressAdd: () => void;
};

/** Filtra a lista de amigos; o botão laranja leva a encontrar gente nova. */
export function FriendSearchBar({ value, onChangeText, onPressAdd }: FriendSearchBarProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center px-5" style={{ gap: 12 }}>
      <View
        className="flex-1 flex-row items-center"
        style={{
          gap: 12,
          height: 54,
          paddingHorizontal: 18,
          borderRadius: 18,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <SearchIcon size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar amigo"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          selectionColor={colors.ember}
          accessibilityLabel="Buscar entre seus amigos"
          style={{
            flex: 1,
            padding: 0,
            fontFamily: fonts.manrope.medium,
            fontSize: 16,
            color: colors.textStrong,
            // O iOS recicla o campo nativo: sem zerar, herda o espaçamento e o
            // `lineHeight` de outro campo (ex.: o do código). Ver TextField.
            letterSpacing: 0,
            textAlign: "left",
          }}
        />
      </View>

      <Pressable
        onPress={onPressAdd}
        accessibilityRole="button"
        accessibilityLabel="Adicionar amigo"
        className="items-center justify-center rounded-full"
        style={{
          width: 54,
          height: 54,
          backgroundColor: colors.ember,
          boxShadow: buttonGlow(`0 10px 22px ${colors.ember}40`),
        }}
      >
        <UserPlusIcon size={25} color={colors.onEmber} />
      </Pressable>
    </View>
  );
}
