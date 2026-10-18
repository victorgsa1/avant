import { useCallback, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Pressable } from "@/components/ui/Pressable";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { SettingsSection } from "@/components/ui/SettingsRow";
import { CheckmarkIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { chatApi, friendsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/**
 * Duas telas em uma: criar grupo (sem parâmetro) e adicionar pessoas a um
 * grupo existente (`conversationId`). O seletor é o mesmo, e só amigos
 * aparecem — a mesma regra que o backend aplica de qualquer jeito.
 */
export default function NewGroupScreen() {
  const { colors } = useTheme();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  const isAdding = typeof conversationId === "string" && conversationId.length > 0;

  const friends = useAsyncResource(useCallback(() => friendsApi.list(), []));

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (userId: string) => {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const submit = async () => {
    if (selected.length === 0) {
      setError("Escolha pelo menos uma pessoa.");
      return;
    }
    if (!isAdding && title.trim().length < 2) {
      setError("Dê um nome ao grupo.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isAdding) {
        await chatApi.addParticipants(conversationId, selected);
        router.back();
        return;
      }

      const conversation = await chatApi.createGroup({
        title: title.trim(),
        memberIds: selected,
      });
      router.replace(`/chat/${conversation.id}`);
    } catch (caught) {
      setError(userMessage(caught));
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeader
        title={isAdding ? "Adicionar pessoas" : "Novo grupo"}
        onBack={() => router.back()}
      />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {!isAdding ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <TextField
              label="Nome do grupo"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              placeholder="Ex.: Treino da manhã"
            />
          </View>
        ) : null}

        <SettingsSection title="Amigos">
          {(friends.data ?? []).length === 0 ? (
            <EmptyState
              title="Nenhum amigo ainda"
              description="Adicione amigos na aba Social para criar um grupo."
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
            label={isAdding ? `Adicionar ${selected.length || ""}`.trim() : "Criar grupo"}
            withArrow={false}
            loading={saving}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
