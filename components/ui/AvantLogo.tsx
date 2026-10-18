import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/components/theme/ThemeProvider";
import { brandColors } from "@/constants/theme";
import {
  AVANT_LOGO_HEIGHT,
  AVANT_LOGO_MARK,
  AVANT_LOGO_WIDTH,
  AVANT_LOGO_WORD,
} from "@/components/ui/avantLogoPaths";

type AvantLogoProps = {
  /** Altura em pt; a largura sai da proporção da arte. */
  height?: number;
  /**
   * "color": palavra escura, para fundo claro. "white": palavra branca, para
   * fundo escuro. O símbolo fica laranja nas duas. Sem valor, segue o tema.
   */
  variant?: "color" | "white";
};

/** A logo Avant completa (símbolo + palavra), em vetor. */
export function AvantLogo({ height = 28, variant }: AvantLogoProps) {
  const { isDark } = useTheme();
  const white = (variant ?? (isDark ? "white" : "color")) === "white";
  const width = (height * AVANT_LOGO_WIDTH) / AVANT_LOGO_HEIGHT;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${AVANT_LOGO_WIDTH} ${AVANT_LOGO_HEIGHT}`}>
      <Path d={AVANT_LOGO_MARK} fill={brandColors.avantOrange} fillRule="evenodd" />
      <Path d={AVANT_LOGO_WORD} fill={white ? brandColors.avantWhite : brandColors.avantInk} fillRule="evenodd" />
    </Svg>
  );
}
