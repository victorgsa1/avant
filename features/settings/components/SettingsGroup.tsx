import {
  Children,
  Fragment,
  isValidElement,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Switch, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { CheckmarkIcon, ChevronIcon, MinusIcon, PlusLineIcon } from "@/components/ui/icons";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { tapHaptic } from "@/services/native/haptics";

/** Qualquer ícone do app: todos aceitam `size` e `color`. */
export type SettingsIcon = ComponentType<{ size?: number; color?: string }>;

type Tone = "default" | "danger";

/** A cor dos ícones das linhas: laranja, mais claro no escuro. */
function useIconColor(tone: Tone) {
  const { colors } = useTheme();
  return tone === "danger" ? colors.danger : colors.emberInk;
}

// ─── Grupo ──────────────────────────────────────────────────────────────────

type SettingsGroupProps = {
  title?: string;
  /** Uma linha abaixo do título, antes do cartão. */
  description?: string;
  /** Nota em letra pequena embaixo do cartão. */
  footer?: string;
  tone?: Tone;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Seção do Perfil e das telas de ajustes: título grande em cima e as linhas
 * dentro de um cartão. O divisor entre as linhas é colocado aqui — quem usa
 * só empilha os itens (sem Fragment, que contaria como um item só).
 */
export function SettingsGroup({ title, description, footer, tone = "default", children, style }: SettingsGroupProps) {
  const { colors } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View style={[{ marginTop: title ? 30 : 18 }, style]}>
      {title ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <AppText
            family="archivo"
            weight="black"
            accessibilityRole="header"
            style={{ fontSize: 22, letterSpacing: -0.6, color: tone === "danger" ? colors.danger : colors.text }}
          >
            {title}
          </AppText>
          {description ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ marginTop: 4, fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}
            >
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: tone === "danger" ? `${colors.danger}55` : colors.line,
          overflow: "hidden",
        }}
      >
        {items.map((item, index) => (
          <Fragment key={item.key ?? index}>
            {index > 0 ? (
              <View style={{ height: 1, marginHorizontal: 16, backgroundColor: colors.line }} />
            ) : null}
            {item}
          </Fragment>
        ))}
      </View>

      {footer ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 10, paddingHorizontal: 22, fontSize: 12.5, lineHeight: 18, color: colors.textFaint }}
        >
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

/** Conteúdo livre dentro do cartão (formulário, texto, botões). */
export function SettingsBlock({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ padding: 16, gap: 14 }, style]}>{children}</View>;
}

// ─── Linha ──────────────────────────────────────────────────────────────────

type SettingsItemProps = {
  icon?: SettingsIcon;
  /** No lugar do ícone: avatar, ilustração. */
  leading?: ReactNode;
  title: string;
  subtitle?: string | null;
  /** Texto curto à direita, antes do chevron ("Escuro", "19:00"). */
  value?: string | null;
  /** Substitui o chevron (switch, botão, marcador). */
  right?: ReactNode;
  onPress?: () => void;
  tone?: Tone;
  disabled?: boolean;
  /** Padrão: aparece quando a linha leva a algum lugar. */
  chevron?: boolean;
  haptic?: "light" | "selection" | "medium";
  accessibilityRole?: "button" | "radio" | "switch";
  accessibilityState?: { checked?: boolean; selected?: boolean; disabled?: boolean };
  accessibilityLabel?: string;
  children?: ReactNode;
};

/**
 * A linha do Perfil: ícone laranja, título e uma linha de apoio, chevron.
 * `children` entra embaixo do texto (botões de uma linha só, como em hábitos).
 */
export function SettingsItem({
  icon: Icon,
  leading,
  title,
  subtitle,
  value,
  right,
  onPress,
  tone = "default",
  disabled = false,
  chevron,
  haptic = "light",
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  children,
}: SettingsItemProps) {
  const { colors } = useTheme();
  const iconColor = useIconColor(tone);
  // O NativeWind descarta `style` em forma de função no Pressable, então o
  // "pressionado" vem de estado.
  const [pressed, setPressed] = useState(false);
  const interactive = Boolean(onPress) && !disabled;
  const showChevron = chevron ?? (Boolean(onPress) && !right && tone !== "danger");

  return (
    <Pressable
      onPress={interactive ? onPress : undefined}
      onPressIn={interactive ? () => setPressed(true) : undefined}
      onPressOut={() => setPressed(false)}
      disabled={!interactive}
      haptic={haptic}
      accessibilityRole={accessibilityRole ?? (onPress ? "button" : undefined)}
      accessibilityState={{ disabled, ...accessibilityState }}
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        minHeight: 66,
        paddingVertical: 14,
        paddingLeft: 18,
        paddingRight: 16,
        opacity: disabled ? 0.45 : 1,
        backgroundColor: pressed ? colors.surfaceRaised : "transparent",
      }}
    >
      {leading ??
        (Icon ? (
          <View style={{ width: 30, alignItems: "center" }}>
            <Icon size={27} color={iconColor} />
          </View>
        ) : null)}

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          family="archivo"
          weight="bold"
          style={{ fontSize: 16, letterSpacing: -0.2, color: tone === "danger" ? colors.danger : colors.text }}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 3, fontSize: 13.5, lineHeight: 18.5, color: colors.textMuted }}
          >
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </View>

      {value ? (
        <AppText
          family="manrope"
          weight="medium"
          numberOfLines={1}
          style={{ maxWidth: 150, fontSize: 14.5, color: colors.textMuted }}
        >
          {value}
        </AppText>
      ) : null}

      {right}
      {showChevron ? <ChevronIcon size={14} color={colors.text} /> : null}
    </Pressable>
  );
}

// ─── Variações da linha ─────────────────────────────────────────────────────

type SettingsSwitchProps = {
  icon?: SettingsIcon;
  title: string;
  subtitle?: string | null;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

/** Liga/desliga: a linha inteira alterna, não só o switch. */
export function SettingsSwitch({ icon, title, subtitle, value, onChange, disabled = false }: SettingsSwitchProps) {
  const { colors } = useTheme();
  return (
    <SettingsItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      disabled={disabled}
      haptic="selection"
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      right={
        <Switch
          value={value}
          disabled={disabled}
          onValueChange={(next) => {
            tapHaptic("selection");
            onChange(next);
          }}
          trackColor={{ false: colors.lineStrong, true: colors.ember }}
          thumbColor={colors.onEmber}
          ios_backgroundColor={colors.lineStrong}
        />
      }
    />
  );
}

/** Marcador de escolha única: círculo vazio ou laranja com check. */
function RadioMark({ selected }: { selected: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: 24,
        height: 24,
        backgroundColor: selected ? colors.ember : "transparent",
        borderWidth: selected ? 0 : 1.6,
        borderColor: colors.lineStrong,
      }}
    >
      {selected ? <CheckmarkIcon size={12} color={colors.onEmber} /> : null}
    </View>
  );
}

type SettingsOptionProps = {
  icon?: SettingsIcon;
  title: string;
  subtitle?: string | null;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

/** Uma opção de uma lista de escolha única, com explicação embaixo. */
export function SettingsOption({ icon, title, subtitle, selected, onSelect, disabled }: SettingsOptionProps) {
  return (
    <SettingsItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      disabled={disabled}
      haptic="selection"
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onSelect}
      right={<RadioMark selected={selected} />}
    />
  );
}

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  /** Linha pequena acima das opções. */
  label?: string;
  disabled?: boolean;
};

/** Poucas opções curtas lado a lado (período do dia, abas de estado). */
export function SettingsSegmented<T extends string>({ options, value, onChange, label, disabled }: SegmentedProps<T>) {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 12, gap: 10, opacity: disabled ? 0.45 : 1 }}>
      {label ? (
        <AppText
          family="manrope"
          weight="semiBold"
          style={{ paddingHorizontal: 6, fontSize: 13, color: colors.textMuted }}
        >
          {label}
        </AppText>
      ) : null}
      <View
        accessibilityRole="radiogroup"
        className="flex-row"
        style={{ padding: 4, gap: 4, borderRadius: 16, backgroundColor: colors.bg }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              disabled={disabled || active}
              haptic="selection"
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              className="flex-1 items-center justify-center rounded-xl"
              style={{ minHeight: 40, paddingHorizontal: 6, backgroundColor: active ? colors.ember : "transparent" }}
            >
              <AppText
                family="archivo"
                weight="bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ fontSize: 13.5, color: active ? colors.onEmber : colors.textMuted }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StepButton({
  kind,
  onPress,
  disabled,
  label,
}: {
  kind: "minus" | "plus";
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  const { colors } = useTheme();
  const Icon = kind === "minus" ? MinusIcon : PlusLineIcon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center justify-center rounded-full"
      style={{ width: 34, height: 34, backgroundColor: colors.surfaceSunken, opacity: disabled ? 0.4 : 1 }}
    >
      <Icon size={18} color={colors.text} />
    </Pressable>
  );
}

type SettingsStepperProps = {
  icon?: SettingsIcon;
  title: string;
  subtitle?: string | null;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement?: boolean;
  canIncrement?: boolean;
  disabled?: boolean;
};

/** Valor com menos/mais (horário em meia em meia hora, limite por dia). */
export function SettingsStepper({
  icon,
  title,
  subtitle,
  value,
  onDecrement,
  onIncrement,
  canDecrement = true,
  canIncrement = true,
  disabled = false,
}: SettingsStepperProps) {
  const { colors } = useTheme();
  return (
    <SettingsItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      disabled={disabled}
      right={
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <StepButton
            kind="minus"
            label={`Diminuir ${title.toLowerCase()}`}
            onPress={onDecrement}
            disabled={disabled || !canDecrement}
          />
          <AppText
            family="archivo"
            weight="bold"
            accessibilityLiveRegion="polite"
            style={{ minWidth: 52, textAlign: "center", fontSize: 16, color: colors.text }}
          >
            {value}
          </AppText>
          <StepButton
            kind="plus"
            label={`Aumentar ${title.toLowerCase()}`}
            onPress={onIncrement}
            disabled={disabled || !canIncrement}
          />
        </View>
      }
    />
  );
}

// ─── Peças soltas ───────────────────────────────────────────────────────────

type SettingsPillProps = {
  label: string;
  onPress: () => void;
  tone?: "neutral" | "accent" | "danger";
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Botão pequeno dentro de uma linha (Pausar, Desbloquear, Encerrar). */
export function SettingsPill({ label, onPress, tone = "neutral", disabled, accessibilityLabel }: SettingsPillProps) {
  const { colors } = useTheme();
  const color = tone === "accent" ? colors.emberInk : tone === "danger" ? colors.danger : colors.text;
  const border = tone === "accent" ? colors.ember : tone === "danger" ? `${colors.danger}66` : colors.lineStrong;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center rounded-full"
      style={{ height: 34, paddingHorizontal: 15, borderWidth: 1.3, borderColor: border, opacity: disabled ? 0.45 : 1 }}
    >
      <AppText family="archivo" weight="bold" style={{ fontSize: 13.5, color }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Erro ou confirmação logo abaixo de um grupo. */
export function SettingsMessage({ message, tone = "danger" }: { message?: string | null; tone?: "danger" | "success" }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <AppText
      family="manrope"
      weight="semiBold"
      accessibilityLiveRegion="polite"
      style={{
        marginTop: 12,
        paddingHorizontal: 22,
        fontSize: 13,
        lineHeight: 18,
        color: tone === "danger" ? colors.danger : colors.success,
      }}
    >
      {message}
    </AppText>
  );
}

/** Parágrafo de contexto logo abaixo do título da tela. */
export function SettingsLead({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <AppText
      family="manrope"
      weight="medium"
      style={{ marginTop: 14, paddingHorizontal: 20, fontSize: 14.5, lineHeight: 21, color: colors.textMuted }}
    >
      {children}
    </AppText>
  );
}
