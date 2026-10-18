import { AppText } from "@/components/ui/AppText";
import { HeartIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";

type LikeButtonProps = {
  liked: boolean;
  count: number;
  /** De quem é o resumo — vai no rótulo do leitor de tela. */
  ownerName: string;
  /** `paper`: sobre o card claro; `surface`: sobre o card do tema. */
  tone: "paper" | "surface";
  onPress: () => void;
};

export function LikeButton({ liked, count, ownerName, tone, onPress }: LikeButtonProps) {
  const { colors } = useTheme();
  const idle = tone === "paper" ? colors.onPaper : colors.text;
  const color = liked ? colors.ember : idle;

  return (
    <Pressable
      onPress={onPress}
      haptic="selection"
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={`${liked ? "Descurtir" : "Curtir"} o resumo de ${ownerName}${count > 0 ? `, ${count} curtidas` : ""}`}
      className="flex-row items-center self-start"
      style={{ gap: 10, paddingVertical: 4 }}
    >
      <HeartIcon size={22} filled={liked} color={color} />
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 15, color }}>
        {liked ? "Curtido" : "Curtir"}
        {count > 0 ? (
          <AppText family="manrope" weight="medium" style={{ color: liked ? colors.ember : tone === "paper" ? colors.onPaperMuted : colors.textMuted }}>
            {`  ·  ${count}`}
          </AppText>
        ) : null}
      </AppText>
    </Pressable>
  );
}
