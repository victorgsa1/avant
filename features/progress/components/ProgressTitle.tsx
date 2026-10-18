import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type ProgressTitleProps = {
  monthName: string;
  year: string;
  onPressMonth: () => void;
  /** Buscando o mês recém-escolhido. */
  loading?: boolean;
};

export function ProgressTitle({ monthName, year, onPressMonth, loading = false }: ProgressTitleProps) {
  const { colors } = useTheme();

  return (
    <View className="px-6" style={{ marginTop: 24 }}>
      <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 34, lineHeight: 38, letterSpacing: -1.4, color: colors.text }}
        >
          Progresso
        </AppText>

        <Pressable
          onPress={onPressMonth}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel={`Mês: ${monthName} de ${year}. Trocar mês`}
          className="flex-row items-center rounded-full"
          style={{
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: 17,
            borderWidth: 1.3,
            borderColor: colors.lineStrong,
          }}
        >
          <AppText family="archivo" weight="bold" style={{ fontSize: 14, color: colors.text }}>
            {monthName}
          </AppText>
          {loading ? (
            <ActivityIndicator size="small" color={colors.textMuted} style={{ width: 12, height: 12 }} />
          ) : (
            <ChevronIcon direction="down" size={11} color={colors.text} />
          )}
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between" style={{ marginTop: 10 }}>
        <AppText family="manrope" weight="medium" style={{ fontSize: 13.5, color: colors.textMuted }}>
          Sua evolução
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 13.5, color: colors.textMuted }}>
          {year}
        </AppText>
      </View>
    </View>
  );
}
