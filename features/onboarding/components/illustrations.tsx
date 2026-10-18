import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";

// Login hero — same vocabulary as the onboarding art (climb, trail, sparkles),
// composed for the entry screen.
export function LoginArt() {
  const { colors } = useTheme();
  return (
    <Svg width={210} height={148} viewBox="0 0 210 148" fill="none">
      <Defs>
        <LinearGradient id="avLg1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.ember} />
          <Stop offset="1" stopColor={colors.emberPale} />
        </LinearGradient>
        <LinearGradient id="avLg2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.emberSoft} />
          <Stop offset="1" stopColor={colors.emberChip} />
        </LinearGradient>
      </Defs>
      <Circle cx={105} cy={82} r={60} fill={colors.emberTint} />
      <Path d="M136 62 196 148H96Z" fill="url(#avLg2)" />
      <Path d="M86 40 158 148H14Z" fill="url(#avLg1)" />
      <Path d="M86 38V14" stroke={colors.emberDeep} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M86 13c8-5 16-5 24 0v14c-8-5-16-5-24 0Z" fill={colors.ember} />
      <Path d="M178 22c1.2 4.4 2.6 5.8 7 7-4.4 1.2-5.8 2.6-7 7-1.2-4.4-2.6-5.8-7-7 4.4-1.2 5.8-2.6 7-7Z" fill={colors.emberMid} />
      <Path d="M26 26c.9 3.2 1.9 4.2 5.1 5.1-3.2.9-4.2 1.9-5.1 5.1-.9-3.2-1.9-4.2-5.1-5.1 3.2-.9 4.2-1.9 5.1-5.1Z" fill={colors.emberSoft} />
      <Circle cx={196} cy={62} r={3} fill={colors.emberSoft} />
      <Circle cx={16} cy={62} r={2.4} fill={colors.emberSoft} />
    </Svg>
  );
}
