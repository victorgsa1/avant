import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";

type IconProps = {
  size?: number;
  color?: string;
};

// Icon paths ported 1:1 from the "Avant Home v3" design's inline SVG markup.

export function BellIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M5.6 15.4V9.9a5.4 5.4 0 0 1 10.8 0v5.5M4 15.4h14M9.4 18h3.2"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClockIcon({ size = 12, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx={7} cy={7} r={6} stroke={color} strokeWidth={1.3} />
      <Path d="M7 4v3.3l2.2 1.3" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function InsightCheckIcon({ size = 15, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={(size * 14) / 15} viewBox="0 0 15 14" fill="none">
      <Path d="M1 11.4 5 6.4l2.6 2.4L14 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M10.4 2H14v3.6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowRightIcon({ width = 18, color: colorProp }: IconProps & { width?: number }) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={width} height={(width * 10) / 18} viewBox="0 0 18 10" fill="none">
      <Path d="M0 5h13.6M11 1.4 14.8 5 11 8.6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function TrendUpIcon({ size = 10, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberInk;
  return (
    <Svg width={size} height={(size * 11) / 10} viewBox="0 0 10 11" fill="none">
      <Path d="M5 1v9M1.4 4.6 5 1l3.6 3.6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ width = 14, color: colorProp }: IconProps & { width?: number }) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={width} height={(width * 10) / 15} viewBox="0 0 15 10" fill="none">
      <Path d="M0 5h11M8.6 1.4 12.4 5 8.6 8.6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function InfoIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.textFaint;
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx={7} cy={7} r={6} stroke={color} strokeWidth={1.2} />
      <Path d="M7 6.2v4M7 4.1v.1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function HistoryBarsIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.textFaint;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M4 15V7M9 15V3M14 15v-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.textFaint;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx={7.6} cy={7.6} r={5.8} stroke={color} strokeWidth={1.4} />
      <Path d="M11.9 11.9 16.4 16.4" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function RestartIcon({ size = 14, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Path d="M2 8.5a5.5 5.5 0 1 0 1.8-4.1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M1.6 2v3.2h3.2" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HeartIcon({ size = 19, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 17S2.6 12.6 2.6 7.6A3.9 3.9 0 0 1 10 5.7a3.9 3.9 0 0 1 7.4 1.9C17.4 12.6 10 17 10 17Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FocusIcon({ size = 19, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={7.4} stroke={color} strokeWidth={1.5} />
      <Circle cx={10} cy={10} r={2.6} fill={color} />
    </Svg>
  );
}

export function BookIcon({ size = 19, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 5.4 3 4v11.4l7 1.4 7-1.4V4l-7 1.4Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M10 5.6v11.2" stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

export function FlameIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={(size * 14) / 13} viewBox="0 0 13 14" fill="none">
      <Path
        d="M6.5 1.2 2.6 6.5a4.4 4.4 0 1 0 7.8 2.1c0-2.5-3.9-3.6-3.9-7.4Z"
        stroke={color}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckmarkIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={(size * 10) / 13} viewBox="0 0 13 10" fill="none">
      <Path d="M1.4 5.2 4.8 8.4 11.4 1.6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 0v20M0 10h20" stroke={color} strokeWidth={2.8} strokeLinecap="round" />
    </Svg>
  );
}

// Bottom nav icons — ported 1:1 from the design's "NAV" section.
export function NavHojeIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={3.8} fill={color} />
      <Path
        d="M11 1.8v2.4M11 17.8v2.4M1.8 11h2.4M17.8 11h2.4M4.4 4.4l1.8 1.8M15.8 15.8l1.8 1.8M17.6 4.4l-1.8 1.8M6.2 15.8l-1.8 1.8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function NavRankingIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onInverseMuted;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect x={1.6} y={12.4} width={4.4} height={7.6} rx={1} fill={color} />
      <Rect x={8.8} y={5.6} width={4.4} height={14.4} rx={1} fill={color} />
      <Rect x={16} y={9.6} width={4.4} height={10.4} rx={1} fill={color} />
    </Svg>
  );
}

export function NavProgressIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onInverseMuted;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={8.6} fill="none" stroke={color} strokeWidth={1.6} />
      <Path d="M11 11V2.4A8.6 8.6 0 0 1 19.6 11H11Z" fill={color} />
    </Svg>
  );
}

export function NavProfileIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onInverseMuted;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={6.8} r={3.8} fill={color} />
      <Path d="M3.4 20a7.6 7.6 0 0 1 15.2 0Z" fill={color} />
    </Svg>
  );
}

// Onboarding / login icons — ported 1:1 from the "Avant Onboarding" design.

export function ChevronLeftIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={(size * 8) / 13} height={size} viewBox="0 0 8 14" fill="none">
      <Path d="M6.6 1 1 7l5.6 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MicIcon({ size = 14, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberInk;
  return (
    <Svg width={(size * 12) / 16} height={size} viewBox="0 0 12 16" fill="none">
      <Rect x={3.6} y={1} width={4.8} height={8.4} rx={2.4} stroke={color} strokeWidth={1.3} />
      <Path d="M1.4 7.6a4.6 4.6 0 0 0 9.2 0M6 12.2V15" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function QuoteIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={(size * 16) / 13} height={size} viewBox="0 0 16 14" fill="none">
      <Path d="M6.2 1H1v5.2c0 3 2.2 5.4 5.2 5.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M15 1H9.8v5.2c0 3 2.2 5.4 5.2 5.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function BriefcaseIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={2.4} y={6} width={15.2} height={10.4} rx={2.2} stroke={color} strokeWidth={1.4} />
      <Path
        d="M7.4 6V4.6c0-.9.7-1.6 1.6-1.6h2c.9 0 1.6.7 1.6 1.6V6"
        stroke={color}
        strokeWidth={1.4}
      />
    </Svg>
  );
}

export function BarsIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3 15.4V8.6M7.6 15.4V5.4M12.2 15.4v-7M16.8 15.4V3.4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PeopleIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={7.4} cy={7} r={3} stroke={color} strokeWidth={1.4} />
      <Circle cx={13.6} cy={8.4} r={2.4} stroke={color} strokeWidth={1.4} />
      <Path
        d="M2 16.4a5.4 5.4 0 0 1 10.8 0M13 13.4a4.4 4.4 0 0 1 5 3"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DumbbellIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M2 8.2v3.6M5.4 5.6v8.8M14.6 5.6v8.8M18 8.2v3.6M5.4 10h9.2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CalendarDotIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberInk;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={2.8} y={4.2} width={14.4} height={13} rx={3} stroke={color} strokeWidth={1.5} />
      <Path d="M2.8 8.8h14.4M6.8 2v4M13.2 2v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={10} cy={12.8} r={1.4} fill={color} />
    </Svg>
  );
}

export function CloudIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberInk;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6 15.5h8.5a3.1 3.1 0 0 0 1-6.1A5.2 5.2 0 0 0 5.4 7.95 3.8 3.8 0 0 0 6 15.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ComebackIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberInk;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M16.6 8.6A6.8 6.8 0 1 0 17 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M17.4 4.4v4h-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SparkleIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 1c.9 4 2.3 5.4 6.3 6.3-4 .9-5.4 2.3-6.3 6.3-.9-4-2.3-5.4-6.3-6.3C5.7 6.4 7.1 5 8 1Z" fill={color} />
    </Svg>
  );
}

export function HeartFilledIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 14S1.8 10.2 1.8 6.1A3.3 3.3 0 0 1 8 4.5a3.3 3.3 0 0 1 6.2 1.6C14.2 10.2 8 14 8 14Z" fill={color} />
    </Svg>
  );
}

export function ShineIcon({ size = 13, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 1v3M7 10v3M1 7h3M10 7h3M2.8 2.8 5 5M9 9l2.2 2.2M11.2 2.8 9 5M5 9l-2.2 2.2"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TinyCheckIcon({ size = 11, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.emberWarm;
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path d="M1 6.4 4 9.4 11 2.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AppleIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M12.4 9.4c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.3-2.5-1.4-1-.1-2 .6-2.6.6-.5 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.3.6 2.3.6s1.5-.8 2.1-1.7c.7-1 .9-1.9.9-2-.1 0-1.9-.7-1.9-2.9Z"
        fill={color}
      />
      <Path d="M10.9 4.3c.5-.6.8-1.4.7-2.3-.7 0-1.6.5-2.1 1.1-.5.6-.9 1.4-.7 2.2.8.1 1.6-.4 2.1-1Z" fill={color} />
    </Svg>
  );
}

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M17.6 9.2c0-.6-.05-1.2-.16-1.75H9v3.3h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.53Z"
        fill="#4285F4"
      />
      <Path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <Path d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.95a9 9 0 0 0 0 8.1l3.02-2.33Z" fill="#FBBC05" />
      <Path
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function MailIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={2.4} y={4.6} width={15.2} height={10.8} rx={2.6} stroke={color} strokeWidth={1.5} />
      <Path d="m3.6 6.4 5.5 4.2a1.5 1.5 0 0 0 1.8 0l5.5-4.2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusThinIcon({ size = 15, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.textFaint;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 3v12M3 9h12" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
