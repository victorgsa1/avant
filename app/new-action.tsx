import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { scheduleDays, weekdayFromApiDate } from "@/features/onboarding/planBuilder";
import { areasApi, habitsApi, todayApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { AreaResponse } from "@/services/http/types";

const WEEKLY_OPTIONS = [2, 3, 4, 5, 7];

/**
 * Ação rápida do botão `+`: cria uma nova ação (hábito). Sem chatbot e sem
 * IA — a pessoa escreve o que quer fazer e escolhe a frequência.
 */
export default function NewActionScreen() {
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [areaId, setAreaId] = useState<string | undefined>(undefined);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void areasApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setAreas(list);
        setAreaId(list[0]?.id);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(async () => {
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setTitleError("Descreva a ação em pelo menos 3 caracteres.");
      return;
    }
    if (trimmed.length > 120) {
      setTitleError("Use no máximo 120 caracteres.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      // Dias espaçados a partir de hoje — a ação nova já vale para o dia
      // atual. "Hoje" é o do servidor (timezone das preferências).
      const today = await todayApi.get();
      const days = scheduleDays(weeklyTarget, weekdayFromApiDate(today.date));
      await habitsApi.create({
        title: trimmed,
        areaId,
        frequency: "WEEKLY",
        weeklyTarget,
        schedules: days.map((dayOfWeek) => ({ dayOfWeek })),
        variants: [
          { type: "MINIMUM", title: "Versão mínima do dia difícil", xpMultiplier: 0.5 },
          { type: "STANDARD", title: trimmed, xpMultiplier: 1 },
        ],
      });
      router.back();
    } catch (error) {
      setFormError(userMessage(error));
    } finally {
      setSaving(false);
    }
  }, [areaId, title, weeklyTarget]);

  return (
    <AuthShell
      title="Nova ação"
      subtitle="Uma coisa pequena que você consegue repetir. Dá para ajustar depois."
      onBack={() => router.back()}
      footer={
        <View style={{ gap: 14 }}>
          {formError ? (
            <AppText
              family="manrope"
              weight="medium"
              style={{ textAlign: "center", fontSize: 13, color: colors.danger }}
            >
              {formError}
            </AppText>
          ) : null}
          <PrimaryButton label="Criar ação" onPress={() => void submit()} loading={saving} />
        </View>
      }
    >
      <TextField
        label="O que você quer fazer?"
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          setTitleError(null);
        }}
        error={titleError}
        placeholder="Ex.: Caminhar 20 minutos"
        autoCapitalize="sentences"
      />

      <View style={{ gap: 9 }}>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.textMuted }}>
          Quantas vezes por semana?
        </AppText>
        <View className="flex-row" style={{ gap: 8 }}>
          {WEEKLY_OPTIONS.map((option) => {
            const active = option === weeklyTarget;
            return (
              <Pressable
                key={option}
                onPress={() => setWeeklyTarget(option)}
                className="items-center justify-center rounded-2xl"
                style={{
                  flex: 1,
                  height: 48,
                  backgroundColor: active ? colors.emberTint : colors.surface,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? colors.ember : colors.line,
                }}
              >
                <AppText
                  family="archivo"
                  weight="extraBold"
                  style={{ fontSize: 15, color: active ? colors.emberDeep : colors.textMuted }}
                >
                  {option}x
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {areas.length > 0 ? (
        <View style={{ gap: 9 }}>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.textMuted }}>
            Em qual área?
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {areas.map((area) => {
              const active = area.id === areaId;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setAreaId(area.id)}
                  className="rounded-2xl"
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: active ? colors.emberTint : colors.surface,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? colors.ember : colors.line,
                  }}
                >
                  <AppText
                    family="archivo"
                    weight="bold"
                    style={{ fontSize: 14, color: active ? colors.emberDeep : colors.textStrong }}
                  >
                    {area.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </AuthShell>
  );
}
