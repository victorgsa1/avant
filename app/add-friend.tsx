import { ActivityIndicator, Image, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { SearchIcon } from "@/components/ui/icons";
import { LinkIcon } from "@/components/ui/icons/social";
import { Pressable } from "@/components/ui/Pressable";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fonts } from "@/constants/theme";
import { SOCIAL_ART } from "@/features/social/art";
import { NavRow } from "@/features/social/components/NavRow";
import { ActionError } from "@/features/social/components/TabState";
import { useInviteLink } from "@/features/social/hooks/useInviteLink";
import { MIN_QUERY, useUserSearch } from "@/features/social/hooks/useUserSearch";
import type { SocialRelation, UserSearchResult } from "@/services/http/types";

const RELATION_LABEL: Record<SocialRelation, string> = {
  self: "Você",
  none: "Adicionar",
  friends: "Amigos",
  request_sent: "Enviado",
  request_received: "Aceitar",
};

function ResultRow({
  person,
  pending,
  onAdd,
}: {
  person: UserSearchResult;
  pending: boolean;
  onAdd: () => void;
}) {
  const { colors } = useTheme();
  const actionable = person.relation === "none" || person.relation === "request_received";

  return (
    <View
      className="flex-row items-center"
      style={{ gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line }}
    >
      <Avatar name={person.name} uri={person.avatarUrl} size={50} ring />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText family="archivo" weight="extraBold" numberOfLines={1} style={{ fontSize: 16, color: colors.text }}>
          {person.name}
        </AppText>
        <AppText family="manrope" weight="medium" numberOfLines={1} style={{ marginTop: 2, fontSize: 13.5, color: colors.textMuted }}>
          @{person.username} · nível {person.level}
        </AppText>
      </View>
      <Pressable
        onPress={onAdd}
        disabled={!actionable || pending}
        accessibilityRole="button"
        accessibilityLabel={actionable ? `${RELATION_LABEL[person.relation]} ${person.name}` : RELATION_LABEL[person.relation]}
        className="items-center justify-center rounded-full"
        style={{
          minWidth: 96,
          height: 40,
          paddingHorizontal: 16,
          backgroundColor: actionable ? colors.ember : "transparent",
          borderWidth: actionable ? 0 : 1.3,
          borderColor: colors.lineStrong,
        }}
      >
        {pending ? (
          <ActivityIndicator size="small" color={colors.onEmber} />
        ) : (
          <AppText
            family="archivo"
            weight="extraBold"
            style={{ fontSize: 13.5, color: actionable ? colors.onEmber : colors.textMuted }}
          >
            {RELATION_LABEL[person.relation]}
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Adicionar amigo: busca por @usuário. Também é o destino do link de
 * convite (`/add-friend?u=fulano`) — chega com a pessoa já buscada, e o
 * pedido só sai no toque em "Adicionar".
 */
export default function AddFriendScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string; u?: string }>();
  const search = useUserSearch(String(params.u ?? params.q ?? ""));
  const invite = useInviteLink();

  return (
    <Screen>
      <PageHeader title="Adicionar amigo" subtitle="Busque pelo @usuário" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
      >
        <View
          className="flex-row items-center"
          style={{
            gap: 12,
            height: 54,
            paddingHorizontal: 18,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <SearchIcon size={20} color={colors.textMuted} />
          <TextInput
            value={search.query}
            onChangeText={search.setQuery}
            placeholder="@usuario"
            placeholderTextColor={colors.textMuted}
            autoFocus={!params.u}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={colors.ember}
            accessibilityLabel="Buscar pessoas por @usuário"
            style={{
              flex: 1,
              padding: 0,
              fontFamily: fonts.manrope.medium,
              fontSize: 16,
              color: colors.textStrong,
              // Campo reciclado pelo iOS: zera o que outro campo possa ter deixado.
              letterSpacing: 0,
              textAlign: "left",
            }}
          />
          {search.searching ? <ActivityIndicator size="small" color={colors.textMuted} /> : null}
        </View>

        <ActionError message={search.error} />

        {search.term.length < MIN_QUERY ? (
          <View className="items-center" style={{ paddingTop: 34, paddingHorizontal: 16 }}>
            <Image source={SOCIAL_ART.conversa} resizeMode="contain" style={{ width: 96, height: 96 }} />
            <AppText
              family="manrope"
              weight="medium"
              style={{ marginTop: 12, fontSize: 14, lineHeight: 20, textAlign: "center", color: colors.textMuted }}
            >
              Digite o @usuário de quem você quer adicionar. Se a pessoa ainda não está no Avant, mande seu link.
            </AppText>
          </View>
        ) : null}

        {search.noResults ? (
          <AppText
            family="manrope"
            weight="medium"
            style={{ marginTop: 18, fontSize: 14, textAlign: "center", color: colors.textMuted }}
          >
            Ninguém encontrado com @{search.term}.
          </AppText>
        ) : null}

        <View style={{ marginTop: 8 }}>
          {search.results.map((person) => (
            <ResultRow
              key={person.id}
              person={person}
              pending={search.pendingId === person.id}
              onAdd={() => void search.addFriend(person)}
            />
          ))}
        </View>

        <View style={{ marginTop: 22 }}>
          <NavRow
            icon={<LinkIcon size={22} color={colors.text} />}
            label="Convidar por link"
            accessibilityHint="Compartilha um link para te adicionarem no Avant"
            onPress={() => void invite.share()}
          />
          <ActionError message={invite.error} />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
