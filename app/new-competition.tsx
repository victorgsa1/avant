import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Pressable } from "@/components/ui/Pressable";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { OptionPills, SettingsSection } from "@/components/ui/SettingsRow";
import { CheckmarkIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { competitionsApi, friendsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

const DURATIONS = [
  { value: "7", label: "7 dias" },
  { value: "14", label: "14 dias" },
  { value: "30", label: "30 dias" },
];

/**
 * Criar competição.
 *
 * Só amigos aceitos podem ser convidados — é a mesma regra do backend, que
 * descarta em silêncio qualquer ID fora disso. A métrica é consistência,
 * então a tela diz isso explicitamente: não é sobre quem faz mais.
 */
export default function NewCompetitionScreen() {
  const { colors } = useTheme();
  const friends = useAsyncResource(useCallback(() => friendsApi.list(), []));

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("7");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const toggle = (userId: string) => {
    setSelected((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const create = async () => {
    if (title.trim().length < 3) {
      setError("Dê um nome à competição.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const competition = await competitionsApi.create({
        title: title.trim(),
        durationDays: Number(duration) as 7 | 14 | 30,
        inviteeIds: selected,
      });
      router.replace(`/competition/${competition.id}`);
    } catch (caught) {
      setError(userMessage(caught));
      setCreating(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Nova competição" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>
          <TextField
            label="Nome"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
            placeholder="Ex.: Semana de consistência"
          />
        </View>

        <SettingsSection
          title="DURAÇÃO"
          footer="Vence quem tiver a maior consistência média — aderência ao próprio plano, não volume de ações."
        >
          <OptionPills options={DURATIONS} value={duration} onChange={setDuration} />
        </SettingsSection>

        <SettingsSection title="CONVIDAR AMIGOS">
          {(friends.data ?? []).length === 0 ? (
            <EmptyState
              title="Você ainda não tem amigos no Avant"
              description="Dá para criar a competição assim mesmo e convidar depois."
            />
          ) : null}

          {(friends.data ?? []).map((friend, index, list) => {
            const active = selected.includes(friend.id);
            return (
              <Pressable
                key={friend.id}
                onPress={() => toggle(friend.id)}
                className="flex-row items-center"
                style={{
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 17,
                  borderBottomWidth: index === list.length - 1 ? 0 : 1,
                  borderBottomColor: colors.line,
                }}
              >
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: active ? colors.ember : "transparent",
                    borderWidth: active ? 0 : 1.3,
                    borderColor: colors.lineStrong,
                  }}
                >
                  {active ? <CheckmarkIcon color={colors.onEmber} /> : null}
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText family="archivo" weight="bold" style={{ fontSize: 14.5, color: colors.text }}>
                    {friend.name}
                  </AppText>
                  <AppText
                    family="manrope"
                    weight="medium"
                    style={{ marginTop: 2, fontSize: 12, color: colors.textFaint }}
                  >
                    @{friend.username}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </SettingsSection>

        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 12 }}>
          {error ? (
            <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
              {error}
            </AppText>
          ) : null}

          <PrimaryButton
            label={selected.length > 0 ? `Criar e convidar ${selected.length}` : "Criar competição"}
            withArrow={false}
            loading={creating}
            onPress={() => void create()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
