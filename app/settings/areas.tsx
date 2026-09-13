import { useCallback, useState } from "react";
import { Alert, Platform, RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ScreenError, ScreenLoading } from "@/components/layout/ScreenState";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { SettingsRow, SettingsSection } from "@/components/ui/SettingsRow";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { areasApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";

/**
 * Áreas da vida que a pessoa acompanha. Remover é desativação lógica no
 * backend — o histórico dos hábitos ligados a ela continua de pé.
 */
export default function AreasScreen() {
  const { colors } = useTheme();
  const areas = useAsyncResource(useCallback(() => areasApi.list(), []));

  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEditingId(null);
    setName("");
    setWhy("");
  };

  const submit = async () => {
    if (name.trim().length < 2) {
      setError("Dê um nome à área.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await areasApi.update(editingId, { name: name.trim(), whyImportant: why.trim() || undefined });
      } else {
        await areasApi.create({ name: name.trim(), whyImportant: why.trim() || undefined });
      }
      reset();
      await areas.refresh();
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string, label: string) => {
    const run = () => {
      void areasApi
        .remove(id)
        .then(() => areas.refresh())
        .catch((caught) => setError(userMessage(caught)));
    };

    if (Platform.OS === "web") {
      run();
      return;
    }
    Alert.alert(`Remover "${label}"?`, "Os hábitos ligados a ela continuam existindo.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: run },
    ]);
  };

  return (
    <Screen>
      <PageHeader title="Áreas" onBack={() => router.back()} />

      {areas.loading && !areas.data ? <ScreenLoading /> : null}
      {areas.error && !areas.data ? (
        <ScreenError message={areas.error} onRetry={() => void areas.refresh()} />
      ) : null}

      {areas.data ? (
        <KeyboardAwareScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={areas.refreshing}
              onRefresh={() => void areas.refresh()}
              tintColor={colors.ember}
            />
          }
        >
          <SettingsSection title="SUAS ÁREAS">
            {areas.data.length === 0 ? (
              <EmptyState
                title="Nenhuma área ainda"
                description="Áreas agrupam seus hábitos por parte da vida."
              />
            ) : null}

            {areas.data.map((area, index, list) => (
              <SettingsRow
                key={area.id}
                label={area.name}
                description={area.whyImportant}
                value="Editar"
                last={index === list.length - 1}
                onPress={() => {
                  setEditingId(area.id);
                  setName(area.name);
                  setWhy(area.whyImportant ?? "");
                }}
              />
            ))}
          </SettingsSection>

          <View style={{ paddingHorizontal: 20, paddingTop: 26, gap: 14 }}>
            <AppText
              family="archivo"
              weight="extraBold"
              style={{ fontSize: 13, letterSpacing: 0.2, color: colors.textMuted, paddingLeft: 4 }}
            >
              {editingId ? "EDITAR ÁREA" : "NOVA ÁREA"}
            </AppText>

            <TextField label="Nome" value={name} onChangeText={setName} maxLength={80} />
            <TextField
              label="Por que importa"
              value={why}
              onChangeText={setWhy}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {error ? (
              <AppText family="manrope" weight="medium" style={{ fontSize: 12.5, color: colors.danger }}>
                {error}
              </AppText>
            ) : null}

            <PrimaryButton
              label={editingId ? "Salvar alterações" : "Adicionar área"}
              withArrow={false}
              loading={saving}
              onPress={() => void submit()}
            />

            {editingId ? (
              <>
                <SettingsSection>
                  <SettingsRow
                    label="Remover esta área"
                    destructive
                    last
                    onPress={() => {
                      remove(editingId, name);
                      reset();
                    }}
                  />
                </SettingsSection>
                <PrimaryButton label="Cancelar edição" withArrow={false} onPress={reset} />
              </>
            ) : null}
          </View>
        </KeyboardAwareScrollView>
      ) : null}
    </Screen>
  );
}
