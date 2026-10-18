import type { ImageSourcePropType } from "react-native";
import { artFor } from "@/features/home/activityAssets";
import type { InsightType, SocialFeedItem } from "@/services/http/types";

/**
 * Os desenhos do social. Os resumos semanais reaproveitam as ilustrações 3D
 * da marca (as do onboarding); as competições usam o mesmo catálogo de
 * atividades da Hoje — "7 dias de xadrez" ganha o tabuleiro.
 */
const ART = {
  relogio: require("@/assets/onboarding/relogio.png"),
  caderno: require("@/assets/onboarding/caderno.png"),
  livros: require("@/assets/onboarding/livros.png"),
  maleta: require("@/assets/onboarding/maleta.png"),
  jornada: require("@/assets/onboarding/jornada.png"),
  coracao: require("@/assets/onboarding/coracao.png"),
  lampada: require("@/assets/onboarding/lampada.png"),
  calendario: require("@/assets/onboarding/calendario.png"),
} satisfies Record<string, ImageSourcePropType>;

export const SOCIAL_ART = {
  pedidos: require("@/assets/social/pedidos-amizade.png") as ImageSourcePropType,
  conversa: require("@/assets/social/baloes-conversa.png") as ImageSourcePropType,
  jornada: ART.jornada,
};

/** Pedaços de palavra, já sem acento. A manchete do resumo diz do que ele trata. */
const KEYWORDS: { words: string[]; art: ImageSourcePropType }[] = [
  { words: ["pontual", "horario", "manha", "tarde", "noite", "cedo", "hora"], art: ART.relogio },
  { words: ["estud", "aula", "curso", "revis"], art: ART.caderno },
  { words: ["leitura", "ler ", "livro", "pagina"], art: ART.livros },
  { words: ["trabalh", "projeto", "foco"], art: ART.maleta },
  { words: ["volt", "retom", "recome"], art: ART.jornada },
];

const BY_TYPE: Record<InsightType, ImageSourcePropType> = {
  BEST_TIME: ART.relogio,
  CONSISTENCY: ART.calendario,
  RECOVERY: ART.jornada,
  DIFFICULT_DAY: ART.coracao,
  BEHAVIOR_PATTERN: ART.lampada,
  ROUTINE_STABILITY: ART.calendario,
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Pela manchete, não pelo corpo: quase todo corpo cita um período do dia
 * ("seus melhores dias são de manhã") e viraria relógio para todo mundo.
 */
export function insightArtFor(item: Pick<SocialFeedItem, "type" | "title">): ImageSourcePropType {
  const title = `${normalize(item.title)} `;
  const byTitle = KEYWORDS.find((entry) => entry.words.some((word) => title.includes(word)));
  return byTitle?.art ?? BY_TYPE[item.type] ?? ART.calendario;
}

/** Sem atividade reconhecível no título, a competição vira a trilha. */
export function competitionArtFor(title: string, description: string | null): ImageSourcePropType {
  const art = artFor(null, `${title} ${description ?? ""}`);
  return art.kind === "illustration" ? art.source : ART.jornada;
}
