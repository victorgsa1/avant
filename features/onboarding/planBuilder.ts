import type { AreaId, StarterPlan } from "./types";
import type { CreateHabitInput } from "@/services/http/types";

/**
 * Constrói o primeiro compromisso a partir da área escolhida.
 *
 * DETERMINÍSTICO de propósito — nenhuma chamada de IA no onboarding. A IA
 * do Avant só entra depois, sobre dados já coletados e validados, para
 * adaptar o plano ao comportamento real da pessoa.
 *
 * O objetivo aqui é colocar em movimento, não criar o plano perfeito: uma
 * ação pequena, com variante mínima para os dias difíceis.
 */

export const AREA_LABELS: Record<AreaId, string> = {
  saude: "Saúde",
  rotina: "Rotina",
  trabalho: "Trabalho",
  estudos: "Estudos",
  financas: "Finanças",
  relacionamentos: "Relacionamentos",
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
    habitTitle: "Treinar 30 minutos",
    windowLabel: "Depois das 19h",
    startMinute: 19 * 60,
    weeklyTarget: 3,
    xpBase: 30,
    difficulty: 3,
    standard: "Treino de 30 min",
    minimum: "10 minutos já contam",
  },
  rotina: {
    habitTitle: "Organizar o dia seguinte",
    windowLabel: "Antes de dormir",
    startMinute: 21 * 60 + 30,
    weeklyTarget: 5,
    xpBase: 15,
    difficulty: 2,
    standard: "Listar as 3 prioridades de amanhã",
    minimum: "Escolher só a primeira tarefa",
  },
  trabalho: {
    habitTitle: "Um bloco de foco sem interrupção",
    windowLabel: "No começo da manhã",
    startMinute: 9 * 60,
    weeklyTarget: 5,
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
    minimum: "Revisar por 10 minutos",
  },
  financas: {
    habitTitle: "Registrar meus gastos do dia",
    windowLabel: "Fim do dia",
    startMinute: 21 * 60,
    weeklyTarget: 6,
    xpBase: 15,
    difficulty: 1,
    standard: "Anotar todos os gastos",
    minimum: "Anotar só o maior gasto",
  },
  relacionamentos: {
    habitTitle: "Um contato de verdade com alguém",
    windowLabel: "Ao longo do dia",
    startMinute: 18 * 60,
    weeklyTarget: 3,
    xpBase: 20,
    difficulty: 2,
    standard: "Uma conversa sem pressa",
    minimum: "Uma mensagem sincera",
  },
  outro: {
    habitTitle: "Meu primeiro passo do dia",
    windowLabel: "No horário que der",
    startMinute: 19 * 60,
    weeklyTarget: 4,
    xpBase: 20,
    difficulty: 2,
    standard: "20 minutos dedicados",
    minimum: "5 minutos já mantêm o movimento",
  },
};

function blueprintFor(area: AreaId | null): AreaBlueprint {
  return BLUEPRINTS[area ?? "outro"];
}

/** Resumo mostrado no card do plano — usa a fala da pessoa, sem inventar. */
export function buildStarterPlan(area: AreaId | null, identity: string): StarterPlan {
  const bp = blueprintFor(area);
  const trimmed = identity.trim();
  const summary = trimmed
    ? `Você disse: “${trimmed}”. Vamos começar por aqui.`
    : "Vamos começar por um passo pequeno e possível.";

  return {
    summary,
    title: bp.habitTitle,
    window: bp.windowLabel,
    normalDays: bp.standard,
    hardDays: bp.minimum,
    missedDay: "Não compense. Apenas volte no próximo.",
  };
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

/**
 * Payload do primeiro hábito, pronto para `POST /v1/habits`.
 * `todayWeekday` vem da data local devolvida pela API — ver
 * `weekdayFromApiDate`.
 */
export function buildStarterHabit(
  area: AreaId | null,
  todayWeekday: number,
  areaId?: string,
): CreateHabitInput {
  const bp = blueprintFor(area);
  const days = scheduleDays(bp.weeklyTarget, todayWeekday);

  return {
    title: bp.habitTitle,
    areaId,
    frequency: "WEEKLY",
    weeklyTarget: bp.weeklyTarget,
    xpBase: bp.xpBase,
    difficulty: bp.difficulty,
    schedules: days.map((dayOfWeek) => ({
      dayOfWeek,
      startMinute: bp.startMinute,
      endMinute: Math.min(bp.startMinute + 120, 23 * 60 + 59),
    })),
    variants: [
      { type: "MINIMUM", title: bp.minimum, xpMultiplier: 0.5 },
      { type: "STANDARD", title: bp.standard, xpMultiplier: 1 },
    ],
  };
}
