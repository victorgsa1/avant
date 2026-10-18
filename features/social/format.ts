import type { CompetitionResponse } from "@/services/http/types";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * "8–14 set" / "29 ago–4 set". As datas do servidor são dias de calendário
 * gravados como meia-noite UTC — lidas no fuso do aparelho, cairiam no dia
 * anterior em todo o Brasil. Por isso UTC.
 */
export function weekRangeLabel(startIso: string | null, endIso: string | null): string | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  const endLabel = `${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]}`;
  if (start.getUTCMonth() === end.getUTCMonth()) return `${start.getUTCDate()}–${endLabel}`;
  return `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}–${endLabel}`;
}

/** "mar de 2026". Para instantes (ex.: quando a conta foi criada), no fuso do aparelho. */
export function monthYearLabel(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "Você e 7 amigos" — quem está ativo na competição, contando você. */
export function companionsLabel(participantCount: number): string {
  const others = Math.max(participantCount - 1, 0);
  if (others === 0) return "Só você por enquanto";
  return `Você e ${plural(others, "amigo", "amigos")}`;
}

/** Quanto falta (ou quando começa), no tom da competição. */
export function timeLeftLabel(competition: CompetitionResponse): string {
  if (competition.status === "UPCOMING") {
    return competition.daysRemaining <= 1 ? "Começa amanhã" : `Começa em ${competition.daysRemaining} dias`;
  }
  if (competition.daysRemaining <= 0) return "Último dia";
  return competition.daysRemaining === 1 ? "Falta 1 dia" : `Faltam ${competition.daysRemaining} dias`;
}

/** O resultado de uma competição encerrada, do ponto de vista de quem lê. */
export function resultLabel(competition: CompetitionResponse): string {
  if (competition.status === "CANCELLED") return "Cancelada";
  if (!competition.myPosition) return "Sem participação";
  if (competition.myPosition === 1) return `Você venceu · ${Math.round(competition.myScore)}%`;
  const winner = competition.standings[0];
  return `${competition.myPosition}º lugar · ${winner ? `${firstName(winner.name)} venceu` : "encerrada"}`;
}
