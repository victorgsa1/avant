const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Meia-noite local do dia em que o instante caiu. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** As duas mensagens foram enviadas no mesmo dia, no fuso do aparelho? */
export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)).getTime() === startOfDay(new Date(b)).getTime();
}

/**
 * Rótulo do separador de dia: "Hoje", "Ontem", o dia da semana até uma
 * semana atrás e, daí em diante, a data ("12 de outubro"; com o ano só
 * quando não é o ano corrente).
 */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  // Arredondado: dia com horário de verão tem 23 ou 25 horas.
  const daysAgo = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);

  if (daysAgo === 0) return "Hoje";
  if (daysAgo === 1) return "Ontem";
  if (daysAgo > 1 && daysAgo < 7) return WEEKDAYS[date.getDay()];

  const label = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? label : `${label} de ${date.getFullYear()}`;
}
