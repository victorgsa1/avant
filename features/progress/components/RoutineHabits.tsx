import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { ChevronIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { taskIconFor } from "@/features/home/activityAssets";
import { formatRate } from "../format";
import type { RoutineHabit } from "../types";
import { SectionTitle } from "./SectionTitle";

function Bar({ label, value, max, color, strong }: { label: string; value: number; max: number; color: string; strong?: boolean }) {
  const { colors } = useTheme();
  // Um traço mínimo: barra de zero some e parece erro de desenho.
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <View className="flex-row items-center" style={{ gap: 12 }}>
      <AppText family="manrope" weight="medium" style={{ width: 30, fontSize: 11.5, color: colors.onPaperMuted }}>
        {label}
      </AppText>
      <View style={{ flex: 1 }}>
        <View className="rounded-full" style={{ width: `${pct}%`, height: 8, backgroundColor: color }} />
      </View>
      <AppText
        family="archivo"
        weight={strong ? "extraBold" : "medium"}
        style={{ minWidth: 22, textAlign: "right", fontSize: 12.5, color: strong ? colors.onPaper : colors.onPaperMuted }}
      >
        {formatRate(value)}
      </AppText>
    </View>
  );
}

function HabitRow({ habit, open, onToggle }: { habit: RoutineHabit; open: boolean; onToggle: () => void }) {
  const { colors } = useTheme();
  const Icon = taskIconFor(habit.iconKey, habit.title);

  if (open) {
    const max = habit.bars ? Math.max(habit.bars.previous, habit.bars.current) : 0;
    return (
      <Pressable
        onPress={onToggle}
        haptic="selection"
        accessibilityRole="button"
        accessibilityState={{ expanded: true }}
        className="rounded-[24px]"
        style={{ backgroundColor: colors.paper, padding: 18 }}
      >
        <View className="flex-row items-center" style={{ gap: 14 }}>
          <View
            className="items-center justify-center"
            // O cartão é papel nos dois temas: o fundo do ícone também.
            style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.paperSunken }}
          >
            <Icon size={24} color={colors.ember} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText family="archivo" weight="extraBold" style={{ fontSize: 18, letterSpacing: -0.3, color: colors.onPaper }}>
              {habit.title}
            </AppText>
            <AppText family="manrope" weight="medium" style={{ marginTop: 3, fontSize: 13, color: colors.onPaperMuted }}>
              {habit.subtitle}
            </AppText>
          </View>
        </View>

        {habit.bars ? (
          <View style={{ marginTop: 16, gap: 9 }}>
            <Bar label={habit.bars.previousLabel} value={habit.bars.previous} max={max} color={colors.paperSunken} />
            <Bar label={habit.bars.currentLabel} value={habit.bars.current} max={max} color={colors.ember} strong />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onToggle}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ expanded: false }}
      className="flex-row items-center rounded-[22px]"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 14 }}
    >
      <View
        className="items-center justify-center"
        style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surfaceSunken }}
      >
        <Icon size={22} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText family="archivo" weight="extraBold" style={{ fontSize: 16.5, letterSpacing: -0.2, color: colors.text }}>
          {habit.title}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ marginTop: 2, fontSize: 12.5, color: colors.textMuted }}>
          {habit.subtitle}
        </AppText>
      </View>
      <ChevronIcon size={12} color={colors.textMuted} />
    </Pressable>
  );
}

type RoutineHabitsProps = {
  habits: RoutineHabit[];
  onSeeAll: () => void;
};

/** Como cada hábito andou no mês, contra o mês anterior. Um aberto por vez. */
export function RoutineHabits({ habits, onSeeAll }: RoutineHabitsProps) {
  const { colors } = useTheme();
  const [openId, setOpenId] = useState<string | null>(habits[0]?.id ?? null);

  return (
    <View className="px-5" style={{ marginTop: 36 }}>
      <View style={{ paddingHorizontal: 2 }}>
        <SectionTitle
          title="Na sua rotina"
          right={
            <Pressable onPress={onSeeAll} hitSlop={10} accessibilityRole="link">
              <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.emberInk }}>
                Ver tudo ›
              </AppText>
            </Pressable>
          }
        />
      </View>

      {habits.length === 0 ? (
        <AppText family="manrope" weight="medium" style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>
          Nenhum hábito ativo agora.
        </AppText>
      ) : (
        <View style={{ gap: 12 }}>
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              open={openId === habit.id}
              onToggle={() => setOpenId((current) => (current === habit.id ? null : habit.id))}
            />
          ))}
        </View>
      )}
    </View>
  );
}
