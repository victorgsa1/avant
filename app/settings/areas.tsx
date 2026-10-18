import { useCallback, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/layout/ScreenState";
import { PlusLineIcon } from "@/components/ui/icons";
import { TrashIcon } from "@/components/ui/icons/settings";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { areaIconFor } from "@/features/settings/areaIcons";
import {
  SettingsBlock,
  SettingsGroup,
  SettingsItem,
  SettingsMessage,
  SettingsPill,
} from "@/features/settings/components/SettingsGroup";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { areasApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { AreaResponse } from "@/services/http/types";
import { confirmAction } from "@/services/native/confirm";

/**
 * Áreas da vida que a pessoa acompanha. Remover é desativação lógica no
 * backend — o histórico dos hábitos ligados a ela continua de pé.
 *
 * Um formulário só, para criar e para editar: tocar numa área carrega ela
 * nos campos; o formulário aparece quando há algo para preencher.
 */
export default function AreasScreen() {
  const areas = useAsyncResource(useCallback(() => areasApi.list(), []));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AreaResponse | null>(null);
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const close = () => {
    setFormOpen(false);
    setEditing(null);
    setName("");
    setWhy("");
    setError(null);
  };

  const startEditing = (area: AreaResponse) => {
    setEditing(area);
    setName(area.name);
    setWhy(area.whyImportant ?? "");
    setError(null);
    setFormOpen(true);
  };

  const startCreating = () => {
    setEditing(null);
    setName("");
    setWhy("");
    setError(null);
    setFormOpen(true);
  };

  const submit = async () => {
    if (name.trim().length < 2) {
      setError("Dê um nome à área.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const input = { name: name.trim(), whyImportant: why.trim() || undefined };
      if (editing) await areasApi.update(editing.id, input);
      else await areasApi.create(input);
      close();
      await areas.refresh();
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const remove = (area: AreaResponse) =>
    confirmAction({
      title: `Remover "${area.name}"?`,
      message: "Os hábitos ligados a ela continuam existindo.",
      confirmLabel: "Remover",
      destructive: true,
      onConfirm: () => {
        close();
        void areasApi
          .remove(area.id)
          .then(() => areas.refresh())
          .catch((caught) => setError(userMessage(caught)));
      },
    });

  const list = areas.data;

  return (
    <SettingsPage
      title="Áreas da vida"
      subtitle="Organize o que quer cuidar"
      keyboard
      loading={areas.loading && !list}
      error={!list ? areas.error : null}
      onRetry={() => void areas.refresh()}
      refreshing={areas.refreshing}
      onRefresh={() => void areas.refresh()}
    >
      <SettingsGroup
        title="Suas áreas"
        footer={list && list.length > 0 ? "Áreas agrupam seus hábitos por parte da vida. Toque numa para editar." : undefined}
      >
        {list && list.length === 0 ? (
          <EmptyState title="Nenhuma área ainda" description="Áreas agrupam seus hábitos por parte da vida." />
        ) : null}
        {(list ?? []).map((area) => (
          <SettingsItem
            key={area.id}
            icon={areaIconFor(area.name)}
            title={area.name}
            subtitle={area.whyImportant}
            value={editing?.id === area.id ? "Editando" : null}
            onPress={() => startEditing(area)}
          />
        ))}
        {!formOpen ? <SettingsItem icon={PlusLineIcon} title="Adicionar uma área" chevron={false} onPress={startCreating} /> : null}
      </SettingsGroup>

      {formOpen ? (
        <SettingsGroup title={editing ? "Editar área" : "Nova área"}>
          <SettingsBlock>
            <TextField label="Nome" value={name} onChangeText={setName} maxLength={80} autoFocus={!editing} />
            <TextField
              label="Por que importa"
              value={why}
              onChangeText={setWhy}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <PrimaryButton
              label={editing ? "Salvar alterações" : "Adicionar área"}
              withArrow={false}
              loading={saving}
              onPress={() => void submit()}
            />
            <View className="items-center">
              <SettingsPill label="Cancelar" onPress={close} />
            </View>
          </SettingsBlock>
          {editing ? (
            <SettingsItem icon={TrashIcon} tone="danger" title="Remover esta área" onPress={() => remove(editing)} />
          ) : null}
        </SettingsGroup>
      ) : null}

      <SettingsMessage message={error} />
    </SettingsPage>
  );
}
