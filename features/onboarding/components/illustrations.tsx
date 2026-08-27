import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";

// Ported 1:1 from the inline SVGs in the "Avant Onboarding" design. The soft
// radial halos behind some of them are plain Views in the parent — only the
// line/shape work lives here.

export function IdentityArt() {
  const { colors } = useTheme();
  return (
    <Svg width={150} height={96} viewBox="0 0 150 96" fill="none">
      <Defs>
        <LinearGradient id="avIl1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.ember} />
          <Stop offset="1" stopColor={colors.emberPale} />
        </LinearGradient>
      </Defs>
      <Circle cx={48} cy={38} r={14} fill="url(#avIl1)" />
      <Path d="M24 88a24 24 0 0 1 48 0Z" fill="url(#avIl1)" />
      <Path d="M92 70C108 62 118 50 126 32" stroke={colors.emberMid} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="1 8" />
      <Path d="M119 33l7-4 2 8" stroke={colors.emberMid} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M132 8c1.2 4.4 2.6 5.8 7 7-4.4 1.2-5.8 2.6-7 7-1.2-4.4-2.6-5.8-7-7 4.4-1.2 5.8-2.6 7-7Z" fill={colors.emberMid} />
      <Path d="M104 14c.9 3.2 1.9 4.2 5.1 5.1-3.2.9-4.2 1.9-5.1 5.1-.9-3.2-1.9-4.2-5.1-5.1 3.2-.9 4.2-1.9 5.1-5.1Z" fill={colors.emberSoft} />
    </Svg>
  );
}

export function HealthArt() {
  const { colors } = useTheme();
  return (
    <Svg width={112} height={88} viewBox="0 0 112 88" fill="none">
      <Defs>
        <LinearGradient id="avIl3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.ember} />
          <Stop offset="1" stopColor={colors.emberPale} />
        </LinearGradient>
      </Defs>
      <Circle cx={56} cy={46} r={40} fill={colors.emberChip} />
      <Path
        d="M56 74C40 63 28 52 28 37.5 28 29.5 34.5 23 42.5 23 48 23 53 26 56 31 59 26 64 23 69.5 23 77.5 23 84 29.5 84 37.5 84 52 72 63 56 74Z"
        fill="url(#avIl3)"
      />
      <Path d="M38 36c1-5.5 5.5-9.5 11-10" stroke={`${colors.onEmber}8C`} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Path d="M97 12c1.2 4.4 2.6 5.8 7 7-4.4 1.2-5.8 2.6-7 7-1.2-4.4-2.6-5.8-7-7 4.4-1.2 5.8-2.6 7-7Z" fill={colors.emberMid} />
      <Path d="M13 24c.9 3.2 1.9 4.2 5.1 5.1-3.2.9-4.2 1.9-5.1 5.1-.9-3.2-1.9-4.2-5.1-5.1 3.2-.9 4.2-1.9 5.1-5.1Z" fill={colors.emberSoft} />
    </Svg>
  );
}

export function PathArt() {
  const { colors } = useTheme();
  return (
    <Svg width={160} height={82} viewBox="0 0 160 82" fill="none">
      <Defs>
        <LinearGradient id="avIl4" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.ember} />
          <Stop offset="1" stopColor={colors.emberPale} />
        </LinearGradient>
      </Defs>
      <Circle cx={10} cy={68} r={6} fill="url(#avIl4)" />
      <Path d="M18 66c16-2 27-7 36-15" stroke={colors.ember} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M64 44c8-5 13-11 17-19" stroke={colors.emberSoft} strokeWidth={2.6} strokeLinecap="round" strokeDasharray="1 8" />
      <Path d="M92 22c15-8 30-12 52-14" stroke={colors.ember} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M62 62c-9 0-14-7-10-14 3-6 11-8 16-4 7 4 6 12 1 15-2 2-4 3-7 3Z" fill="url(#avIl4)" opacity={0.75} />
      <Path d="M148 2c1.2 4.4 2.6 5.8 7 7-4.4 1.2-5.8 2.6-7 7-1.2-4.4-2.6-5.8-7-7 4.4-1.2 5.8-2.6 7-7Z" fill={colors.emberMid} />
    </Svg>
  );
}

export function PeakArt() {
  const { colors } = useTheme();
  return (
    <Svg width={240} height={196} viewBox="0 0 240 196" fill="none">
      <Defs>
        <LinearGradient id="avPk6" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.ember} />
          <Stop offset="1" stopColor={colors.emberPale} />
        </LinearGradient>
        <LinearGradient id="avPkB6" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.emberSoft} />
          <Stop offset="1" stopColor={colors.emberChip} />
        </LinearGradient>
      </Defs>
      <Path d="M148 78 214 196H92Z" fill="url(#avPkB6)" />
      <Path d="M104 52 190 196H18Z" fill="url(#avPk6)" />
      <Path d="M104 50V22" stroke={colors.emberDeep} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M104 21c9-5.5 18-5.5 27 0v16c-9-5.5-18-5.5-27 0Z" fill={colors.ember} />
      <Path d="M196 30c1.3 4.6 2.8 6.1 7.4 7.4-4.6 1.3-6.1 2.8-7.4 7.4-1.3-4.6-2.8-6.1-7.4-7.4 4.6-1.3 6.1-2.8 7.4-7.4Z" fill={colors.emberMid} />
      <Path d="M36 14c1 3.5 2.1 4.6 5.6 5.6-3.5 1-4.6 2.1-5.6 5.6-1-3.5-2.1-4.6-5.6-5.6 3.5-1 4.6-2.1 5.6-5.6Z" fill={colors.emberSoft} />
      <Circle cx={222} cy={88} r={3} fill={colors.emberSoft} />
      <Circle cx={20} cy={72} r={2.4} fill={colors.emberSoft} />
    </Svg>
  );
}

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
