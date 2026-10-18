import { View } from "react-native";
import { EmptyState } from "@/components/layout/ScreenState";
import { LockIcon } from "@/components/ui/icons/social";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { SocialFeedItem } from "@/services/http/types";
import { SOCIAL_ART } from "../../art";
import { NavRow } from "../NavRow";
import { SocialSectionTitle } from "../SocialSectionTitle";
import { TabError, TabLoading } from "../TabState";
import { FeaturedInsightCard, InsightCard } from "./InsightCards";

type ActivityTabProps = {
  items: SocialFeedItem[];
  loading: boolean;
  error: string | null;
  /** Sem amigos o vazio convida a encontrar alguém; com amigos, a esperar a semana fechar. */
  hasFriends: boolean;
  onRetry: () => void;
  onToggleLike: (insightId: string) => void;
  onFindFriends: () => void;
  onOpenSharing: () => void;
};

/** A aba Atividade: o resumo semanal de cada amigo, o mais novo em destaque. */
export function ActivityTab({
  items,
  loading,
  error,
  hasFriends,
  onRetry,
  onToggleLike,
  onFindFriends,
  onOpenSharing,
}: ActivityTabProps) {
  const { colors } = useTheme();

  if (loading && items.length === 0) return <TabLoading />;
  if (error && items.length === 0) return <TabError message={error} onRetry={onRetry} />;

  const [featured, ...rest] = items;

  return (
    <View style={{ paddingTop: 22 }}>
      <SocialSectionTitle title="Dos seus amigos" />

      {featured ? (
        <View style={{ gap: 14 }}>
          <FeaturedInsightCard item={featured} onToggleLike={() => onToggleLike(featured.id)} />
          {rest.map((item) => (
            <InsightCard key={item.id} item={item} onToggleLike={() => onToggleLike(item.id)} />
          ))}
        </View>
      ) : (
        <View
          className="mx-5 rounded-[24px]"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}
        >
          {hasFriends ? (
            <EmptyState
              image={SOCIAL_ART.conversa}
              title="Nada por aqui ainda"
              description="Quando um amigo fechar a semana, o resumo do Avant aparece aqui."
            />
          ) : (
            <EmptyState
              image={SOCIAL_ART.conversa}
              title="A atividade dos amigos aparece aqui"
              description="Adicione alguém pelo @usuário para acompanhar a semana um do outro."
              action={{ label: "Encontrar amigos", onPress: onFindFriends }}
            />
          )}
        </View>
      )}

      <View className="mx-5" style={{ marginTop: 14 }}>
        <NavRow
          icon={<LockIcon color={colors.text} />}
          label="O que compartilhar"
          accessibilityHint="Mostra o que seus amigos veem sobre você"
          onPress={onOpenSharing}
        />
      </View>
    </View>
  );
}
