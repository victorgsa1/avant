import { useCallback, useState } from "react";
import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { AdaptiveIcon, SparkleIcon } from "@/components/ui/icons";
import { TrashIcon } from "@/components/ui/icons/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsLead,
  SettingsMessage,
  SettingsPill,
  SettingsSwitch,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { engineApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import { confirmAction } from "@/services/native/confirm";
import type { EnginePrivacy, LearnedMemory } from "@/services/http/types";

const NOTEBOOK = require("../../assets/onboarding/caderno.png");

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

function MemoryRow({
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
  const canConfirm = !memory.confirmed && memory.kind !== "EXPLICIT_FACT";

  return (
    <View style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 8, opacity: busy ? 0.5 : 1 }}>
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 12.5, color: colors.emberInk }}>
        {evidenceLabel(memory)}
      </AppText>
      <AppText family="manrope" weight="semiBold" style={{ fontSize: 15, lineHeight: 21, color: colors.text }}>
        {memory.statement}
      </AppText>
      {memory.habitTitle ? (
        <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.textMuted }}>
          Sobre “{memory.habitTitle}”
        </AppText>
      ) : null}
      <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: 4 }}>
        {canConfirm ? (
          <SettingsPill label={isStrategy ? "Manter" : "Isso faz sentido"} tone="accent" disabled={busy} onPress={onConfirm} />
        ) : null}
        <SettingsPill label={isStrategy ? "Remover" : "Não é mais verdade"} disabled={busy} onPress={onReject} />
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
    privacy.mutate((current) => ({ ...current, ...input }));
    void engineApi
      .updatePrivacy(input)
      .then((updated) => privacy.mutate(() => updated))
      .catch((caught) => {
        setError(userMessage(caught));
        void privacy.refresh();
      });
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

  const list = memories.data;

  return (
    <SettingsPage
      title="O que o Avant aprendeu"
      subtitle="Padrões, memórias e o que o Avant pode analisar"
      loading={memories.loading && !list}
      error={!list ? (memories.error ?? "Não foi possível carregar.") : null}
      onRetry={() => void memories.refresh()}
      refreshing={memories.refreshing}
      onRefresh={() => void Promise.all([memories.refresh(), privacy.refresh()])}
    >
      <SettingsLead>
        Quanto mais tempo o Avant está com você, mais ele entende o que faz você continuar. Se algo aqui não combina
        mais com você, é só dizer.
      </SettingsLead>

      <SettingsGroup title="Memórias">
        {list && list.length > 0 ? (
          list.map((memory) => (
            <MemoryRow
              key={memory.id}
              memory={memory}
              busy={busyId === memory.id}
              onConfirm={() => respond(memory, "confirm")}
              onReject={() => respond(memory, "reject")}
            />
          ))
        ) : (
          <SettingsBlock style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Image source={NOTEBOOK} style={{ width: 52, height: 58 }} resizeMode="contain" />
            <AppText
              family="manrope"
              weight="semiBold"
              style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.textMuted }}
            >
              Ainda estou conhecendo você. Os padrões aparecem aqui conforme o seu dia a dia.
            </AppText>
          </SettingsBlock>
        )}
      </SettingsGroup>

      {privacy.data ? (
        <SettingsGroup
          title="Adaptação e análise"
          footer="Desligar a adaptação faz o Avant parar de ajustar o plano pelo seu comportamento. Na análise aprofundada, o serviço externo recebe só números e trechos mínimos, sem nome, e-mail, fotos ou localização."
        >
          <SettingsSwitch
            icon={AdaptiveIcon}
            title="Adaptar o plano a mim"
            subtitle="Ajusta horários e carga pelo que acontece de verdade."
            value={privacy.data.adaptivePersonalization}
            onChange={(adaptivePersonalization) => updatePrivacy({ adaptivePersonalization })}
          />
          <SettingsSwitch
            icon={SparkleIcon}
            title="Permitir análise aprofundada"
            subtitle="Um serviço externo ajuda a entender quedas e sugerir ajustes."
            value={privacy.data.aiProcessing}
            onChange={(aiProcessing) => updatePrivacy({ aiProcessing })}
          />
        </SettingsGroup>
      ) : null}

      <SettingsGroup tone="danger">
        <SettingsItem icon={TrashIcon} tone="danger" title="Apagar o que o Avant aprendeu" onPress={wipe} />
      </SettingsGroup>

      <SettingsMessage message={error} />
    </SettingsPage>
  );
}
