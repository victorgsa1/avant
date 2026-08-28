import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { SearchIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fonts } from "@/constants/theme";
import { friendsApi } from "@/services/api";
import { userMessage } from "@/services/http/ApiError";
import type { SocialRelation, UserSearchResult } from "@/services/http/types";

const RELATION_LABEL: Record<SocialRelation, string | null> = {
  self: "Você",
  none: "Adicionar",
  friends: "Amigos",
  request_sent: "Enviado",
  request_received: "Aceitar",
};

const MIN_QUERY = 2;
const DEBOUNCE_MS = 350;

type FriendSearchProps = {
  /** Recarrega a lista de amigos/solicitações após uma ação. */
  onChanged: () => void;
};

/** Busca por @usuário e envio de solicitação. */
export function FriendSearch({ onChanged }: FriendSearchProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setError(null);
      return;
    }

    const current = ++generation.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await friendsApi.search(trimmed);
        if (current !== generation.current) return;
        setResults(found);
        setError(null);
      } catch (caught) {
        if (current !== generation.current) return;
        setError(userMessage(caught));
      } finally {
        if (current === generation.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const act = useCallback(
    async (user: UserSearchResult) => {
      if (user.relation === "self" || user.relation === "friends" || user.relation === "request_sent") {
        return;
      }
      setPendingId(user.id);
      setError(null);
      try {
        // "Aceitar" e "adicionar" são a mesma chamada: o backend aceita
        // automaticamente quando já existe um pedido na direção contrária.
        await friendsApi.sendRequest(user.username);
        setResults((current) =>
          current.map((item) =>
            item.id === user.id
              ? { ...item, relation: user.relation === "request_received" ? "friends" : "request_sent" }
              : item,
          ),
        );
        onChanged();
      } catch (caught) {
        setError(userMessage(caught));
      } finally {
        setPendingId(null);
      }
    },
    [onChanged],
  );

  return (
    <View className="px-6" style={{ paddingTop: 14 }}>
      <View
        className="flex-row items-center rounded-2xl"
        style={{
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 14,
          paddingHorizontal: 15,
        }}
      >
        <SearchIcon />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por @usuário"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.ember}
          style={{
            flex: 1,
            padding: 0,
            fontFamily: fonts.manrope.medium,
            fontSize: 13.5,
            color: colors.textStrong,
          }}
        />
        {searching ? <ActivityIndicator size="small" color={colors.textFaint} /> : null}
      </View>

      {error ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 10, fontSize: 12.5, color: colors.danger }}
        >
          {error}
        </AppText>
      ) : null}

      {query.trim().length >= MIN_QUERY && !searching && results.length === 0 && !error ? (
        <AppText
          family="manrope"
          weight="medium"
          style={{ marginTop: 12, fontSize: 12.5, color: colors.textMuted }}
        >
          Ninguém encontrado com esse @usuário.
        </AppText>
      ) : null}

      {results.map((user) => {
        const label = RELATION_LABEL[user.relation];
        const actionable = user.relation === "none" || user.relation === "request_received";
        return (
          <View
            key={user.id}
            className="flex-row items-center"
            style={{
              gap: 13,
              paddingVertical: 13,
              borderBottomWidth: 1,
              borderBottomColor: colors.surfaceSunken,
            }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 36, height: 36, backgroundColor: colors.surfaceSunken }}
            >
              <AppText family="archivo" weight="extraBold" style={{ fontSize: 13.5, color: colors.textMuted }}>
                {user.name.charAt(0).toUpperCase()}
              </AppText>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText family="archivo" weight="bold" style={{ fontSize: 14, letterSpacing: -0.2, color: colors.text }}>
                {user.name}
              </AppText>
              <AppText family="manrope" weight="medium" style={{ marginTop: 2, fontSize: 11.5, color: colors.textMuted }}>
                @{user.username} · nível {user.level}
              </AppText>
            </View>

            <Pressable
              onPress={() => void act(user)}
              disabled={!actionable || pendingId === user.id}
              className="rounded-full"
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                backgroundColor: actionable ? colors.ember : colors.surfaceSunken,
                opacity: pendingId === user.id ? 0.6 : 1,
              }}
            >
              <AppText
                family="archivo"
                weight="extraBold"
                style={{ fontSize: 12, color: actionable ? colors.onEmber : colors.textMuted }}
              >
                {label}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
