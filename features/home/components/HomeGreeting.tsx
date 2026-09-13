import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

type HomeGreetingProps = {
  greeting: string;
  name: string;
  /** "Qui, 10 set" — a data por extenso curta, do lado do título. */
  dateLabel: string;
};

export function HomeGreeting({ greeting, name, dateLabel }: HomeGreetingProps) {
  const { colors } = useTheme();

  return (
    <View className="px-6" style={{ paddingTop: 18 }}>
      <AppText family="manrope" weight="medium" style={{ fontSize: 15, color: colors.textMuted }}>
        {name ? `${greeting}, ${name}.` : `${greeting}.`}
      </AppText>

      <View className="flex-row items-center justify-between" style={{ marginTop: 4 }}>
        <AppText
          family="archivo"
          weight="black"
          style={{ fontSize: 44, lineHeight: 50, letterSpacing: -1.8, color: colors.text }}
        >
          Hoje
        </AppText>

        <View
          className="rounded-full"
          style={{ borderWidth: 1.2, borderColor: colors.ember, paddingVertical: 9, paddingHorizontal: 18 }}
        >
          <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.ember }}>
            {dateLabel}
          </AppText>
        </View>
      </View>
    </View>
  );
}
