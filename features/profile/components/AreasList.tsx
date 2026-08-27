import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BookIcon, ChevronRightIcon, FocusIcon, HeartIcon, PlusIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AreaKey, ProfileArea } from "../types";

const AREA_ICONS: Record<AreaKey, typeof HeartIcon> = {
  health: HeartIcon,
  focus: FocusIcon,
  reading: BookIcon,
};

function AreaRow({ area }: { area: ProfileArea }) {
  const { colors } = useTheme();
  const Icon = AREA_ICONS[area.key];
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }}
    >
      <View
        className="items-center justify-center rounded-2xl"
        style={{ width: 40, height: 40, backgroundColor: colors.emberTint }}
      >
        <Icon />
      </View>
      <View style={{ flex: 1 }}>
        <AppText family="archivo" weight="bold" style={{ fontSize: 15, letterSpacing: -0.3, color: colors.text }}>
          {area.name}
        </AppText>
        <AppText family="manrope" weight="medium" style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          {area.line}
        </AppText>
      </View>
      <ChevronRightIcon width={13} color={colors.textFaint} />
    </View>
  );
}

type AreasListProps = {
  areas: ProfileArea[];
  onPressAddArea?: () => void;
};

export function AreasList({ areas, onPressAddArea }: AreasListProps) {
  const { colors } = useTheme();
  return (
    <View className="px-6" style={{ paddingTop: 34 }}>
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
        Minhas áreas
      </AppText>
      <View style={{ marginTop: 6 }}>
        {areas.map((area) => (
          <AreaRow key={area.key} area={area} />
        ))}
        <Pressable onPress={onPressAddArea} className="flex-row items-center" style={{ gap: 8, paddingTop: 16 }}>
          <PlusIcon size={15} color={colors.ember} />
          <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.ember }}>
            Adicionar uma área
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
