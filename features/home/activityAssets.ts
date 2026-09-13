import type { ImageSourcePropType } from "react-native";
import {
  BarsIcon,
  BookIcon,
  BriefcaseIcon,
  FocusIcon,
  HeartIcon,
  MusicIcon,
  OpenBookIcon,
  PeopleIcon,
  SneakerIcon,
  StretchIcon,
} from "@/components/ui/icons";

/**
 * Que desenho representa a atividade.
 *
 * A escolha de verdade é do servidor: quando o plano nasce, ele grava em
 * `habit.iconKey` a chave do catálogo ("caminhar") ou, se nenhuma servir, a
 * chave da área ("saude"). Aqui só traduzimos chave → desenho.
 *
 * O casamento por palavra do título continua como rede de segurança para os
 * hábitos criados antes desse campo existir — não como o caminho principal.
 *
 * As chaves espelham `api/src/onboarding/domain/activity-icon.ts`.
 */

type IconComponent = typeof SneakerIcon;

const ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  caminhar: require("../../assets/atividades/caminhar.png"),
  ler: require("../../assets/atividades/ler.png"),
  estudar: require("../../assets/atividades/estudar.png"),
  trabalhar: require("../../assets/atividades/trabalhar.png"),
  "treinar-musculacao": require("../../assets/atividades/treinar-musculacao.png"),
  "treinar-em-jogo": require("../../assets/atividades/treinar-em-jogo.png"),
  "praticar-xadrez": require("../../assets/atividades/praticar-xadrez.png"),
  "praticar-instrumento": require("../../assets/atividades/praticar-instrumento.png"),
  "praticar-esporte": require("../../assets/atividades/praticar-esporte.png"),
};

/** Atividades que têm ícone mas não têm ilustração própria. */
const ACTIVITY_ICONS: Record<string, IconComponent> = {
  caminhar: SneakerIcon,
  "treinar-musculacao": SneakerIcon,
  "praticar-esporte": FocusIcon,
  "treinar-em-jogo": FocusIcon,
  "praticar-xadrez": FocusIcon,
  "praticar-instrumento": MusicIcon,
  ler: OpenBookIcon,
  estudar: FocusIcon,
  trabalhar: BriefcaseIcon,
  alongar: StretchIcon,
};

/** A queda final: o ícone da categoria, quando a atividade não tem desenho. */
const AREA_ICONS: Record<string, IconComponent> = {
  saude: HeartIcon,
  rotina: FocusIcon,
  trabalho: BriefcaseIcon,
  estudos: BookIcon,
  financas: BarsIcon,
  relacionamentos: PeopleIcon,
  criatividade: MusicIcon,
  outro: FocusIcon,
};

type Activity = {
  key: string;
  /** Pedaços de palavra, já sem acento: "along" pega alongar e alongamento. */
  words: string[];
};

const LEGACY_MATCHES: Activity[] = [
  { key: "alongar", words: ["along", "stretch", "mobilidade", "aqueci", "postura"] },
  { key: "ler", words: ["ler", "leitura", "livro", "pagina", "capitulo"] },
  {
    key: "treinar-musculacao",
    words: ["muscula", "academia", "malhar", "halter", "agachament", "supino", "ferro"],
  },
  { key: "caminhar", words: ["caminh", "andar", "corr", "tenis", "passo", "trot", "esteira"] },
  { key: "estudar", words: ["estud", "curso", "aula", "revis", "caderno", "anota", "prova"] },
  { key: "trabalhar", words: ["trabalh", "escritorio", "reuniao", "cliente", "projeto", "foco"] },
  { key: "praticar-xadrez", words: ["xadrez", "chess", "tatica"] },
  { key: "treinar-em-jogo", words: ["jogo", "game", "partida", "ranqueada"] },
  {
    key: "praticar-instrumento",
    words: ["instrumento", "violao", "guitarra", "piano", "bateria", "musica", "tocar", "cantar"],
  },
  {
    key: "praticar-esporte",
    words: ["esporte", "futebol", "bola", "volei", "basquete", "natacao", "nadar", "luta", "bike", "pedal"],
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function keyFor(iconKey: string | null, title: string): string | null {
  if (iconKey) return iconKey;
  const text = normalize(title);
  return LEGACY_MATCHES.find((activity) => activity.words.some((word) => text.includes(word)))?.key ?? null;
}

export type ActivityArt =
  | { kind: "illustration"; source: ImageSourcePropType }
  | { kind: "icon"; Icon: IconComponent };

/** O desenho grande do card da principal. Nunca devolve nada: sempre há arte. */
export function artFor(iconKey: string | null, title: string): ActivityArt {
  const key = keyFor(iconKey, title);
  if (key && ILLUSTRATIONS[key]) return { kind: "illustration", source: ILLUSTRATIONS[key] };
  if (key && AREA_ICONS[key]) return { kind: "icon", Icon: AREA_ICONS[key] };
  if (key && ACTIVITY_ICONS[key]) return { kind: "icon", Icon: ACTIVITY_ICONS[key] };
  return { kind: "icon", Icon: FocusIcon };
}

/** O ícone pequeno da linha de complementar. */
export function taskIconFor(iconKey: string | null, title: string): IconComponent {
  const key = keyFor(iconKey, title);
  if (!key) return FocusIcon;
  return ACTIVITY_ICONS[key] ?? AREA_ICONS[key] ?? FocusIcon;
}
