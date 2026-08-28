import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Task } from "../types";

function TaskCheckbox({ done }: { done: boolean }) {
  const { colors } = useTheme();
  if (done) {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 26, height: 26, backgroundColor: colors.ember }}
      >
        <CheckmarkIcon color={colors.onEmber} />
      </View>
    );
  }
  return <View className="rounded-full" style={{ width: 22, height: 22, borderWidth: 1.3, borderColor: colors.lineStrong }} />;
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      disabled={task.done || task.pending}
      className="flex-row items-center gap-4"
      style={{
        paddingVertical: 17,
        opacity: task.pending ? 0.55 : 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <TaskCheckbox done={task.done} />
      <AppText
        family="archivo"
        weight="bold"
        style={{ flex: 1, fontSize: 16, letterSpacing: -0.3, color: task.done ? colors.textMuted : colors.text }}
      >
        {task.label}
      </AppText>
      <AppText family="manrope" weight="bold" style={{ fontSize: 12.5, color: task.done ? colors.ember : colors.textFaint }}>
        +{task.xp} xp
      </AppText>
    </Pressable>
  );
}

type TodayTaskListProps = {
  tasks: Task[];
  doneCount: number;
  totalTasks: number;
  onToggle: (id: string) => void;
};

export function TodayTaskList({ tasks, doneCount, totalTasks, onToggle }: TodayTaskListProps) {
  const { colors } = useTheme();
  return (
    <View className="px-6 pt-[38px]">
      <View className="flex-row items-center justify-between">
        <AppText family="archivo" weight="black" style={{ fontSize: 20, letterSpacing: -0.6, color: colors.text }}>
          Hoje
        </AppText>
        <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.textMuted }}>
          <AppText family="archivo" weight="black" style={{ fontSize: 16, color: colors.ember }}>
            {doneCount}
          </AppText>{" "}
          de {totalTasks}
        </AppText>
      </View>

      <View className="mt-3 flex-row gap-1.5">
        {tasks.map((task) => (
          <View
            key={task.id}
            className="rounded-full"
            style={{ flex: 1, height: 5, backgroundColor: task.done ? colors.ember : colors.arcLight }}
          />
        ))}
      </View>

      <View className="mt-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} />
        ))}
      </View>
    </View>
  );
}
