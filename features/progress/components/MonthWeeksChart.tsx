import { useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { MonthWeek } from "../types";

const CHART_HEIGHT = 196;
/** Espaço acima do ponto mais alto para o rótulo "8/8". */
const TOP = 42;
const BOTTOM = CHART_HEIGHT;
/** Zero fica um pouco acima do chão, para o ponto não sumir na borda. */
const LIFT = 12;
/** Quanto a área escorre para fora do primeiro e do último ponto. */
const SPILL = 18;

function path(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

/**
 * Cada ponto é uma semana do mês: feitas sobre previstas da principal. A
 * altura é a fração cumprida, então 8/8 é o topo e 3/6 fica no meio. Semana
 * que ainda não começou não ganha ponto — nada de linha desenhada no futuro.
 */
export function MonthWeeksChart({ weeks }: { weeks: MonthWeek[] }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const padX = Math.round(width * 0.09);
  const step = (width - padX * 2) / Math.max(1, weeks.length - 1);
  const xs = weeks.map((_, index) => padX + index * step);

  const points = weeks.flatMap((week, index) => {
    if (!week.started) return [];
    const ratio = week.planned > 0 ? week.done / week.planned : 0;
    return [{ x: xs[index], y: BOTTOM - LIFT - ratio * (BOTTOM - LIFT - TOP), week }];
  });
  const hasData = points.some((point) => point.week.planned > 0);

  const summary = points
    .map((point) => `${point.week.label}: ${point.week.done} de ${point.week.planned}`)
    .join(", ");

  if (!hasData) {
    return (
      <View className="px-6" style={{ marginTop: 22 }}>
        <View
          className="items-center justify-center rounded-[22px]"
          style={{ height: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 20 }}
        >
          <AppText
            family="manrope"
            weight="medium"
            style={{ fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: "center" }}
          >
            As semanas do mês aparecem aqui conforme o plano acontece.
          </AppText>
        </View>
      </View>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];
  const ridge = path(points);
  const area = `M ${(first.x - SPILL).toFixed(1)} ${BOTTOM} L ${ridge.slice(2)} L ${(last.x + SPILL).toFixed(1)} ${BOTTOM} Z`;

  // As montanhas do fundo são só cenário: não seguem os dados.
  const mountains = path([
    { x: 0, y: BOTTOM - 36 },
    { x: width * 0.12, y: BOTTOM - 74 },
    { x: width * 0.3, y: BOTTOM - 30 },
    { x: width * 0.5, y: TOP + 34 },
    { x: width * 0.64, y: BOTTOM - 88 },
    { x: width * 0.78, y: BOTTOM - 46 },
    { x: width * 0.93, y: TOP + 18 },
    { x: width, y: BOTTOM - 60 },
    { x: width, y: BOTTOM },
    { x: 0, y: BOTTOM },
  ]);

  return (
    <View style={{ marginTop: 18 }} accessible accessibilityLabel={`Feitas sobre previstas por semana. ${summary}`}>
      <View style={{ height: CHART_HEIGHT }}>
        <Svg width={width} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="avMonthArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.emberMid} />
              <Stop offset="100%" stopColor={colors.ember} />
            </LinearGradient>
          </Defs>

          <Path d={`${mountains} Z`} fill={colors.surfaceSunken} opacity={0.6} />
          <Path d={area} fill="url(#avMonthArea)" />
          {/* emberDeep: escuro no claro e claro no escuro — a borda lê nos dois temas. */}
          <Path d={ridge} stroke={colors.emberDeep} strokeWidth={2} fill="none" strokeLinejoin="round" />

          {points.map((point) =>
            point === last ? (
              <Circle key={point.week.label} cx={point.x} cy={point.y} r={11} fill={colors.ember} opacity={0.3} />
            ) : null,
          )}
          {points.map((point) => (
            <Circle
              key={`dot-${point.week.label}`}
              cx={point.x}
              cy={point.y}
              r={point === last ? 7 : 5}
              fill={colors.onEmber}
              stroke={colors.ember}
              strokeWidth={point === last ? 3 : 2.4}
            />
          ))}
        </Svg>

        {points.map((point) => (
          <AppText
            key={`label-${point.week.label}`}
            family="archivo"
            weight="extraBold"
            style={{
              position: "absolute",
              left: point.x - 24,
              top: point.y - (point === last ? 32 : 28),
              width: 48,
              textAlign: "center",
              fontSize: 13,
              color: colors.text,
            }}
          >
            {point.week.planned > 0 ? `${point.week.done}/${point.week.planned}` : "—"}
          </AppText>
        ))}
      </View>

      <View style={{ height: 34 }}>
        {weeks.map((week, index) => (
          <AppText
            key={week.label}
            family="manrope"
            weight="semiBold"
            style={{
              position: "absolute",
              left: xs[index] - 20,
              top: 14,
              width: 40,
              textAlign: "center",
              fontSize: 12,
              color: week.started ? colors.textMuted : colors.textWhisper,
            }}
          >
            {week.label}
          </AppText>
        ))}
      </View>

      <AppText
        family="manrope"
        weight="medium"
        className="px-6"
        style={{ marginTop: 6, fontSize: 11.5, color: colors.textFaint }}
      >
        Realizadas / previstas em cada semana
      </AppText>
    </View>
  );
}
