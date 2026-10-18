import { useState } from "react";
import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  /**
   * `paper`: a inicial sobre o papel claro (listas e cards do social).
   * `sunken`: a inicial sobre a superfície do tema (barra do topo).
   * `accent`: a inicial sobre o pêssego (o cartão do Perfil).
   */
  tone?: "paper" | "sunken" | "accent";
  /** Anel claro em volta da foto — o das listas de pessoas. */
  ring?: boolean;
};

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Foto da pessoa, ou a inicial quando ela não tem foto (ou a foto não
 * carrega). Decorativo para leitores de tela: o nome sempre aparece ao lado.
 */
export function Avatar({ name, uri, size = 44, tone = "paper", ring = false }: AvatarProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(uri) && !failed;
  const ringWidth = ring ? Math.max(2, Math.round(size / 22)) : 0;
  const inner = size - ringWidth * 2;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: ring ? colors.paper : "transparent",
      }}
    >
      {showPhoto ? (
        <Image
          source={{ uri: uri! }}
          onError={() => setFailed(true)}
          style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.paperSunken }}
        />
      ) : (
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: inner,
            height: inner,
            backgroundColor:
              tone === "accent" ? colors.paperAccent : tone === "paper" ? colors.paperSunken : colors.surfaceSunken,
          }}
        >
          <AppText
            family="archivo"
            weight="bold"
            style={{
              fontSize: Math.round(inner * 0.4),
              color: tone === "sunken" ? colors.text : colors.onPaper,
            }}
          >
            {initialOf(name)}
          </AppText>
        </View>
      )}
    </View>
  );
}
