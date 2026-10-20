import type { NotificationResponse } from "@/services/http/types";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/**
 * Dias de calendário entre o instante e agora, no fuso do aparelho.
 * `round` e não `floor`: na virada do horário de verão o dia tem 23 ou 25h.
 */
function calendarDaysAgo(date: Date, now: Date): number {
  const midnight = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((midnight(now) - midnight(date)) / 86_400_000);
}

function clock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Quando chegou, no tom da seção em que a linha aparece: relativo hoje
 * ("há 5 min"), só a hora ontem ("19:05" — o "ontem" já está no título),
 * dia da semana nesta semana e data depois disso.
 */
export function receivedAtLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const days = calendarDaysAgo(date, now);

  if (days <= 0) {
    const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
    if (minutes < 1) return "agora";
    if (minutes < 60) return `há ${minutes} min`;
    return `há ${Math.floor(minutes / 60)}h`;
  }
  if (days === 1) return clock(date);
  if (days < 7) return `${WEEKDAYS[date.getDay()]}, ${clock(date)}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export type NotificationSection = {
  key: "today" | "yesterday" | "week" | "older";
  title: string;
  items: NotificationResponse[];
};

/** Separa a caixa de entrada por dia, mantendo a ordem que veio do servidor. */
export function groupByDay(items: NotificationResponse[], now = new Date()): NotificationSection[] {
  const sections: NotificationSection[] = [
    { key: "today", title: "Hoje", items: [] },
    { key: "yesterday", title: "Ontem", items: [] },
    { key: "week", title: "Nesta semana", items: [] },
    { key: "older", title: "Anteriores", items: [] },
  ];

  for (const item of items) {
    const days = calendarDaysAgo(new Date(item.createdAt), now);
    const index = days <= 0 ? 0 : days === 1 ? 1 : days < 7 ? 2 : 3;
    sections[index].items.push(item);
  }

  return sections.filter((section) => section.items.length > 0);
}

/** "3 novas" / "Tudo lido" — o subtítulo do cabeçalho. */
export function unreadLabel(count: number): string {
  if (count === 0) return "Tudo lido";
  return count === 1 ? "1 nova" : `${count} novas`;
}
