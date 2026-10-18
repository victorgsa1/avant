import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { Pressable } from "@/components/ui/Pressable";
import { SettingsRow, SettingsSection, SettingsToggle } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { engineApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import { confirmAction } from "@/services/native/confirm";
import type { EnginePrivacy, LearnedMemory } from "@/services/http/types";

const KIND_LABEL: Record<LearnedMemory["kind"], string> = {
  EXPLICIT_FACT: "Você me contou",
  OBSERVED_PATTERN: "Percebi",
  USER_CONFIRMED_PATTERN: "Você confirmou",
  SUCCESSFUL_STRATEGY: "Tem funcionado",
  MODEL_HYPOTHESIS: "Hipótese",
};

function evidenceLabel(memory: LearnedMemory): string {
  if (memory.kind === "EXPLICIT_FACT") return KIND_LABEL.EXPLICIT_FACT;
  const base = `${KIND_LABEL[memory.kind]} · baseado em ${memory.evidenceCount} ${memory.evidenceCount === 1 ? "registro" : "registros"}`;
  return memory.status === "HYPOTHESIS" ? `${base} · ainda confirmando` : base;
}

function MemoryCard({
  memory,
  busy,
  onConfirm,
  onReject,
}: {
  memory: LearnedMemory;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const { colors } = useTheme();
  const isStrategy = memory.kind === "SUCCESSFUL_STRATEGY";

  return (
    <View
      style={{
        marginTop: 10,
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        opacity: busy ? 0.55 : 1,
        gap: 10,
      }}
    >
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 14.5, lineHeight: 20, color: colors.text }}>
        {memory.statement}
      </AppText>
      <AppText family="manrope" weight="medium" style={{ fontSize: 12, color: colors.textMuted }}>
        {evidenceLabel(memory)}
      </AppText>

      <View className="flex-row" style={{ gap: 18 }}>
        {memory.confirmed || memory.kind === "EXPLICIT_FACT" ? null : (
          <Pressable onPress={onConfirm} disabled={busy}>
            <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.ember }}>
              {isStrategy ? "Manter" : "Isso faz sentido"}
            </AppText>
          </Pressable>
        )}
        <Pressable onPress={onReject} disabled={busy}>
          <AppText family="manrope" weight="bold" style={{ fontSize: 13, color: colors.textMuted }}>
            {isStrategy ? "Remover" : "Não é mais verdade"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * "O que o Avant aprendeu sobre você."
 *
 * Toda memória do motor adaptativo aparece aqui com a evidência que a
 * sustenta, e a pessoa pode confirmar, dizer que não é mais verdade ou apagar
 * tudo. É confiança, transparência e LGPD — e cada resposta vira um sinal
 * melhor para o motor.
 */
export default function LearnedScreen() {
  const { colors } = useTheme();
  const memories = useAsyncResource(useCallback(() => engineApi.memory(), []));
  const privacy = useAsyncResource(useCallback(() => engineApi.privacy(), []));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const respond = (memory: LearnedMemory, response: "confirm" | "reject") => {
    setBusyId(memory.id);
    setError(null);
    const request = response === "confirm" ? engineApi.confirmMemory(memory.id) : engineApi.rejectMemory(memory.id);
    void request
      .then(() => memories.refresh())
      .catch((caught) => setError(userMessage(caught)))
      .finally(() => setBusyId(null));
  };

  const updatePrivacy = (input: Partial<Pick<EnginePrivacy, "adaptivePersonalization" | "aiProcessing">>) => {
    setError(null);
    void engineApi
      .updatePrivacy(input)
      .then(() => privacy.refresh())
      .catch((caught) => setError(userMessage(caught)));
  };

  const wipe = () =>
    confirmAction({
      title: "Apagar o que o Avant aprendeu?",
      message:
        "Padrões, estratégias e o estado do seu plano serão apagados. Suas ações concluídas continuam no histórico.",
      confirmLabel: "Apagar",
      destructive: true,
      onConfirm: () => {
        void engineApi
          .wipeMemory()
          .then(() => memories.refresh())
          .catch((caught) => setError(userMessage(caught)));
      },
    });

  if (memories.loading && !memories.data) {
    return (
      <Screen>
        <PageHeader title="O que o Avant aprendeu" onBack={() => router.back()} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (!memories.data) {
    return (
      <Screen>
        <PageHeader title="O que o Avant aprendeu" onBack={() => router.back()} />
        <ScreenError
          message={memories.error ?? "Não foi possível carregar."}
          onRetry={() => void memories.refresh()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="O que o Avant aprendeu" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <AppText family="manrope" weight="medium" style={{ fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}>
            Quanto mais tempo o Avant está com você, mais ele entende o que faz você continuar. Se algo aqui não
            combina mais com você, é só dizer.
          </AppText>

          {memories.data.length === 0 ? (
            <AppText family="manrope" weight="semiBold" style={{ marginTop: 18, fontSize: 14, color: colors.text }}>
              Ainda estou conhecendo você. Os padrões aparecem aqui conforme o seu dia a dia.
            </AppText>
          ) : (
            memories.data.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                busy={busyId === memory.id}
                onConfirm={() => respond(memory, "confirm")}
                onReject={() => respond(memory, "reject")}
              />
            ))
          )}
        </View>

        {privacy.data ? (
          <SettingsSection
            title="PERSONALIZAÇÃO"
            footer="Desligar a adaptação faz o Avant parar de ajustar o plano pelo seu comportamento. A IA, quando usada, recebe só números e trechos mínimos, sem nome, e-mail, fotos ou localização."
          >
            <SettingsToggle
              label="Adaptar o plano ao meu comportamento"
              value={privacy.data.adaptivePersonalization}
              onChange={(adaptivePersonalization) => updatePrivacy({ adaptivePersonalization })}
            />
            <SettingsToggle
              label="Permitir análise por IA"
              value={privacy.data.aiProcessing}
              last
              onChange={(aiProcessing) => updatePrivacy({ aiProcessing })}
            />
          </SettingsSection>
        ) : null}

        <SettingsSection>
          <SettingsRow label="Apagar o que o Avant aprendeu" destructive last onPress={wipe} />
        </SettingsSection>

        {error ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 14, paddingHorizontal: 24, fontSize: 12.5, color: colors.danger }}
          >
            {error}
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
