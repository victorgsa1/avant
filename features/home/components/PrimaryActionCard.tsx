import { Image, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { CameraIcon, ClockIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ActionVariantType } from "@/services/http/types";
import { artFor } from "../activityAssets";

export type PrimaryVariantOption = {
  type: ActionVariantType;
  title: string;
  minutes: number | null;
};

type PrimaryActionCardProps = {
  /** "18h30" — quando o dia reservou o compromisso. */
  timeLabel: string | null;
  title: string;
  /** Chave do desenho, escolhida quando o plano nasceu. */
  iconKey: string | null;
  /** "20 minutos · Depois do trabalho". */
  detail: string | null;
  variants: PrimaryVariantOption[];
  selectedType: ActionVariantType | null;
  onSelectVariant: (type: ActionVariantType) => void;
  onComplete: () => void;
  onAdjust: () => void;
};

function variantLabel(variant: PrimaryVariantOption): string {
  if (variant.minutes === null) return variant.title;
  // O mínimo se anuncia como mínimo: é a saída honesta do dia apertado.
  return variant.type === "MINIMUM" ? `Mínimo · ${variant.minutes} min` : `${variant.minutes} min`;
}

/**
 * O compromisso do dia, numa folha clara que não vira com o tema — é o único
 * card da Hoje com esse peso, e é de propósito: um dia, uma principal.
 */
export function PrimaryActionCard({
  timeLabel,
  title,
  iconKey,
  detail,
  variants,
  selectedType,
  onSelectVariant,
  onComplete,
  onAdjust,
}: PrimaryActionCardProps) {
  const { colors } = useTheme();
  const art = artFor(iconKey, title);

  return (
    <View className="px-5" style={{ marginTop: 24 }}>
      <View
        className="overflow-hidden rounded-[30px]"
        style={{ backgroundColor: colors.paper, padding: 22 }}
      >
        {/* pointerEvents fica no View: a Image do RN não aceita o prop, e sem
            ele o desenho engoliria toques na metade de cima do card. */}
        {art.kind === "illustration" ? (
          <View
            pointerEvents="none"
            style={{ position: "absolute", right: 8, top: 46, width: 148, height: 138 }}
          >
            <Image source={art.source} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </View>
        ) : (
          <View pointerEvents="none" style={{ position: "absolute", right: 30, top: 68, opacity: 0.45 }}>
            <art.Icon size={86} color={colors.onPaperMuted} />
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 9 }}>
            <View className="rounded-full" style={{ width: 9, height: 9, backgroundColor: colors.ember }} />
            <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.onPaper }}>
              Principal de hoje
            </AppText>
          </View>

          {timeLabel ? (
            <View className="flex-row items-center" style={{ gap: 7 }}>
              <ClockIcon size={15} color={colors.onPaperMuted} />
              <AppText family="manrope" weight="bold" style={{ fontSize: 13.5, color: colors.onPaperMuted }}>
                {timeLabel}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Reserva a faixa da direita para o desenho: o texto quebra antes. */}
        <View style={{ marginTop: 16, paddingRight: art.kind === "illustration" ? 104 : 92 }}>
          <AppText
            family="archivo"
            weight="black"
            style={{ fontSize: 40, lineHeight: 44, letterSpacing: -1.8, color: colors.onPaper }}
          >
            {title}
          </AppText>
          {detail ? (
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ marginTop: 6, fontSize: 14.5, lineHeight: 20, color: colors.onPaperMuted }}
            >
              {detail}
            </AppText>
          ) : null}
        </View>

        {variants.length > 1 ? (
          <View
            className="flex-row rounded-full"
            style={{ marginTop: 20, backgroundColor: colors.paperSunken, padding: 4, gap: 4 }}
          >
            {variants.map((variant) => {
              const active = variant.type === selectedType;
              return (
                <Pressable
                  key={variant.type}
                  haptic="selection"
                  onPress={() => onSelectVariant(variant.type)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className="flex-1 items-center justify-center rounded-full"
                  style={{
                    paddingVertical: 13,
                    backgroundColor: active ? colors.paperRaised : "transparent",
                    borderWidth: active ? 1.4 : 0,
                    borderColor: colors.ember,
                  }}
                >
                  <AppText
                    family="manrope"
                    weight={active ? "extraBold" : "semiBold"}
                    numberOfLines={1}
                    style={{ fontSize: 14, color: active ? colors.onPaper : colors.onPaperMuted }}
                  >
                    {variantLabel(variant)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={onComplete}
          className="flex-row items-center justify-center rounded-full"
          style={{ marginTop: 14, gap: 12, height: 58, backgroundColor: colors.ember }}
        >
          <CameraIcon size={21} color={colors.onEmber} />
          <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, color: colors.onEmber }}>
            Concluir com foto
          </AppText>
        </Pressable>

        <Pressable onPress={onAdjust} className="items-center" style={{ paddingTop: 16, paddingBottom: 2 }}>
          <AppText
            family="manrope"
            weight="semiBold"
            style={{ fontSize: 13.5, color: colors.onPaperMuted, textDecorationLine: "underline" }}
          >
            Ajustar horário
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
