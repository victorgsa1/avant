import { View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { TrendUpIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Trend } from "../types";

const WIDTH = 336;
const HEIGHT = 188;
const GROUND = 172;
const SUMMIT = 38;
const PAD_LEFT = 6;
// Espaço à direita para a bandeira caber no último ponto.
const PAD_RIGHT = 36;

/**
 * A montanha É o dado: cada ponto é a consistência acumulada do dia, e a
 * bandeira fica onde a pessoa está hoje. Com 0% ela fica no chão — nada de
 * cume desenhado de enfeite.
 */
function MountainChart({ series }: { series: number[] }) {
  const { colors } = useTheme();
  const values = series.length > 1 ? series : [0, series[0] ?? 0];
  const step = (WIDTH - PAD_LEFT - PAD_RIGHT) / (values.length - 1);

  const points = values.map((value, index) => ({
    x: PAD_LEFT + index * step,
    y: GROUND - (Math.max(0, Math.min(100, value)) / 100) * (GROUND - SUMMIT),
  }));
  const ridge = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const area = `${ridge} L ${last.x.toFixed(1)} ${HEIGHT} L ${PAD_LEFT} ${HEIGHT} Z`;

  const top = last.y - 26;
  const flag = [
    `M ${last.x} ${top + 1}`,
    `C ${last.x + 12} ${top - 1} ${last.x + 20} ${top + 5} ${last.x + 30} ${top + 3}`,
    `C ${last.x + 26} ${top + 10} ${last.x + 28} ${top + 16} ${last.x + 30} ${top + 20}`,
    `C ${last.x + 20} ${top + 22} ${last.x + 12} ${top + 16} ${last.x} ${top + 18} Z`,
  ].join(" ");

  return (
    <View className="mt-5 overflow-hidden rounded-[20px]" style={{ backgroundColor: colors.emberTint }}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="avRidge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.arcStrong} />
            <Stop offset="100%" stopColor={colors.arcMid} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>

        {/* Linha do cume: 100% de consistência. */}
        <Line
          x1={0}
          y1={SUMMIT}
          x2={WIDTH}
          y2={SUMMIT}
          stroke={colors.arcMid}
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={0.6}
        />

        <Path d={area} fill="url(#avRidge)" />
        <Path d={ridge} stroke={colors.ember} strokeWidth={2} fill="none" strokeLinejoin="round" />

        <Path d={`M ${last.x} ${last.y} V ${top}`} stroke={colors.ember} strokeWidth={2.6} strokeLinecap="round" />
        <Path d={flag} fill={colors.ember} />
      </Svg>
    </View>
  );
}

type ConsistencyMountainCardProps = {
  pct: number;
  deltaLabel: string;
  trend: Trend;
  series: number[];
  startLabel: string;
  endLabel: string;
};

export function ConsistencyMountainCard({
  pct,
  deltaLabel,
  trend,
  series,
  startLabel,
  endLabel,
}: ConsistencyMountainCardProps) {
  const { colors } = useTheme();
  const empty = series.every((value) => value === 0);

  return (
    <View
      className="mx-5 mt-[30px] overflow-hidden rounded-[30px] px-[22px] pb-[18px] pt-[22px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 56, lineHeight: 61, letterSpacing: -3, color: colors.ember }}
          >
            {pct}%
          </AppText>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 8 }}>
            de consistência na ação principal
          </AppText>
        </View>
        <View
          className="flex-row items-center rounded-full"
          style={{ gap: 6, backgroundColor: colors.emberChip, paddingVertical: 7, paddingHorizontal: 12 }}
        >
          {trend === "up" || trend === "down" ? (
            <View style={trend === "down" ? { transform: [{ scaleY: -1 }] } : undefined}>
              <TrendUpIcon color={colors.emberInk} />
            </View>
          ) : null}
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberInk }}>
            {deltaLabel}
          </AppText>
        </View>
      </View>

      <MountainChart series={series} />

      {empty ? (
        <AppText
          family="manrope"
          weight="semiBold"
          style={{ marginTop: 10, fontSize: 12, lineHeight: 17, color: colors.textMuted }}
        >
          Conclua a ação principal para começar a subir.
        </AppText>
      ) : null}

      <View className="mt-3 flex-row justify-between">
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textMuted }}>
          {startLabel}
        </AppText>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 11, color: colors.textMuted }}>
          {endLabel}
        </AppText>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 11, color: colors.ember }}>
          hoje
        </AppText>
      </View>
    </View>
  );
}
