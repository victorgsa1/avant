import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { dayLabel } from "../format";

/**
 * A pílula com o dia ("Hoje", "Ontem", "12 de outubro"). `floating` é a
 * versão que paira no topo da conversa durante a rolagem — ganha sombra
 * para se destacar das bolhas que passam por baixo.
 */
export function DayPill({ iso, floating = false }: { iso: string; floating?: boolean }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        boxShadow: floating ? `0 2px 10px ${colors.shadowStrong}` : undefined,
      }}
    >
      <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.textMuted }}>
        {dayLabel(iso)}
      </AppText>
    </View>
  );
}

/** Marca o dia em que as mensagens logo abaixo foram enviadas. */
export function DaySeparator({ iso }: { iso: string }) {
  return (
    <View className="items-center" style={{ paddingTop: 14, paddingBottom: 8 }}>
      <DayPill iso={iso} />
    </View>
  );
}
