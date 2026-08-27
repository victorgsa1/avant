import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

type StepHeaderProps = {
  /** How many of the 5 segments are fully filled. */
  filled: number;
  /** Marks segment `partial` (1-indexed) as half-filled — the "1b" sub-step. */
  partial?: number;
  onBack?: () => void;
};

const TOTAL_SEGMENTS = 5;

export function StepHeader({ filled, partial, onBack }: StepHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row items-center gap-4 px-6" style={{ paddingTop: insets.top + 14 }}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        className="items-center justify-center rounded-full"
        style={{ width: 36, height: 36, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}
      >
        <ChevronLeftIcon />
      </Pressable>

      <View className="flex-1 flex-row" style={{ gap: 5 }}>
        {Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
          const step = index + 1;
          const isFilled = step <= filled;
          const isPartial = step === partial;
          return (
            <View
              key={step}
              className="flex-1 overflow-hidden rounded-full"
              style={{ height: 4, backgroundColor: isFilled ? colors.ember : colors.trackIdle }}
            >
              {isPartial ? (
                <View style={{ width: "55%", height: "100%", backgroundColor: colors.ember }} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
