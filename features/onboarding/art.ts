import type { ImageSourcePropType } from "react-native";
import type { AreaId } from "./types";

/**
 * Ilustrações do onboarding (PNG 3D da marca, em `assets/onboarding`).
 * Cada tela pede a sua por nome; a de "por que isso importa" muda com a área.
 */
export const ONBOARDING_ART = {
  jornada: require("@/assets/onboarding/jornada.png"),
  coracao: require("@/assets/onboarding/coracao.png"),
  balaoCoracao: require("@/assets/onboarding/balao-coracao.png"),
  baloes: require("@/assets/onboarding/baloes.png"),
  calendario: require("@/assets/onboarding/calendario.png"),
  maleta: require("@/assets/onboarding/maleta.png"),
  livros: require("@/assets/onboarding/livros.png"),
  lampada: require("@/assets/onboarding/lampada.png"),
  relogio: require("@/assets/onboarding/relogio.png"),
  caderno: require("@/assets/onboarding/caderno.png"),
  bussola: require("@/assets/onboarding/bussola.png"),
} satisfies Record<string, ImageSourcePropType>;

const MOTIVATION_ART_BY_AREA: Partial<Record<AreaId, ImageSourcePropType>> = {
  saude: ONBOARDING_ART.coracao,
  rotina: ONBOARDING_ART.calendario,
  trabalho: ONBOARDING_ART.maleta,
  estudos: ONBOARDING_ART.livros,
  relacionamentos: ONBOARDING_ART.baloes,
  criatividade: ONBOARDING_ART.lampada,
};

/** A ilustração de "Por que isso é importante?": a da área, ou o balão com coração. */
export function motivationArtFor(area: AreaId | null): ImageSourcePropType {
  return (area && MOTIVATION_ART_BY_AREA[area]) ?? ONBOARDING_ART.balaoCoracao;
}
