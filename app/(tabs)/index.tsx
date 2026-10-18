import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { WeekStrip } from "@/components/ui/WeekStrip";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { AdaptationCard } from "@/features/home/components/AdaptationCard";
import { ComplementaryList } from "@/features/home/components/ComplementaryList";
import { HomeGreeting } from "@/features/home/components/HomeGreeting";
import { HomeTopBar } from "@/features/home/components/HomeTopBar";
import { PrimaryActionCard } from "@/features/home/components/PrimaryActionCard";
import { PrimaryDoneCard } from "@/features/home/components/PrimaryDoneCard";
import { SkipReasonSheet } from "@/features/home/components/SkipReasonSheet";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import type { ActionVariantType, SkipReasonCode } from "@/services/http/types";

function StatusCard({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}) {
  const { colors } = useTheme();
  return (
    <View className="px-5" style={{ marginTop: 24 }}>
      <View
        className="rounded-[26px]"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
      >
        <EmptyState title={title} description={description} action={action} />
      </View>
    </View>
  );
}

export default function HojeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const {
    view,
    loading,
    refreshing,
    error,
    refresh,
    refreshWithEngine,
    toggleTask,
    skipTask,
    respondToAdaptation,
    answerFriction,
    adaptationBusyId,
    resumePausedPrimary,
    resumingPaused,
    actionError,
  } = useHomeData();

  // Qual versão a pessoa vai fazer hoje. Vive na tela porque é decisão do
  // momento: só vira fato no servidor quando a principal é concluída.
  const [chosenVariant, setChosenVariant] = useState<ActionVariantType | null>(null);

  /**
   * Pular abre "o que atrapalhou?" — é uma decisão sobre o próprio dia, não
   * um toque acidental, e o motivo em um toque é o que permite ao Avant
   * ajustar certo (horário x tamanho x prioridade) sem adivinhar.
   */
  const [skipping, setSkipping] = useState<{ id: string; title: string } | null>(null);
  const finishSkip = (reasonCode?: SkipReasonCode) => {
    if (skipping) skipTask(skipping.id, reasonCode);
    setSkipping(null);
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatarInitial = (user?.name ?? "?").trim().charAt(0).toUpperCase();
  const primary = view?.primaryAction ?? null;

  // A escolha local só vale enquanto a versão existir no plano do dia —
  // depois de um refresh que troque o hábito, volta para a planejada.
  const selectedVariant =
    chosenVariant && primary?.variants.some((variant) => variant.type === chosenVariant)
      ? chosenVariant
      : (primary?.plannedVariant ?? null);

  const selectedMinutes =
    primary?.variants.find((variant) => variant.type === selectedVariant)?.minutes ??
    primary?.minutes ??
    null;

  if (loading && !view) {
    return (
      <Screen>
        <HomeTopBar avatarInitial={avatarInitial} hasNotification={false} />
        <ScreenLoading />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen>
        <HomeTopBar avatarInitial={avatarInitial} hasNotification={false} />
        <ScreenError message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  if (!view) return null;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshWithEngine()}
            tintColor={colors.ember}
          />
        }
      >
        <HomeTopBar
          avatarInitial={avatarInitial}
          hasNotification={view.unreadNotifications > 0}
          onPressBell={() => router.push("/notifications")}
        />

        <HomeGreeting greeting={view.greeting} name={firstName} dateLabel={view.dateLabel} />

        <View className="px-6" style={{ marginTop: 24 }}>
          <WeekStrip days={view.week} />
        </View>

        {/* Linguagem nunca punitiva: uma retomada é informação, não castigo. */}
        {view.recovery ? (
          <View className="px-5" style={{ marginTop: 22 }}>
            <View className="rounded-[22px]" style={{ padding: 16, backgroundColor: colors.emberWash }}>
              <AppText
                family="manrope"
                weight="semiBold"
                style={{ fontSize: 13, lineHeight: 19.5, color: colors.emberDeep }}
              >
                {view.recovery.missedDays > 1
                  ? "Alguns dias ficaram para trás. Hoje vale o mínimo."
                  : "Ontem não aconteceu. Hoje é um bom dia para voltar."}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* A principal: uma por dia, concluída com foto + localização. */}
        {primary && primary.status === "PLANNED" ? (
          <PrimaryActionCard
            timeLabel={primary.timeLabel}
            title={primary.title}
            iconKey={primary.iconKey}
            detail={primary.detail}
            variants={primary.variants}
            selectedType={selectedVariant}
            onSelectVariant={setChosenVariant}
            onComplete={() =>
              router.push({
                pathname: "/complete-action/[id]",
                params: {
                  id: primary.id,
                  title: primary.title,
                  minutes: selectedMinutes !== null ? String(selectedMinutes) : "",
                  variantType: selectedVariant ?? "",
                },
              })
            }
            onAdjust={() => router.push("/settings/habits")}
            onSkip={() => setSkipping({ id: primary.id, title: primary.title })}
          />
        ) : primary && primary.status === "COMPLETED" ? (
          <PrimaryDoneCard
            title={primary.title}
            completedAt={primary.completedAt}
            xp={primary.awardedXp}
            streakDays={view.streakDays}
          />
        ) : primary ? (
          <StatusCard title="Principal pulada hoje" description="Amanhã ela volta." />
        ) : view.pausedPrimary ? (
          // Pausar não é descanso: a principal só volta quando a pessoa retomar.
          <StatusCard
            title="Sua principal está pausada"
            description={`"${view.pausedPrimary.title}" fica fora do seu dia até você retomar.`}
            action={{
              label: resumingPaused ? "Retomando…" : "Retomar agora",
              onPress: resumePausedPrimary,
            }}
          />
        ) : (
          <StatusCard title="Dia de descanso" description="A principal volta amanhã." />
        )}

        {/* O motor adaptativo aparece aqui e em nenhum outro lugar. */}
        {view.adaptations.map((proposal) => (
          <AdaptationCard
            key={proposal.id}
            proposal={proposal}
            busy={adaptationBusyId === proposal.id}
            onApply={(id) => respondToAdaptation(id, "apply")}
            onDismiss={(id) => respondToAdaptation(id, "dismiss")}
            onAnswer={answerFriction}
            onOpenLearned={() => router.push("/settings/learned")}
          />
        ))}

        {view.tasks.length > 0 ? (
          <ComplementaryList
            tasks={view.tasks}
            doneCount={view.doneCount}
            totalTasks={view.totalTasks}
            onToggle={toggleTask}
            onSkip={(id) =>
              setSkipping({ id, title: view.tasks.find((task) => task.id === id)?.label ?? "" })
            }
          />
        ) : null}

        <SkipReasonSheet
          visible={skipping != null}
          actionTitle={skipping?.title ?? null}
          onSelect={(code) => finishSkip(code)}
          onSkipWithoutReason={() => finishSkip()}
          onClose={() => setSkipping(null)}
        />

        {actionError ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{
              marginTop: 12,
              paddingHorizontal: 26,
              fontSize: 12.5,
              textAlign: "center",
              color: colors.danger,
            }}
          >
            {actionError}
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
