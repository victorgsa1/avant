import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";

type IconProps = {
  size?: number;
  color?: string;
};

// Ícones da área Social (amigos, conversa, convite, competição). Mesmo
// traço dos de `./index` — arquivo separado só para não crescer aquele.

export function LockIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={4.2} y={8.8} width={11.6} height={8.6} rx={2.2} stroke={color} strokeWidth={1.5} />
      <Path d="M6.8 8.8V6.6a3.2 3.2 0 0 1 6.4 0v2.2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function LinkIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8.4 11.6a3.3 3.3 0 0 0 4.7 0l2.7-2.7a3.3 3.3 0 0 0-4.7-4.7l-1 1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M11.6 8.4a3.3 3.3 0 0 0-4.7 0l-2.7 2.7a3.3 3.3 0 0 0 4.7 4.7l1-1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Balão de conversa, com a ponta embaixo à esquerda. */
export function ChatBubbleIcon({ size = 20, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.ember;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 3.3c4 0 7 2.6 7 5.8s-3 5.8-7 5.8c-.9 0-1.7-.1-2.4-.4L3.8 16.3l1-3.2C3.7 12 3 10.6 3 9.1c0-3.2 3-5.8 7-5.8Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UserPlusIcon({ size = 22, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onEmber;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx={9} cy={7.6} r={3.5} stroke={color} strokeWidth={1.7} />
      <Path d="M2.8 18.4c.6-3.3 3.1-5.3 6.2-5.3s5.6 2 6.2 5.3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M17.6 6.4v5.4M14.9 9.1h5.4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function ShareIcon({ size = 18, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 2.8v9.6M6.6 6.2 10 2.8l3.4 3.4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6.4 9H5.2a1.6 1.6 0 0 0-1.6 1.6v5a1.6 1.6 0 0 0 1.6 1.6h9.6a1.6 1.6 0 0 0 1.6-1.6v-5A1.6 1.6 0 0 0 14.8 9h-1.2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Três barras subindo: a posição no placar. */
export function RankBarsIcon({ size = 22, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.onPaper;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={3} y={10.6} width={3.4} height={6.4} rx={1.2} fill={color} />
      <Rect x={8.3} y={6.8} width={3.4} height={10.2} rx={1.2} fill={color} />
      <Rect x={13.6} y={3} width={3.4} height={14} rx={1.2} fill={color} />
    </Svg>
  );
}
