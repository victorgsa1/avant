const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** "2026-10" → "Outubro". */
export function monthName(month: string): string {
  return MONTH_NAMES[Number(month.slice(5, 7)) - 1] ?? "";
}

/** "2026-10" → "Out". */
export function monthShort(month: string): string {
  return monthName(month).slice(0, 3);
}

/** "2026-10-18" → "18 out". */
export function shortDate(iso: string): string {
  return `${Number(iso.slice(8, 10))} ${monthShort(iso.slice(0, 7)).toLowerCase()}`;
}

/**
 * Sessões por semana para ler, não para auditar: inteiro a partir de 1,
 * uma casa abaixo disso ("0,5"), para meia sessão não virar "1".
 */
export function formatRate(value: number): string {
  if (value >= 1) return String(Math.round(value));
  if (value > 0) return value.toFixed(1).replace(".", ",");
  return "0";
}

export function sessions(value: string): string {
  return value === "1" ? "sessão" : "sessões";
}

/** Dias entre duas datas locais, contando as duas pontas. */
export function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}
