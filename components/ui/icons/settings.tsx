import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";

type IconProps = {
  size?: number;
  color?: string;
};

// Ícones do Perfil e das telas de ajustes. Traço contornado e grosso, mesmo
// desenho em todas as linhas — arquivo separado só para não crescer `./index`.

const STROKE = 1.7;

export function CompassIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.4} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M15.8 8.2 13.6 13.6 8.2 15.8l2.2-5.4 5.4-2.2Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChecklistIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3.2} y={3.2} width={17.6} height={17.6} rx={4} stroke={color} strokeWidth={STROKE} />
      <Path
        d="m7.2 9.2 1.5 1.5 2.7-2.9M7.2 15.2l1.5 1.5 2.7-2.9M13.8 9.6h3M13.8 15.6h3"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GridIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3.2} y={3.2} width={7.4} height={7.4} rx={2.2} stroke={color} strokeWidth={STROKE} />
      <Rect x={13.4} y={3.2} width={7.4} height={7.4} rx={2.2} stroke={color} strokeWidth={STROKE} />
      <Rect x={3.2} y={13.4} width={7.4} height={7.4} rx={2.2} stroke={color} strokeWidth={STROKE} />
      <Rect x={13.4} y={13.4} width={7.4} height={7.4} rx={2.2} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function ClockOutlineIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.4} stroke={color} strokeWidth={STROKE} />
      <Path d="M12 7v5l3.2 2.2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BellOutlineIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 16.6V11a6 6 0 0 1 12 0v5.6l1.6 1.8H4.4L6 16.6Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M10 21h4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function MoonIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.6A8.6 8.6 0 1 1 9.4 4a7 7 0 0 0 10.6 10.6Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SunIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4.2} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Aparelho: celular de pé. Serve para "do sistema" e para sessões. */
export function PhoneIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6.4} y={2.6} width={11.2} height={18.8} rx={2.8} stroke={color} strokeWidth={STROKE} />
      <Path d="M10.4 18h3.2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.8 19.4 5.8v5.6c0 4.6-3.1 8.3-7.4 9.8-4.3-1.5-7.4-5.2-7.4-9.8V5.8L12 2.8Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M12 15.4 9 12.2l3-3.2 3 3.2-3 3.2Z" fill={color} />
    </Svg>
  );
}

export function LockOutlineIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4.6} y={10.2} width={14.8} height={11} rx={2.8} stroke={color} strokeWidth={STROKE} />
      <Path d="M8 10.2V7.6a4 4 0 0 1 8 0v2.6" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx={12} cy={14.8} r={1.4} fill={color} />
      <Path d="M12 15.6v2.2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function DatabaseIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.6 6c0-1.7 3.3-3 7.4-3s7.4 1.3 7.4 3-3.3 3-7.4 3-7.4-1.3-7.4-3Z"
        stroke={color}
        strokeWidth={STROKE}
      />
      <Path
        d="M4.6 6v12c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3V6M4.6 12c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3"
        stroke={color}
        strokeWidth={STROKE}
      />
    </Svg>
  );
}

export function PencilIcon({ size = 16, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m3.6 20.4 1-4.4L15.4 5.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8 19.4l-4.4 1Z"
        fill={color}
      />
    </Svg>
  );
}

export function TrashIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.4 6.8h15.2M9.4 6.8V4.6h5.2v2.2M6.4 6.8l.8 12.4a1.8 1.8 0 0 0 1.8 1.6h6a1.8 1.8 0 0 0 1.8-1.6l.8-12.4M10.2 10.8v6M13.8 10.8v6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UserOutlineIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={STROKE} />
      <Path d="M4.4 20.6a7.6 7.6 0 0 1 15.2 0" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function KeyIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={8} cy={15.6} r={4.4} stroke={color} strokeWidth={STROKE} />
      <Path
        d="m11.2 12.4 8.4-8.4M16.4 7.2l2.4 2.4M14 9.6l1.8 1.8"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GlobeIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.4} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M2.6 12h18.8M12 2.6c2.5 2.6 3.8 5.8 3.8 9.4s-1.3 6.8-3.8 9.4c-2.5-2.6-3.8-5.8-3.8-9.4S9.5 5.2 12 2.6Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Ritmo: meio mostrador com o ponteiro. */
export function GaugeIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3.4 17.4a8.6 8.6 0 1 1 17.2 0" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Path d="m12 16.4 4-5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx={12} cy={16.6} r={1.6} fill={color} />
    </Svg>
  );
}

export function AtSignIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3.8} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M15.8 12v1.4a2.6 2.6 0 0 0 5.2 0V12a9 9 0 1 0-3.6 7.2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}
