import type { ReactNode } from "react";
import { Switch, View } from "react-native";
import { tapHaptic } from "@/services/native/haptics";
import { Pressable } from "@/components/ui/Pressable";
import { AppText } from "@/components/ui/AppText";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";

/** Bloco de ajustes: título em cima, linhas dentro de um cartão. */
export function SettingsSection({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
      {title ? (
        <AppText
          family="archivo"
          weight="extraBold"
          style={{ fontSize: 13, letterSpacing: 0.2, color: colors.textMuted, paddingLeft: 4 }}
        >
          {title}
        </AppText>
      ) : null}

      <View
        className="rounded-[22px]"
        style={{
          marginTop: title ? 10 : 0,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          overflow: "hidden",
        }}
      >
        {children}
      </View>

      {footer ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 9, paddingHorizontal: 4, fontSize: 12, lineHeight: 18, color: colors.textFaint }}
        >
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  value?: string | null;
  description?: string | null;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  last?: boolean;
  right?: ReactNode;
};

export function SettingsRow({
  label,
  value,
  description,
  onPress,
  destructive = false,
  disabled = false,
  last = false,
  right,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const color = destructive ? colors.danger : colors.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      className="flex-row items-center"
      style={{
        gap: 12,
        paddingVertical: 15,
        paddingHorizontal: 17,
        opacity: disabled ? 0.5 : 1,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, color }}>
          {label}
        </AppText>
        {description ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 3, fontSize: 12, lineHeight: 17, color: colors.textFaint }}
          >
            {description}
          </AppText>
        ) : null}
      </View>

      {value ? (
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 13, color: colors.textMuted }}>
          {value}
        </AppText>
      ) : null}

      {right ?? (onPress && !destructive ? <ChevronRightIcon color={colors.textFaint} /> : null)}
    </Pressable>
  );
}

export function SettingsToggle({
  label,
  description,
  value,
  onChange,
  disabled = false,
  last = false,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <SettingsRow
      label={label}
      description={description}
      last={last}
      disabled={disabled}
      right={
        <Switch
          value={value}
          onValueChange={(next) => {
            tapHaptic("selection");
            onChange(next);
          }}
          disabled={disabled}
          trackColor={{ false: colors.lineStrong, true: colors.ember }}
          thumbColor={colors.surface}
        />
      }
    />
  );
}

/** Escolha entre poucas opções, no formato de pílulas. */
export function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-row flex-wrap" style={{ gap: 8, padding: 15 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="rounded-full"
            style={{
              paddingVertical: 9,
              paddingHorizontal: 15,
              backgroundColor: active ? colors.ember : colors.surfaceSunken,
              borderWidth: 1,
              borderColor: active ? colors.ember : colors.line,
            }}
          >
            <AppText
              family="archivo"
              weight="bold"
              style={{ fontSize: 13, color: active ? colors.onEmber : colors.textMuted }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
