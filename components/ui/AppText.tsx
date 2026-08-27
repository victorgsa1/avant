import { Text, type TextProps } from "react-native";
import { fonts } from "@/constants/theme";

type Family = "archivo" | "manrope";
type ArchivoWeight = keyof typeof fonts.archivo;
type ManropeWeight = keyof typeof fonts.manrope;

type AppTextProps = TextProps & {
  family?: Family;
  weight?: ArchivoWeight | ManropeWeight;
  italic?: boolean;
};

function resolveFontFamily(family: Family, weight?: string, italic?: boolean) {
  if (family === "archivo") {
    if (italic) return fonts.archivo.blackItalic;
    return fonts.archivo[(weight as ArchivoWeight) ?? "bold"];
  }
  return fonts.manrope[(weight as ManropeWeight) ?? "medium"];
}

// Typed replacement for the old className-substring font matching.
export function AppText({ family = "manrope", weight, italic, style, ...rest }: AppTextProps) {
  const fontFamily = resolveFontFamily(family, weight, italic);
  return <Text {...rest} style={[{ fontFamily }, style]} />;
}
