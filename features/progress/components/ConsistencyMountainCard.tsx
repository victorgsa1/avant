import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { TrendUpIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

// Colors approximated from the design's oklch mountain-chart gradients,
// reusing the app's existing arc-ring hex tokens where they're close.
function ConsistencyChart() {
  const { colors } = useTheme();
  return (
    <View className="mt-5 overflow-hidden rounded-[20px]" style={{ backgroundColor: colors.emberTint }}>
      <Svg width="100%" height={188} viewBox="0 0 336 188" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="avFar" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.arcMid} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={colors.arcLight} stopOpacity={0.15} />
          </LinearGradient>
          <LinearGradient id="avMid" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0%" stopColor={colors.arcStrong} />
            <Stop offset="100%" stopColor={colors.arcMid} />
          </LinearGradient>
          <LinearGradient id="avNear" x1="0" y1="0" x2="0.6" y2="1">
            <Stop offset="0%" stopColor={colors.arcLight} stopOpacity={0.85} />
            <Stop offset="100%" stopColor={colors.onEmber} stopOpacity={0.55} />
          </LinearGradient>
        </Defs>

        <Path
          d="M-10 188 C 26 150 48 108 84 110 C 118 112 128 148 160 142 C 196 136 214 92 244 66 C 262 50 274 38 288 30 L 346 188 Z"
          fill="url(#avFar)"
        />
        <Path
          d="M-10 188 C 40 176 64 156 96 158 C 130 160 146 176 176 170 C 214 162 236 122 262 74 C 272 56 281 40 288 30 C 300 52 314 100 346 188 Z"
          fill="url(#avMid)"
        />
        <Path
          d="M-10 188 C 34 184 52 170 88 166 C 130 162 150 182 190 180 C 232 178 258 168 288 160 C 312 154 330 152 346 152 L 346 188 Z"
          fill="url(#avNear)"
        />

        <Circle cx={120} cy={150} r={2.6} fill={colors.arcStrong} opacity={0.5} />
        <Circle cx={196} cy={126} r={2.6} fill={colors.emberWarm} opacity={0.6} />
        <Circle cx={246} cy={86} r={2.6} fill={colors.emberWarm} opacity={0.7} />

        <Path d="M288 32 V 6" stroke={colors.ember} strokeWidth={2.6} strokeLinecap="round" />
        <Path d="M288 7 C 300 5 308 11 318 9 C 314 16 316 22 318 26 C 308 28 300 22 288 24 Z" fill={colors.ember} />
      </Svg>
    </View>
  );
}

type ConsistencyMountainCardProps = {
  pct: number;
  deltaLabel: string;
  startLabel: string;
  endLabel: string;
};

export function ConsistencyMountainCard({ pct, deltaLabel, startLabel, endLabel }: ConsistencyMountainCardProps) {
  const { colors } = useTheme();
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
            de consistência
          </AppText>
        </View>
        <View
          className="flex-row items-center rounded-full"
          style={{ gap: 6, backgroundColor: colors.emberChip, paddingVertical: 7, paddingHorizontal: 12 }}
        >
          <TrendUpIcon color={colors.emberInk} />
          <AppText family="manrope" weight="bold" style={{ fontSize: 11.5, color: colors.emberInk }}>
            {deltaLabel}
          </AppText>
        </View>
      </View>

      <ConsistencyChart />

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
