import { View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { taskIconFor } from "../activityAssets";
import type { Task } from "../types";

function TaskRow({
  task,
  onToggle,
  onSkip,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onSkip?: (id: string) => void;
}) {
  const { colors } = useTheme();
  const Icon = taskIconFor(task.iconKey, task.label);

  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      // Toque longo abre a saída do dia ruim: pular sem culpa e sem apagar o
      // histórico. Fica escondido de propósito — concluir continua sendo a ação.
      onLongPress={onSkip ? () => onSkip(task.id) : undefined}
      delayLongPress={350}
      disabled={task.done || task.pending}
      className="flex-row items-center"
      style={{
        gap: 14,
        paddingVertical: 16,
        opacity: task.pending ? 0.55 : 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      {task.done ? (
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 26, height: 26, backgroundColor: colors.ember }}
        >
          <CheckmarkIcon size={12} color={colors.onEmber} />
        </View>
      ) : (
        <View
          className="rounded-full"
          style={{ width: 26, height: 26, borderWidth: 1.5, borderColor: colors.lineStrong }}
        />
      )}

      <Icon size={22} color={task.done ? colors.textFaint : colors.text} />

      <AppText
        family="archivo"
        weight="bold"
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 16.5,
          letterSpacing: -0.3,
          color: task.done ? colors.textMuted : colors.text,
          textDecorationLine: task.done ? "line-through" : "none",
        }}
      >
        {task.label}
      </AppText>

      {task.done ? null : <ChevronRightIcon width={13} color={colors.textFaint} />}
    </Pressable>
  );
}

type ComplementaryListProps = {
  tasks: Task[];
  doneCount: number;
  totalTasks: number;
  onToggle: (id: string) => void;
  onSkip?: (id: string) => void;
};

/** As complementares: organizam o dia, não competem com o compromisso. */
export function ComplementaryList({
  tasks,
  doneCount,
  totalTasks,
  onToggle,
  onSkip,
}: ComplementaryListProps) {
  const { colors } = useTheme();

  return (
    <View className="px-6" style={{ paddingTop: 34 }}>
      <View className="flex-row items-center justify-between">
        <View>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 22, letterSpacing: -0.7, color: colors.text }}
          >
            Complementares
          </AppText>
          <AppText family="manrope" weight="medium" style={{ marginTop: 1, fontSize: 13, color: colors.textMuted }}>
            Opcional
          </AppText>
        </View>

        <AppText family="manrope" weight="semiBold" style={{ fontSize: 13.5, color: colors.textMuted }}>
          {doneCount} de {totalTasks}
        </AppText>
      </View>

      <View style={{ marginTop: 14 }}>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onSkip={onSkip} />
        ))}
      </View>
    </View>
  );
}
