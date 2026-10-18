import { useMemo, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { shortDate } from "../format";
import type { CalendarDay, CalendarDayState } from "../types";
import { OptionSheet } from "./OptionSheet";
import { SectionTitle } from "./SectionTitle";

/** Segunda primeiro, como o design. */
const WEEKDAYS = ["S", "T", "Q", "Q", "S", "S", "D"];
const ALL = "all";

const STATE_TEXT: Record<CalendarDayState, string> = {
  done: "feita",
  minimum: "na versão mínima",
  missed: "não aconteceu",
  pending: "planejada",
};

/** O estado do dia para o filtro: feita vence mínima, que vence o resto. */
function stateOf(entries: CalendarDay["entries"]): CalendarDayState | null {
  if (entries.length === 0) return null;
  if (entries.some((entry) => entry.state === "done")) return "done";
  if (entries.some((entry) => entry.state === "minimum")) return "minimum";
  if (entries.some((entry) => entry.state === "pending")) return "pending";
  return "missed";
}

function monthGrid(month: string): (string | null)[][] {
  const [year, monthIndex] = month.split("-").map(Number);
  const days = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const offset = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: days }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

type HistoryCalendarProps = {
  month: string;
  monthName: string;
  today: string;
  calendar: CalendarDay[];
  /** O hábito filtrado ao abrir; a principal, quando ela aparece no mês. */
  defaultHabitId: string | null;
};

export function HistoryCalendar({ month, monthName, today, calendar, defaultHabitId }: HistoryCalendarProps) {
  const { colors } = useTheme();

  const habits = useMemo(() => {
    const seen = new Map<string, string>();
    for (const day of calendar) for (const entry of day.entries) seen.set(entry.habitId, entry.title);
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [calendar]);

  const [filter, setFilter] = useState(() =>
    defaultHabitId && habits.some((habit) => habit.value === defaultHabitId) ? defaultHabitId : ALL,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarDay["entries"]>();
    for (const day of calendar) {
      map.set(day.date, filter === ALL ? day.entries : day.entries.filter((entry) => entry.habitId === filter));
    }
    return map;
  }, [calendar, filter]);

  const filterLabel = filter === ALL ? "Todos" : (habits.find((habit) => habit.value === filter)?.label ?? "Todos");
  const selectedEntries = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <View className="px-5" style={{ marginTop: 36 }}>
      <View style={{ paddingHorizontal: 2 }}>
        <SectionTitle title="Seu histórico" />
      </View>

      <View
        className="rounded-[24px]"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 18 }}
      >
        <View className="flex-row items-center justify-between" style={{ marginBottom: 14 }}>
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, color: colors.text }}>
            {monthName}
          </AppText>
          {habits.length > 0 ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              haptic="selection"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por hábito: ${filterLabel}`}
              className="flex-row items-center"
              style={{ gap: 6 }}
            >
              <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.textMuted }}>
                {filterLabel}
              </AppText>
              <ChevronIcon direction="down" size={9} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View className="flex-row">
          {WEEKDAYS.map((label, index) => (
            <AppText
              key={`${label}-${index}`}
              family="manrope"
              weight="semiBold"
              style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: colors.textFaint }}
            >
              {label}
            </AppText>
          ))}
        </View>

        <View style={{ marginTop: 8, gap: 2 }}>
          {monthGrid(month).map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row">
              {row.map((date, cellIndex) => {
                if (!date) return <View key={`empty-${cellIndex}`} style={{ flex: 1, height: 38 }} />;

                const state = stateOf(byDate.get(date) ?? []);
                const isToday = date === today;
                const isSelected = date === selected;
                const filled = state === "done";
                const ringed = state === "minimum";

                return (
                  <Pressable
                    key={date}
                    onPress={() => setSelected((current) => (current === date ? null : date))}
                    haptic="selection"
                    accessibilityRole="button"
                    accessibilityLabel={`${shortDate(date)}${state ? `, ${STATE_TEXT[state]}` : ""}`}
                    style={{ flex: 1, height: 38, alignItems: "center", justifyContent: "center" }}
                  >
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: filled ? colors.ember : isSelected ? colors.surfaceSunken : "transparent",
                        borderWidth: ringed ? 1.5 : 0,
                        borderColor: colors.textMuted,
                      }}
                    >
                      <AppText
                        family="manrope"
                        weight={filled || isToday ? "extraBold" : "medium"}
                        style={{
                          fontSize: 12.5,
                          color: filled
                            ? colors.onEmber
                            : ringed
                              ? colors.text
                              : isToday
                                ? colors.emberInk
                                : colors.textMuted,
                        }}
                      >
                        {Number(date.slice(8, 10))}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap items-center" style={{ marginTop: 14, columnGap: 16, rowGap: 6 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <View className="rounded-full" style={{ width: 9, height: 9, backgroundColor: colors.ember }} />
            <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textMuted }}>
              Realizada
            </AppText>
          </View>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <View
              className="rounded-full"
              style={{ width: 9, height: 9, borderWidth: 1.3, borderColor: colors.textMuted }}
            />
            <AppText family="manrope" weight="medium" style={{ fontSize: 11.5, color: colors.textMuted }}>
              Versão mínima
            </AppText>
          </View>
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginLeft: "auto", fontSize: 11.5, color: colors.textFaint }}
          >
            Toque no dia
          </AppText>
        </View>

        {selected ? (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
            <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, lineHeight: 19, color: colors.text }}>
              {shortDate(selected)}
              <AppText family="manrope" weight="medium" style={{ color: colors.textMuted }}>
                {" · "}
                {selectedEntries.length > 0
                  ? selectedEntries.map((entry) => `${entry.title} ${STATE_TEXT[entry.state]}`).join(" · ")
                  : "nada planejado"}
              </AppText>
            </AppText>
          </View>
        ) : null}
      </View>

      <OptionSheet
        visible={pickerOpen}
        title="Mostrar no calendário"
        options={[{ value: ALL, label: "Todos os hábitos" }, ...habits]}
        selected={filter}
        onSelect={setFilter}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}
