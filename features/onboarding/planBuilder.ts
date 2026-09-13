import type { PlanPreviewResponse } from "@/services/http/types";
import type { AreaId, StarterPlan } from "./types";

/**
 * Prévia local do primeiro compromisso, a partir da área escolhida.
 *
 * O plano REAL é montado pelo servidor em `POST /v1/onboarding/plan`, onde
 * a IA estrutura o texto livre em ações e o saneamento determinístico
 * decide o que dali vira hábito. O que fica aqui é só a prévia mostrada
 * enquanto a pessoa decide — instantânea, sem rede e sem token.
 *
 * O blueprint do servidor espelha estes mesmos valores: se um mudar, o
 * outro precisa mudar junto (`api/src/onboarding/domain/plan-sanitizer.ts`).
 */

export const AREA_LABELS: Record<AreaId, string> = {
  saude: "Saúde",
  rotina: "Rotina",
  trabalho: "Trabalho",
  estudos: "Estudos",
  financas: "Finanças",
  relacionamentos: "Relacionamentos",
  criatividade: "Criatividade",
  outro: "Meu objetivo",
};

interface AreaBlueprint {
  habitTitle: string;
  /** Rótulo do horário sugerido, e o minuto do dia correspondente. */
  windowLabel: string;
  startMinute: number;
  weeklyTarget: number;
  xpBase: number;
  difficulty: number;
  standard: string;
  minimum: string;
}

const BLUEPRINTS: Record<AreaId, AreaBlueprint> = {
  saude: {
    habitTitle: "Treino de academia",
    windowLabel: "Depois das 19h",
    startMinute: 19 * 60,
    weeklyTarget: 3,
    xpBase: 40,
    difficulty: 3,
    standard: "40 min de musculação + 15 min de cardio leve",
    minimum: "10 minutos de corpo livre, onde você estiver",
  },
  rotina: {
    habitTitle: "Organizar o dia seguinte",
    windowLabel: "Antes de dormir",
    startMinute: 21 * 60 + 30,
    weeklyTarget: 5,
    xpBase: 15,
    difficulty: 2,
    standard: "Listar as 3 prioridades de amanhã (10 min)",
    minimum: "Escolher só a primeira tarefa (3 min)",
  },
  trabalho: {
    habitTitle: "Um bloco de foco sem interrupção",
    windowLabel: "No começo da manhã",
    startMinute: 9 * 60,
    weeklyTarget: 3,
    xpBase: 25,
    difficulty: 3,
    standard: "50 minutos de trabalho profundo",
    minimum: "15 minutos com o celular longe",
  },
  estudos: {
    habitTitle: "Estudar 40 minutos",
    windowLabel: "Depois das 20h",
    startMinute: 20 * 60,
    weeklyTarget: 4,
    xpBase: 25,
    difficulty: 3,
    standard: "40 minutos de estudo",
    minimum: "Revisar por 15 minutos",
  },
  financas: {
    habitTitle: "Registrar meus gastos do dia",
    windowLabel: "Fim do dia",
    startMinute: 21 * 60,
    weeklyTarget: 6,
    xpBase: 15,
    difficulty: 1,
    standard: "Anotar todos os gastos do dia (10 min)",
    minimum: "Anotar só o maior gasto (2 min)",
  },
  relacionamentos: {
    habitTitle: "Um contato de verdade com alguém",
    windowLabel: "Ao longo do dia",
    startMinute: 18 * 60,
    weeklyTarget: 3,
    xpBase: 20,
    difficulty: 2,
    standard: "Uma conversa de 20 minutos sem celular",
    minimum: "Uma mensagem sincera (5 min)",
  },
  criatividade: {
    habitTitle: "Praticar minha arte",
    windowLabel: "Depois das 19h",
    startMinute: 19 * 60,
    weeklyTarget: 3,
    xpBase: 25,
    difficulty: 2,
    standard: "30 minutos de prática focada",
    minimum: "10 minutos com o que estiver à mão",
  },
  outro: {
    habitTitle: "Meu primeiro passo do dia",
    windowLabel: "No horário que der",
    startMinute: 19 * 60,
    weeklyTarget: 4,
    xpBase: 20,
    difficulty: 2,
    standard: "30 minutos dedicados à meta",
    minimum: "10 minutos já mantêm o movimento",
  },
};

function blueprintFor(area: AreaId | null): AreaBlueprint {
  return BLUEPRINTS[area ?? "outro"];
}

const MISSED_DAY = "Não compense. Apenas volte no próximo.";

function summaryFor(identity: string): string {
  const trimmed = identity.trim();
  return trimmed
    ? `Você disse: “${trimmed}”. Vamos começar por aqui.`
    : "Vamos começar por um passo pequeno e possível.";
}

/** 1170 → "A partir das 19h30". */
export function windowFromMinute(startMinute: number): string {
  const hours = Math.floor(startMinute / 60);
  const minutes = startMinute % 60;
  return `A partir das ${hours}h${minutes ? String(minutes).padStart(2, "0") : ""}`;
}

/**
 * Plano de reserva, a partir só da área: usado quando a prévia do servidor
 * não responde. Usa a fala da pessoa no resumo, sem inventar.
 */
export function buildStarterPlan(area: AreaId | null, identity: string): StarterPlan {
  const bp = blueprintFor(area);
  return {
    summary: summaryFor(identity),
    areaName: AREA_LABELS[area ?? "outro"],
    title: bp.habitTitle,
    window: bp.windowLabel,
    normalDays: bp.standard,
    hardDays: bp.minimum,
    missedDay: MISSED_DAY,
    extras: [],
    primary: { title: bp.habitTitle, weeklyTarget: bp.weeklyTarget, startMinute: bp.startMinute },
  };
}

/** A prévia do servidor (IA a partir da fala) no formato do card do plano. */
export function starterPlanFromPreview(preview: PlanPreviewResponse, identity: string): StarterPlan | null {
  const [primary, ...rest] = preview.habits;
  if (!primary) return null;

  return {
    // Mostrar o que a IA entendeu (e não só repetir a fala) é o que deixa
    // claro para a pessoa que o plano partiu do que ela disse.
    summary: preview.understanding?.trim() || summaryFor(identity),
    areaName: primary.areaName,
    title: primary.title,
    window: windowFromMinute(primary.startMinute),
    normalDays: primary.standardVersion,
    hardDays: primary.minimumVersion,
    missedDay: MISSED_DAY,
    extras: rest.map((habit) => ({
      title: habit.title,
      detail: `${habit.weeklyTarget}x por semana · ${habit.minimumVersion} nos dias difíceis`,
    })),
    primary: {
      title: primary.title,
      weeklyTarget: primary.weeklyTarget,
      startMinute: primary.startMinute,
    },
  };
}

/**
 * Palpite de área a partir da fala, só para pré-selecionar o chip do passo
 * seguinte. A pessoa pode trocar; o plano de verdade vem da IA.
 */
const AREA_HINTS: [AreaId, RegExp][] = [
  ["criatividade", /guitarr|viol[aã]o|m[uú]sic|\bcant(ar|or|ora)\b|\bbanda\b|piano|bateri|desenh|\bpint(ar|or|ura)|\barte\b|artista|escrev|escritor|fotograf|dan[cç]/],
  ["saude", /academia|trein|muscula|corr(er|ida)|emagrec|peso|sa[uú]de|dieta|forma f[ií]sica|atleta/],
  ["estudos", /estud|faculdade|prova|concurso|vestibular|ler mais|leitura|idioma|ingl[eê]s/],
  ["financas", /dinheiro|finan[cç]|d[ií]vida|economiz|investi|poupar/],
  ["trabalho", /trabalh|carreira|emprego|promo[cç][aã]o|empresa|neg[oó]cio|produtiv/],
  ["relacionamentos", /fam[ií]lia|amig|namor|casamento|filh|relacionamento/],
  ["rotina", /rotina|organiz|acordar cedo|dormir|sono|disciplina/],
];

export function suggestAreaFromText(text: string): AreaId | null {
  const normalized = text.toLowerCase();
  for (const [area, pattern] of AREA_HINTS) {
    if (pattern.test(normalized)) return area;
  }
  return null;
}

/**
 * Dia da semana (0=domingo) a partir da data local do usuário devolvida
 * pela API (`GET /v1/today` → `date`, "YYYY-MM-DD").
 *
 * NÃO usamos `new Date().getDay()` do aparelho: o servidor planeja pelo
 * timezone salvo em `UserPreferences`, que pode divergir do fuso do
 * dispositivo — e aí agendaríamos um dia que, para o backend, não é hoje.
 * Meio-dia UTC evita qualquer borda de horário de verão.
 */
export function weekdayFromApiDate(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

/**
 * Escolhe os dias da semana começando por HOJE.
 *
 * O princípio do produto é colocar em movimento rápido: se o primeiro
 * compromisso cair só na semana que vem, a pessoa termina o onboarding sem
 * nada para fazer. Incluindo hoje, o primeiro movimento existe já.
 */
export function scheduleDays(weeklyTarget: number, today: number): number[] {
  // Espaçamento ideal entre as ocorrências, a partir de hoje.
  const step = Math.max(1, Math.round(7 / weeklyTarget));
  const days = new Set<number>();

  for (let i = 0; days.size < weeklyTarget && i < 7; i += 1) {
    days.add((today + i * step) % 7);
  }
  // Se o passo colidiu antes de completar a meta, preenche o que faltar.
  for (let offset = 0; days.size < weeklyTarget && offset < 7; offset += 1) {
    days.add((today + offset) % 7);
  }

  return [...days].sort((a, b) => a - b);
}
