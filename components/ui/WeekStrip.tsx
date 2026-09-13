import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

/** `rest`: dia sem ação principal no plano — descanso, não falha. */
export type WeekDayState = "done" | "today" | "miss" | "next" | "rest";

export type WeekDay = {
  label: string;
  state: WeekDayState;
};

function Dot({ state, size }: { state: WeekDayState; size: number }) {
  const { colors } = useTheme();

  if (state === "done") {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: colors.ember }}
      >
        <CheckmarkIcon size={size * 0.42} color={colors.onEmber} />
      </View>
    );
  }

  if (state === "today") {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, borderWidth: 1.6, borderColor: colors.ember }}
      >
        <View
          className="rounded-full"
          style={{ width: size * 0.26, height: size * 0.26, backgroundColor: colors.ember }}
        />
      </View>
    );
  }

  // Faltou e descanso recebem o mesmo traço neutro de propósito: um dia que
  // não aconteceu é informação, não punição.
  if (state === "miss" || state === "rest") {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: colors.trackIdle }}
      >
        <View style={{ width: size * 0.34, height: 2, borderRadius: 1, backgroundColor: colors.textMuted }} />
      </View>
    );
  }

  return (
    <View className="rounded-full" style={{ width: size, height: size, backgroundColor: colors.trackIdle }} />
  );
}

type WeekStripProps = {
  days: WeekDay[];
  /** 34 na Hoje; menor cabe em cards mais apertados. */
  size?: number;
};

/** A semana em sete marcas — a mesma leitura na Hoje e no Progresso. */
export function WeekStrip({ days, size = 34 }: WeekStripProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-between">
      {days.map((day, index) => (
        <View key={index} className="items-center" style={{ gap: 9 }}>
          <AppText
            family="manrope"
            weight={day.state === "today" ? "extraBold" : "semiBold"}
            style={{ fontSize: 12, color: day.state === "today" ? colors.text : colors.textFaint }}
          >
            {day.label}
          </AppText>
          <Dot state={day.state} size={size} />
        </View>
      ))}
    </View>
  );
}
