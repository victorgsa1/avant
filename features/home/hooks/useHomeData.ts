import { useCallback, useMemo, useState } from "react";
import type { RankingEntry, Task } from "../types";

// Ported 1:1 from the design's own local-state logic (`DCLogic`), which is
// the only data source for this screen for now (frontend-first pass, no
// backend wiring yet). Swapping in real data later only touches this file.
const BASE_XP = 1215;
const XP_GOAL = 2000;
const RIVAL_XP = 1280;
const LEVEL = 12;
const NEXT_LEVEL = 13;
const STREAK_DAYS = 8;

const INITIAL_TASKS: Task[] = [
  { id: 1, label: "Beber água", xp: 10, done: true },
  { id: 2, label: "Ler 10 páginas", xp: 15, done: true },
  { id: 3, label: "Treino", xp: 30, done: false },
  { id: 4, label: "Estudar", xp: 20, done: false },
];

const RANKING: RankingEntry[] = [
  { rank: 1, name: "Lucas", initial: "L", xp: 1280 },
  { rank: 2, name: "Você", initial: "G", xp: 0, isCurrentUser: true },
  { rank: 3, name: "Matheus", initial: "M", xp: 1190 },
];

export function useHomeData() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggleTask = useCallback((id: number) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }, []);

  return useMemo(() => {
    const doneCount = tasks.filter((task) => task.done).length;
    const earned = tasks.filter((task) => task.done).reduce((sum, task) => sum + task.xp, 0);
    const currentXP = BASE_XP + earned;
    const progress = Math.min(1, currentXP / XP_GOAL);
    const remainingXP = Math.max(0, XP_GOAL - currentXP);
    const gapXP = Math.max(0, RIVAL_XP - currentXP);
    const ranking = RANKING.map((entry) => (entry.isCurrentUser ? { ...entry, xp: currentXP } : entry));

    return {
      level: LEVEL,
      nextLevel: NEXT_LEVEL,
      streakDays: STREAK_DAYS,
      tasks,
      toggleTask,
      doneCount,
      totalTasks: tasks.length,
      currentXP,
      remainingXP,
      progress,
      gapXP,
      ranking,
    };
  }, [tasks, toggleTask]);
}
